"""Focused layout regressions; run with the PDF build's Python environment."""

import importlib.util
from pathlib import Path
import sys
import unittest
from xml.etree import ElementTree as ET

from reportlab.lib.geomutils import normalizeTRBL
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph


ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("build_pdf", ROOT / "scripts/build-pdf.py")
BUILDER = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = BUILDER
SPEC.loader.exec_module(BUILDER)


class PdfLayoutTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        for name, path in [
            ("NotoSerifSC-LifeLevelUp", BUILDER.ZH_REGULAR_FONT),
            ("NotoSerifSC-LifeLevelUp-Bold", BUILDER.ZH_BOLD_FONT),
            ("NotoSans-LifeLevelUp-IPA", BUILDER.ZH_IPA_FONT),
            # The English edition embeds the same OFL subsets under its own names.
            ("StillHereSerif", BUILDER.ZH_REGULAR_FONT),
            ("StillHereSerif-Bold", BUILDER.ZH_BOLD_FONT),
        ]:
            pdfmetrics.registerFont(TTFont(name, str(path)))

    def assert_line_widths(self, wrapped, style, available_width=BUILDER.CONTENT_WIDTH):
        _, right_padding, _, left_padding = normalizeTRBL(style.borderPadding)
        occupied = style.leftIndent + style.rightIndent + left_padding + right_padding
        for line in wrapped.split("\n"):
            measured = pdfmetrics.stringWidth(line, style.fontName, style.fontSize)
            self.assertLessEqual(measured + occupied, available_width + 1e-7, line)

    def test_chinese_headings_wrap_with_anchors_at_every_level(self):
        styles = BUILDER.style_sheet(BUILDER.EDITIONS[0])
        title = "从真实问题到可验证交付，让学习与实践穿过时间" * 4
        for key in ("h1", "h2", "h3", "h4"):
            with self.subTest(heading=key):
                style = styles[key]
                paragraph = Paragraph(f'<a name="example"/>{title}', style)
                _, height = paragraph.wrap(BUILDER.CONTENT_WIDTH, 1000)
                self.assertEqual(style.wordWrap, "CJK")
                self.assertGreater(height, style.leading)
                for line in paragraph.blPara.lines:
                    self.assertGreaterEqual(line.extraSpace, -1e-7)

    def test_english_styles_keep_their_normal_word_wrap(self):
        styles = BUILDER.style_sheet(BUILDER.EDITIONS[1])
        for key in ("h1", "h2", "h3", "h4"):
            self.assertNotEqual(styles[key].wordWrap, "CJK")

    def test_wide_template_rows_preserve_every_character(self):
        style = BUILDER.style_sheet(BUILDER.EDITIONS[1])["code"]
        source = "| ID | Type | Input/source | Expected behavior | Actual behavior/artifact | First-pass acceptance | Mandatory failure | Human revision minutes | Final state |"
        wrapped = BUILDER.wrap_preformatted_text(source, style)
        self.assertGreater(len(wrapped.splitlines()), 1)
        self.assertEqual(wrapped.replace("\n", ""), source)
        self.assertEqual(style.fontSize, 7.3)
        self.assert_line_widths(wrapped, style)

    def test_indented_long_tokens_keep_content_and_continuation_indent(self):
        style = BUILDER.style_sheet(BUILDER.EDITIONS[1])["code"]
        source = '    result = "https://example.test/' + "x" * 250 + '?a=1&b=<value>"'
        wrapped = BUILDER.wrap_preformatted_text(source, style)
        lines = wrapped.splitlines()
        self.assertGreater(len(lines), 1)
        self.assertTrue(all(line.startswith("    ") for line in lines))
        self.assertEqual(lines[0] + "".join(line[4:] for line in lines[1:]), source)
        self.assert_line_widths(wrapped, style)

    def test_chinese_code_uses_embedded_font_widths_and_padding(self):
        style = BUILDER.style_sheet(BUILDER.EDITIONS[0])["code"].clone("PaddedCode")
        style.leftIndent, style.rightIndent = 11, 13
        style.borderPadding = (3, 7, 4, 9)
        source = "输入材料：明确任务边界，记录预期行为与人工核验结果。" * 5
        wrapped = BUILDER.wrap_preformatted_text(source, style, 180)
        self.assertEqual(wrapped.replace("\n", ""), source)
        self.assert_line_widths(wrapped, style, 180)

    def test_existing_blank_lines_tabs_and_short_indentation_are_retained(self):
        style = BUILDER.style_sheet(BUILDER.EDITIONS[1])["code"]
        source = "first\n\n\tsecond\n    third\n"
        self.assertEqual(BUILDER.wrap_preformatted_text(source, style), source.replace("\t", "    "))

    def test_pre_conversion_escapes_after_wrapping_and_has_no_overflow(self):
        edition = BUILDER.EDITIONS[1]
        styles = BUILDER.style_sheet(edition)
        source = '<tag key="value">a & b > c</tag>' * 20
        parent = ET.Element("main")
        ET.SubElement(parent, "pre").text = source
        flowables = BUILDER.convert_children(parent, ROOT, "test.xhtml", styles, edition, {}, {"headings": 0})
        self.assertEqual(len(flowables), 1)
        block = flowables[0]
        decoded = "".join(fragment.text for fragment in block.frags)
        self.assertEqual(decoded.replace("\n", ""), source)
        width, height = block.wrap(BUILDER.CONTENT_WIDTH, 1000)
        self.assertLessEqual(width, BUILDER.CONTENT_WIDTH)
        self.assertGreater(height, styles["code"].leading)
        for line in block.blPara.lines:
            extra_space = line[0] if block.blPara.kind == 0 else line.extraSpace
            self.assertGreaterEqual(extra_space, -1e-7)


if __name__ == "__main__":
    unittest.main()
