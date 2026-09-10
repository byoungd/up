import importlib.util
from io import BytesIO
from pathlib import Path
import sys
import tempfile
import unittest
from xml.etree import ElementTree as ET

from pypdf import PdfReader
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import BaseDocTemplate, Frame, PageTemplate


ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("life_guide_pdf", ROOT / "scripts/build-pdf.py")
PDF = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = PDF
SPEC.loader.exec_module(PDF)


class PreformattedLayoutTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        pdfmetrics.registerFont(TTFont("NotoSerifSC-LifeLevelUp", str(PDF.ZH_REGULAR_FONT)))

    def render_code(self, source, edition):
        styles = PDF.style_sheet(edition)
        parent = ET.Element("main")
        ET.SubElement(parent, "pre").text = source
        story = PDF.convert_children(parent, Path(tempfile.gettempdir()), "fixture.xhtml", styles, edition, {}, {"headings": 0})
        output = BytesIO()
        doc = BaseDocTemplate(output, pagesize=PDF.PAGE_SIZE)
        frame = Frame(PDF.LEFT_MARGIN, PDF.BOTTOM_MARGIN, PDF.CONTENT_WIDTH, PDF.CONTENT_HEIGHT,
                      leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
        doc.addPageTemplates(PageTemplate(id="code", frames=[frame]))
        doc.build(story)
        return PdfReader(BytesIO(output.getvalue())), styles["code"]

    def assert_pdf_text_intact_and_inside_frame(self, reader, source, edition, code_style):
        extracted = []
        segments = []
        for page in reader.pages:
            def visit(text, cm, tm, font, font_size):
                if not text:
                    return
                extracted.append(text)
                x = tm[4] * cm[0] + tm[5] * cm[2] + cm[4]
                for line in text.split("\n"):
                    if line:
                        width = pdfmetrics.stringWidth(line, edition.mono_font, font_size)
                        segments.append((line, x, x + width, font_size))
            page.extract_text(visitor_text=visit)
        self.assertEqual("".join(extracted).replace("\n", ""), source.replace("\t", "    ").replace("\n", ""))
        self.assertTrue(segments)
        for line, left, right, font_size in segments:
            self.assertGreaterEqual(left, PDF.LEFT_MARGIN - 0.001, repr(line))
            self.assertLessEqual(right, PDF.PAGE_WIDTH - PDF.RIGHT_MARGIN + 0.001, repr(line))
            self.assertAlmostEqual(font_size, code_style.fontSize, msg="Wrapping must not shrink the font")

    def test_long_chinese_and_english_lines_are_inside_the_actual_pdf_frame(self):
        fixtures = {
            "zh": "学习任务：写下已知条件，再给出证据，并说明下一步。" * 15 + "\n\n    保存证据：  （任务） & 结果  \n",
            "en": "EvidenceWithoutAnyWordBoundary" * 35 + "\n\n    Keep these words and spaces:  <task> & result  \n\tIndented line\n",
        }
        for edition in PDF.EDITIONS:
            with self.subTest(language=edition.key):
                source = fixtures[edition.key]
                reader, style = self.render_code(source, edition)
                self.assert_pdf_text_intact_and_inside_frame(reader, source, edition, style)

    def test_spaces_and_blank_lines_survive_layout_without_trimming(self):
        style = PDF.style_sheet(PDF.EDITIONS[1])["code"]
        source = "\n\n    first & <value>  \n\n  second   \n\n"
        flowable = PDF.code_flowable(source, style)
        self.assertEqual(flowable.getPlainText(), source)
        _, height = flowable.wrap(PDF.CONTENT_WIDTH, PDF.CONTENT_HEIGHT)
        self.assertAlmostEqual(height, len(source.split("\n")) * style.leading)

    def test_asymmetric_padding_and_indents_reduce_the_available_text_width(self):
        style = ParagraphStyle("NarrowCode", parent=PDF.style_sheet(PDF.EDITIONS[1])["code"],
                               leftIndent=11, rightIndent=17, firstLineIndent=3,
                               borderPadding=(2, 19, 2, 7))
        source = "  preserve  every  space " * 12
        flowable = PDF.code_flowable(source, style, available_width=150)
        self.assertEqual(flowable.getPlainText().replace("\n", ""), source)
        for line in flowable.getPlainText().split("\n"):
            self.assertLessEqual(pdfmetrics.stringWidth(line, style.fontName, style.fontSize), 150 - 11 - 17 - 3 - 19 - 7)

    def test_wrapped_preformatted_text_can_split_across_pdf_pages_without_text_loss(self):
        edition = PDF.EDITIONS[1]
        source = "\n".join(f"    Record {index}: " + "a long evidence line with original spaces  " * 4 for index in range(80)) + "\n\n"
        reader, style = self.render_code(source, edition)
        self.assertGreater(len(reader.pages), 1)
        self.assert_pdf_text_intact_and_inside_frame(reader, source, edition, style)

    def test_a_character_that_cannot_fit_is_rejected_instead_of_clipped(self):
        with self.assertRaisesRegex(ValueError, "cannot fit"):
            PDF.wrap_preformatted_text("W", "Courier", 7.3, 0.1)

    def test_published_bilingual_pdfs_keep_every_code_line_inside_the_frame(self):
        """Scan every generated page's 7.3pt code text after a full build.

        Code is the only full-book content emitted at this size. This catches a
        regression in the real artifacts that a synthetic fixture could miss.
        """
        for edition in PDF.EDITIONS:
            target = PDF.DOWNLOADS / edition.pdf_file
            with self.subTest(language=edition.key, file=target):
                self.assertTrue(target.exists(), f"run the PDF build first: {target}")
                reader = PdfReader(str(target))
                segments = []
                for page_number, page in enumerate(reader.pages, start=1):
                    def visit(text, cm, tm, _font, font_size):
                        if abs(float(font_size) - 7.3) > 0.02:
                            return
                        x = tm[4] * cm[0] + tm[5] * cm[2] + cm[4]
                        for line in text.split("\n"):
                            if line:
                                right = x + pdfmetrics.stringWidth(line, edition.mono_font, 7.3)
                                segments.append((page_number, line, x, right))

                    page.extract_text(visitor_text=visit)
                self.assertTrue(segments, f"no 7.3pt code text found in {target}")
                for page_number, line, left, right in segments:
                    self.assertGreaterEqual(left, PDF.LEFT_MARGIN - 0.5, (page_number, line, left))
                    self.assertLessEqual(right, PDF.PAGE_WIDTH - PDF.RIGHT_MARGIN + 0.5, (page_number, line, right))


if __name__ == "__main__":
    unittest.main()
