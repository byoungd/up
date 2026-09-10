#!/usr/bin/env python3

from __future__ import annotations

import hashlib
import html
from io import BytesIO
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import urllib.parse
import zipfile
from dataclasses import dataclass
from pathlib import Path, PurePosixPath
from xml.etree import ElementTree as ET

from PIL import Image as PILImage
from pypdf import PdfReader, __version__ as PYPDF_VERSION
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.geomutils import normalizeTRBL
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.utils import ImageReader
from reportlab.lib.units import inch, mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    HRFlowable,
    Image,
    KeepTogether,
    ListFlowable,
    ListItem,
    NextPageTemplate,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    XPreformatted,
)
from reportlab.platypus.tableofcontents import TableOfContents


ROOT = Path(__file__).resolve().parents[1]
DOWNLOADS = ROOT / "docs/public/downloads"
PUBLIC_OUTPUT = DOWNLOADS
LOCAL_OUTPUT = ROOT / "output/pdf"
CHECK_ONLY = "--check" in sys.argv
CHECK_EXACT = "--check-exact" in sys.argv
PAGE_SIZE = (6 * inch, 9.6 * inch)
PAGE_WIDTH, PAGE_HEIGHT = PAGE_SIZE
LEFT_MARGIN = 17 * mm
RIGHT_MARGIN = 15 * mm
TOP_MARGIN = 19 * mm
BOTTOM_MARGIN = 18 * mm
CONTENT_WIDTH = PAGE_WIDTH - LEFT_MARGIN - RIGHT_MARGIN
CONTENT_HEIGHT = PAGE_HEIGHT - TOP_MARGIN - BOTTOM_MARGIN
NS = {"x": "http://www.w3.org/1999/xhtml"}
ZH_REGULAR_FONT = ROOT / "book-assets/fonts/NotoSerifSC-LifeLevelUp-Regular.ttf"
ZH_BOLD_FONT = ROOT / "book-assets/fonts/NotoSerifSC-LifeLevelUp-Bold.ttf"
ZH_IPA_FONT = ROOT / "book-assets/fonts/NotoSans-LifeLevelUp-IPA.ttf"
IPA_FALLBACK_CHARACTERS = set("ɪʌː")
REQUIRED_SPACING_CHARACTERS = set(" \u00a0")


@dataclass(frozen=True)
class Edition:
    key: str
    language: str
    epub_file: str
    pdf_file: str
    title: str
    subtitle: str
    author: str
    contents: str
    cover: Path
    description: str
    body_font: str
    bold_font: str
    italic_font: str
    mono_font: str


EDITIONS = [
    Edition(
        key="zh",
        language="zh-CN",
        epub_file="life-level-up-guide-zh.epub",
        pdf_file="life-level-up-guide-zh.pdf",
        title="人生进阶指南",
        subtitle="AI 时代终身学习指南",
        author="韩先凯",
        contents="目录",
        cover=ROOT / "docs/public/assets/cover-portrait.png",
        description="从英语、AI、真实项目与人生低谷出发，建立能够复测、迁移、恢复并承担责任的终身学习系统。",
        body_font="NotoSerifSC-LifeLevelUp",
        bold_font="NotoSerifSC-LifeLevelUp-Bold",
        italic_font="NotoSerifSC-LifeLevelUp",
        mono_font="NotoSerifSC-LifeLevelUp",
    ),
    Edition(
        key="en",
        language="en-US",
        epub_file="life-level-up-guide-en.epub",
        pdf_file="life-level-up-guide-en.pdf",
        title="Life Level-up Guide",
        subtitle="Lifelong Learning Guide for the AI Era",
        author="Han Xiankai",
        contents="Contents",
        cover=ROOT / "docs/public/assets/cover-portrait-en.png",
        description="A lifelong-learning system for English, AI, real projects, difficult seasons, evidence, transfer, recovery, and responsibility.",
        body_font="Times-Roman",
        bold_font="Times-Bold",
        italic_font="Times-Italic",
        mono_font="Courier",
    ),
]


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def strip_namespace(tag: str) -> str:
    return tag.rsplit("}", 1)[-1]


def clean_text(value: str | None) -> str:
    return (value or "").replace("\u200b", "").replace("\ufeff", "")


def dereference(value):
    return value.get_object() if hasattr(value, "get_object") else value


def normalized_font_name(value: object) -> str:
    name = str(value or "").removeprefix("/")
    return re.sub(r"^[A-Z]{6}\+", "", name)


def outline_entries(items, level: int = 0) -> list[dict[str, object]]:
    entries = []
    for item in items:
        if isinstance(item, list):
            entries.extend(outline_entries(item, level + 1))
        else:
            entries.append({"level": level, "title": clean_text(getattr(item, "title", str(item)))})
    return entries


def pdf_semantics(reader: PdfReader) -> dict:
    pages = []
    fonts = set()
    link_count = 0
    image_count = 0

    for page in reader.pages:
        resources = dereference(page.get("/Resources", {})) or {}
        page_fonts = dereference(resources.get("/Font", {})) or {}
        for font_reference in page_fonts.values():
            font = dereference(font_reference)
            descriptor = dereference(font.get("/FontDescriptor")) if font.get("/FontDescriptor") else None
            if descriptor is None and font.get("/DescendantFonts"):
                descendants = dereference(font["/DescendantFonts"])
                if descendants:
                    descendant = dereference(descendants[0])
                    descriptor = dereference(descendant.get("/FontDescriptor")) if descendant.get("/FontDescriptor") else None
            embedded = bool(
                descriptor
                and any(key in descriptor for key in ("/FontFile", "/FontFile2", "/FontFile3"))
            )
            fonts.add(
                (
                    normalized_font_name(font.get("/BaseFont")),
                    str(font.get("/Subtype", "")).removeprefix("/"),
                    embedded,
                )
            )

        links = []
        for annotation_reference in page.get("/Annots", []):
            annotation = dereference(annotation_reference)
            if str(annotation.get("/Subtype", "")) != "/Link":
                continue
            action = dereference(annotation.get("/A")) if annotation.get("/A") else None
            if action and action.get("/URI"):
                kind = "uri"
                target = str(action["/URI"])
            else:
                kind = "internal"
                target = ""
            rectangle = [round(float(value), 3) for value in annotation.get("/Rect", [])]
            links.append({"kind": kind, "target": target, "rect": rectangle})
        links.sort(key=lambda value: json.dumps(value, ensure_ascii=False, sort_keys=True))
        link_count += len(links)

        images = []
        for image in page.images:
            width, height = image.image.size
            images.append({"width": width, "height": height, "mode": image.image.mode})
        images.sort(key=lambda value: (value["width"], value["height"], value["mode"]))
        image_count += len(images)

        pages.append(
            {
                "width": round(float(page.mediabox.width), 3),
                "height": round(float(page.mediabox.height), 3),
                "textSha256": sha256_bytes(clean_text(page.extract_text()).encode("utf-8")),
                "links": links,
                "images": images,
            }
        )

    outline = outline_entries(reader.outline)
    value = {
        "pages": pages,
        "outline": outline,
        "fonts": [
            {"name": name, "subtype": subtype, "embedded": embedded}
            for name, subtype, embedded in sorted(fonts)
        ],
    }
    encoded = json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return {
        "semanticSha256": sha256_bytes(encoded),
        "outlineEntries": len(outline),
        "linkAnnotations": link_count,
        "images": image_count,
        "fonts": value["fonts"],
    }


def formatted_text(value: str | None, edition: Edition) -> str:
    text = clean_text(value)
    if edition.key != "zh" or not any(character in IPA_FALLBACK_CHARACTERS for character in text):
        return html.escape(text)
    parts = []
    buffer = []
    for character in text:
        if character in IPA_FALLBACK_CHARACTERS:
            if buffer:
                parts.append(html.escape("".join(buffer)))
                buffer = []
            parts.append(f'<font name="NotoSans-LifeLevelUp-IPA">{html.escape(character)}</font>')
        else:
            buffer.append(character)
    if buffer:
        parts.append(html.escape("".join(buffer)))
    return "".join(parts)


def safe_anchor(value: str) -> str:
    return re.sub(r"[^A-Za-z0-9_.-]+", "-", value).strip("-") or "section"


def heading_anchor(file: str, value: str) -> str:
    digest = hashlib.sha1(clean_text(value).encode("utf-8")).hexdigest()[:12]
    return f"{safe_anchor(Path(file).stem)}-{digest}"


def fit_running_header(text: str, font_name: str, font_size: float, max_width: float) -> str:
    normalized = " ".join(clean_text(text).split())
    if pdfmetrics.stringWidth(normalized, font_name, font_size) <= max_width:
        return normalized
    suffix = "..."
    if " " in normalized:
        parts = normalized.split()
        while parts and pdfmetrics.stringWidth(" ".join(parts) + suffix, font_name, font_size) > max_width:
            parts.pop()
        return (" ".join(parts) + suffix) if parts else suffix
    parts = list(normalized)
    while parts and pdfmetrics.stringWidth("".join(parts) + suffix, font_name, font_size) > max_width:
        parts.pop()
    return ("".join(parts) + suffix) if parts else suffix


def wrap_preformatted_text(text: str, font_name: str, font_size: float, max_width: float) -> str:
    """Insert soft line breaks without discarding source characters or spaces."""
    if max_width <= 0:
        raise ValueError("Preformatted text has no available line width")
    output = []
    for source_line in text.split("\n"):
        remaining = source_line
        while pdfmetrics.stringWidth(remaining, font_name, font_size) > max_width:
            low, high = 0, len(remaining)
            while low < high:
                middle = (low + high + 1) // 2
                if pdfmetrics.stringWidth(remaining[:middle], font_name, font_size) <= max_width:
                    low = middle
                else:
                    high = middle - 1
            if not low:
                raise ValueError(f"Preformatted character cannot fit at {font_size} pt: {remaining[0]!r}")
            # Prefer word boundaries for English. Keep the separating spaces on
            # the previous line, and never emit an indentation-only soft line.
            boundary = remaining.rfind(" ", 0, low) + 1
            split_at = boundary if remaining[:boundary].strip() else low
            output.append(remaining[:split_at])
            remaining = remaining[split_at:]
        output.append(remaining)
    return "\n".join(output)


class WrappedPreformatted(XPreformatted):
    def __init__(self, text, style, bulletText=None, frags=None, caseSensitive=1):
        self.caseSensitive = caseSensitive
        # XPreformatted normally trims blank lines at both ends. Preserve them,
        # including when ReportLab creates fragments to split across pages.
        self._setup(text, style, bulletText, frags, lambda value: value or "")
        if frags is None and self.frags:
            # Entity decoding can create several identically styled fragments.
            # Keep plain code in one fragment: the multi-fragment renderer drops
            # a final empty line, while the single-fragment path preserves it.
            self.frags = [self.frags[0].clone(text="".join(fragment.text for fragment in self.frags))]


def code_flowable(text: str, style: ParagraphStyle, available_width: float = CONTENT_WIDTH) -> WrappedPreformatted:
    _, right_padding, _, left_padding = normalizeTRBL(style.borderPadding)
    # ReportLab paints borderPadding outside the paragraph indents. Move the
    # text inward so both its background and glyphs remain inside the frame.
    padded_style = ParagraphStyle(
        f"{style.name}-Wrapped",
        parent=style,
        leftIndent=style.leftIndent + left_padding,
        rightIndent=style.rightIndent + right_padding,
    )
    line_width = available_width - padded_style.leftIndent - padded_style.rightIndent - max(0, style.firstLineIndent)
    wrapped = wrap_preformatted_text(text, style.fontName, style.fontSize, line_width)
    return WrappedPreformatted(html.escape(wrapped), padded_style)


class InvariantCanvas(canvas.Canvas):
    def __init__(self, *args, metadata: dict[str, str], **kwargs):
        kwargs["invariant"] = 1
        kwargs["pageCompression"] = 1
        kwargs["pdfVersion"] = (1, 7)
        super().__init__(*args, **kwargs)
        self.setTitle(metadata["title"])
        self.setAuthor(metadata["author"])
        self.setSubject(metadata["subject"])
        self.setCreator("Life Level-up Guide deterministic PDF builder")


class BookDocTemplate(BaseDocTemplate):
    def __init__(self, filename: str, edition: Edition, cover_path: Path):
        super().__init__(
            filename,
            pagesize=PAGE_SIZE,
            leftMargin=LEFT_MARGIN,
            rightMargin=RIGHT_MARGIN,
            topMargin=TOP_MARGIN,
            bottomMargin=BOTTOM_MARGIN,
            title=edition.title,
            author=edition.author,
            subject=edition.description,
            creator="Life Level-up Guide deterministic PDF builder",
        )
        self.edition = edition
        self.cover_path = cover_path
        self.current_heading = edition.title
        body_frame = Frame(
            LEFT_MARGIN,
            BOTTOM_MARGIN,
            CONTENT_WIDTH,
            CONTENT_HEIGHT,
            id="body-frame",
            leftPadding=0,
            rightPadding=0,
            topPadding=0,
            bottomPadding=0,
        )
        self.addPageTemplates(
            [
                PageTemplate(id="cover", frames=[body_frame], onPage=self.draw_cover),
                PageTemplate(id="body", frames=[body_frame], onPageEnd=self.draw_body_page),
            ]
        )

    def draw_cover(self, canv: canvas.Canvas, _doc) -> None:
        canv.saveState()
        with PILImage.open(self.cover_path) as source:
            width, height = source.size
        scale = min(PAGE_WIDTH / width, PAGE_HEIGHT / height)
        draw_width = width * scale
        draw_height = height * scale
        canv.drawImage(
            ImageReader(BytesIO(self.cover_path.read_bytes())),
            (PAGE_WIDTH - draw_width) / 2,
            (PAGE_HEIGHT - draw_height) / 2,
            width=draw_width,
            height=draw_height,
            preserveAspectRatio=True,
            mask="auto",
        )
        canv.restoreState()

    def draw_body_page(self, canv: canvas.Canvas, _doc) -> None:
        page_number = canv.getPageNumber() - 1
        canv.saveState()
        canv.setStrokeColor(colors.HexColor("#cfd7d1"))
        canv.setLineWidth(0.5)
        canv.line(LEFT_MARGIN, PAGE_HEIGHT - 12 * mm, PAGE_WIDTH - RIGHT_MARGIN, PAGE_HEIGHT - 12 * mm)
        canv.setFillColor(colors.HexColor("#5f6c68"))
        font_size = 7.5
        canv.setFont(self.edition.body_font, font_size)
        header = self.current_heading if page_number > 2 else self.edition.title
        header = fit_running_header(header, self.edition.body_font, font_size, CONTENT_WIDTH)
        canv.drawString(LEFT_MARGIN, PAGE_HEIGHT - 9.2 * mm, header)
        canv.drawCentredString(PAGE_WIDTH / 2, 9 * mm, str(page_number))
        canv.restoreState()

    def afterFlowable(self, flowable) -> None:
        if not isinstance(flowable, Paragraph) or not hasattr(flowable, "toc_level"):
            return
        level = flowable.toc_level
        text = flowable.getPlainText()
        key = flowable.bookmark
        self.canv.bookmarkPage(key)
        try:
            self.canv.addOutlineEntry(text, key, level=level, closed=level == 0)
        except ValueError:
            pass
        if level == 0:
            self.notify("TOCEntry", (0, text, self.page, key))
            self.current_heading = text


def style_sheet(edition: Edition) -> dict[str, ParagraphStyle]:
    base = getSampleStyleSheet()
    justify = TA_JUSTIFY if edition.key == "zh" else TA_LEFT
    styles = {
        "body": ParagraphStyle(
            "Body",
            parent=base["BodyText"],
            fontName=edition.body_font,
            fontSize=9.4,
            leading=15.2,
            alignment=justify,
            textColor=colors.HexColor("#1d2926"),
            spaceAfter=6.5,
            splitLongWords=True,
        ),
        "h1": ParagraphStyle(
            "Heading1",
            parent=base["Heading1"],
            fontName=edition.bold_font,
            fontSize=21,
            leading=27,
            textColor=colors.HexColor("#1d2926"),
            spaceAfter=12,
            keepWithNext=True,
        ),
        "h2": ParagraphStyle(
            "Heading2",
            parent=base["Heading2"],
            fontName=edition.bold_font,
            fontSize=14,
            leading=19,
            textColor=colors.HexColor("#176f5b"),
            spaceBefore=15,
            spaceAfter=7,
            keepWithNext=True,
        ),
        "h3": ParagraphStyle(
            "Heading3",
            parent=base["Heading3"],
            fontName=edition.bold_font,
            fontSize=11.2,
            leading=15,
            textColor=colors.HexColor("#31443f"),
            spaceBefore=10,
            spaceAfter=5,
            keepWithNext=True,
        ),
        "h4": ParagraphStyle(
            "Heading4",
            parent=base["Heading4"],
            fontName=edition.bold_font,
            fontSize=9.8,
            leading=13.5,
            textColor=colors.HexColor("#485652"),
            spaceBefore=8,
            spaceAfter=4,
            keepWithNext=True,
        ),
        "quote": ParagraphStyle(
            "Quote",
            parent=base["BodyText"],
            fontName=edition.body_font,
            fontSize=9,
            leading=14.5,
            leftIndent=10,
            rightIndent=5,
            borderWidth=0,
            borderPadding=7,
            backColor=colors.HexColor("#eef2ef"),
            textColor=colors.HexColor("#485652"),
            spaceBefore=5,
            spaceAfter=8,
        ),
        "code": ParagraphStyle(
            "Code",
            parent=base["Code"],
            fontName=edition.mono_font,
            fontSize=7.3,
            leading=10.2,
            leftIndent=4,
            rightIndent=4,
            borderPadding=6,
            backColor=colors.HexColor("#f2f3f2"),
            textColor=colors.HexColor("#263431"),
            spaceBefore=5,
            spaceAfter=7,
            splitLongWords=True,
        ),
        "caption": ParagraphStyle(
            "Caption",
            parent=base["BodyText"],
            fontName=edition.body_font,
            fontSize=7.5,
            leading=10,
            alignment=TA_CENTER,
            textColor=colors.HexColor("#6b7773"),
            spaceBefore=2,
            spaceAfter=8,
        ),
        "title": ParagraphStyle(
            "TitlePage",
            parent=base["Title"],
            fontName=edition.bold_font,
            fontSize=27,
            leading=34,
            alignment=TA_CENTER,
            textColor=colors.HexColor("#1d2926"),
            spaceAfter=16,
        ),
        "subtitle": ParagraphStyle(
            "Subtitle",
            parent=base["BodyText"],
            fontName=edition.body_font,
            fontSize=13,
            leading=18,
            alignment=TA_CENTER,
            textColor=colors.HexColor("#176f5b"),
            spaceAfter=25,
        ),
        "center": ParagraphStyle(
            "Center",
            parent=base["BodyText"],
            fontName=edition.body_font,
            fontSize=10,
            leading=15,
            alignment=TA_CENTER,
            textColor=colors.HexColor("#485652"),
            spaceAfter=9,
        ),
    }
    return styles


def inline_markup(element: ET.Element, edition: Edition, current_file: str, h1_anchors: dict[str, str]) -> str:
    def visit(node: ET.Element) -> str:
        tag = strip_namespace(node.tag)
        content = formatted_text(node.text, edition)
        for child in list(node):
            content += visit(child)
            content += formatted_text(child.tail, edition)

        if tag in {"strong", "b"}:
            return f"<b>{content}</b>"
        if tag in {"em", "i"}:
            return f"<i>{content}</i>"
        if tag == "code":
            return f'<font name="{edition.mono_font}">{content}</font>'
        if tag == "br":
            return "<br/>"
        if tag == "a":
            href = node.attrib.get("href", "")
            if href.startswith("http") or href.startswith("mailto:"):
                return f'<link href="{html.escape(href, quote=True)}" color="#176f5b">{content}</link>'
            target_file, _, raw_hash = href.partition("#")
            target_file = target_file or current_file
            anchor = heading_anchor(target_file, urllib.parse.unquote(raw_hash)) if raw_hash else h1_anchors.get(target_file)
            if anchor:
                return f'<link href="#{anchor}" color="#176f5b">{content}</link>'
            return content
        return content

    return visit(element)


def paragraph_from(element: ET.Element, style: ParagraphStyle, edition: Edition, current_file: str, h1_anchors: dict[str, str]) -> Paragraph | None:
    markup = inline_markup(element, edition, current_file, h1_anchors).strip()
    if not markup:
        return None
    return Paragraph(markup, style)


def build_list(element: ET.Element, styles, edition: Edition, current_file: str, h1_anchors: dict[str, str]) -> ListFlowable:
    ordered = strip_namespace(element.tag) == "ol"
    items = []
    for li in element:
        if strip_namespace(li.tag) != "li":
            continue
        item_flowables = []
        inline_parts = []
        if clean_text(li.text).strip():
            inline_parts.append(formatted_text(li.text, edition))
        for child in li:
            tag = strip_namespace(child.tag)
            if tag in {"ul", "ol"}:
                if inline_parts:
                    item_flowables.append(Paragraph("".join(inline_parts), styles["body"]))
                    inline_parts = []
                item_flowables.append(build_list(child, styles, edition, current_file, h1_anchors))
            elif tag == "p":
                if inline_parts:
                    item_flowables.append(Paragraph("".join(inline_parts), styles["body"]))
                    inline_parts = []
                paragraph = paragraph_from(child, styles["body"], edition, current_file, h1_anchors)
                if paragraph:
                    item_flowables.append(paragraph)
            else:
                inline_parts.append(inline_markup(child, edition, current_file, h1_anchors))
            if clean_text(child.tail).strip():
                inline_parts.append(formatted_text(child.tail, edition))
        if inline_parts:
            item_flowables.append(Paragraph("".join(inline_parts), styles["body"]))
        if not item_flowables:
            item_flowables.append(Paragraph("", styles["body"]))
        items.append(ListItem(item_flowables, leftIndent=12))
    list_options = {
        "bulletType": "1" if ordered else "bullet",
        "leftIndent": 18,
        "bulletFontName": edition.body_font,
        "bulletFontSize": 8,
        "spaceAfter": 6,
    }
    if ordered:
        list_options["start"] = "1"
    return ListFlowable(
        items,
        **list_options,
    )


def build_table(element: ET.Element, styles, edition: Edition, current_file: str, h1_anchors: dict[str, str]) -> Table:
    rows = []
    header_rows = 0
    for section in list(element):
        section_tag = strip_namespace(section.tag)
        row_elements = [section] if section_tag == "tr" else [child for child in section if strip_namespace(child.tag) == "tr"]
        for row_element in row_elements:
            row = []
            is_header = section_tag == "thead"
            for cell in row_element:
                if strip_namespace(cell.tag) not in {"th", "td"}:
                    continue
                markup = inline_markup(cell, edition, current_file, h1_anchors).strip() or "&#160;"
                cell_style = ParagraphStyle(
                    f"Cell-{len(rows)}-{len(row)}",
                    parent=styles["body"],
                    fontName=edition.bold_font if strip_namespace(cell.tag) == "th" else edition.body_font,
                    fontSize=7.2,
                    leading=9.3,
                    alignment=TA_LEFT,
                    spaceAfter=0,
                )
                row.append(Paragraph(markup, cell_style))
            if row:
                rows.append(row)
                if is_header:
                    header_rows += 1
    columns = max((len(row) for row in rows), default=1)
    for row in rows:
        row.extend([Paragraph("&#160;", styles["body"])] * (columns - len(row)))
    table = Table(rows, colWidths=[CONTENT_WIDTH / columns] * columns, repeatRows=header_rows, hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#9aa49f")),
                ("BACKGROUND", (0, 0), (-1, max(header_rows - 1, 0)), colors.HexColor("#e9efeb")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 4),
                ("RIGHTPADDING", (0, 0), (-1, -1), 4),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )
    return table


def image_flowables(element: ET.Element, extracted_root: Path, current_file: str, styles) -> list:
    src = element.attrib.get("src", "")
    if not src or src.startswith("http"):
        return []
    image_path = (extracted_root / "OEBPS/text" / current_file).parent.joinpath(src).resolve()
    if not image_path.exists():
        return []
    raster_dir = extracted_root / "pdf-raster"
    raster_dir.mkdir(parents=True, exist_ok=True)
    raster_path = raster_dir / f"{hashlib.sha256(image_path.read_bytes()).hexdigest()}.jpg"
    if not raster_path.exists():
        script = (
            'import sharp from "sharp"; '
            'await sharp(process.argv[1], { density: 180 })'
            '.flatten({ background: "#ffffff" })'
            '.resize({ width: 1400, withoutEnlargement: true })'
            '.jpeg({ quality: 84, mozjpeg: true })'
            '.toFile(process.argv[2]);'
        )
        subprocess.run(
            ["node", "--input-type=module", "-e", script, str(image_path), str(raster_path)],
            cwd=ROOT,
            check=True,
            capture_output=True,
            text=True,
        )
    image_path = raster_path
    image_bytes = image_path.read_bytes()
    with PILImage.open(BytesIO(image_bytes)) as source:
        width, height = source.size
    scale = min(CONTENT_WIDTH / width, (PAGE_HEIGHT - 55 * mm) / height, 1)
    flowables = [Image(BytesIO(image_bytes), width=width * scale, height=height * scale)]
    alt = element.attrib.get("alt", "").strip()
    if alt:
        flowables.append(Paragraph(html.escape(alt), styles["caption"]))
    return flowables


def convert_children(parent: ET.Element, extracted_root: Path, current_file: str, styles, edition: Edition, h1_anchors: dict[str, str], level_state: dict[str, int]) -> list:
    flowables = []
    for element in list(parent):
        tag = strip_namespace(element.tag)
        if tag in {"h1", "h2", "h3", "h4"}:
            level = int(tag[1]) - 1
            text = "".join(element.itertext()).replace("\u200b", "").strip()
            raw_id = element.attrib.get("id", text)
            bookmark = heading_anchor(current_file, raw_id)
            markup = f'<a name="{bookmark}"/>{html.escape(text)}'
            paragraph = Paragraph(markup, styles[tag])
            paragraph.toc_level = level
            paragraph.bookmark = bookmark
            flowables.append(paragraph)
            level_state["headings"] += 1
        elif tag == "p":
            embedded_images = [child for child in list(element) if strip_namespace(child.tag) == "img"]
            if embedded_images:
                for image_element in embedded_images:
                    flowables.extend(image_flowables(image_element, extracted_root, current_file, styles))
            else:
                paragraph = paragraph_from(element, styles["body"], edition, current_file, h1_anchors)
                if paragraph:
                    flowables.append(paragraph)
        elif tag == "blockquote":
            paragraph = paragraph_from(element, styles["quote"], edition, current_file, h1_anchors)
            if paragraph:
                flowables.append(paragraph)
        elif tag in {"ul", "ol"}:
            flowables.append(build_list(element, styles, edition, current_file, h1_anchors))
        elif tag == "table":
            flowables.append(build_table(element, styles, edition, current_file, h1_anchors))
            flowables.append(Spacer(1, 6))
        elif tag == "pre":
            text = "".join(element.itertext()).replace("\t", "    ")
            flowables.append(code_flowable(text, styles["code"]))
        elif tag == "img":
            flowables.extend(image_flowables(element, extracted_root, current_file, styles))
        elif tag == "hr":
            flowables.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#cfd7d1"), spaceBefore=6, spaceAfter=8))
        else:
            if tag in {"figure", "section", "div", "main", "article", "details"}:
                flowables.extend(convert_children(element, extracted_root, current_file, styles, edition, h1_anchors, level_state))
            elif tag == "figcaption":
                paragraph = paragraph_from(element, styles["caption"], edition, current_file, h1_anchors)
                if paragraph:
                    flowables.append(paragraph)
    return flowables


def inspect_pdf(edition: Edition, target: Path, source_epub_sha256: str, chapter_count: int) -> dict:
    reader = PdfReader(str(target))
    if reader.is_encrypted:
        raise ValueError(f"{edition.pdf_file}: PDF must not be encrypted")
    if len(reader.pages) < 100:
        raise ValueError(f"{edition.pdf_file}: expected at least 100 pages, found {len(reader.pages)}")
    metadata_values = reader.metadata or {}
    if metadata_values.get("/Title") != edition.title or metadata_values.get("/Author") != edition.author:
        raise ValueError(f"{edition.pdf_file}: metadata mismatch")
    first_text_page = "".join(page.extract_text() or "" for page in reader.pages[1:6])
    if edition.title not in first_text_page or edition.contents not in first_text_page:
        raise ValueError(f"{edition.pdf_file}: title or contents text missing")
    final_bytes = target.read_bytes()
    if len(final_bytes) > 8_000_000:
        raise ValueError(f"{edition.pdf_file}: PDF exceeds 8MB budget")
    semantics = pdf_semantics(reader)
    if edition.key == "zh":
        embedded_fonts = {font["name"] for font in semantics["fonts"] if font["embedded"]}
        required_fonts = {"NotoSerifSC-Regular", "NotoSerifSC-Bold", "NotoSans-Regular"}
        missing_fonts = sorted(required_fonts - embedded_fonts)
        if missing_fonts:
            raise ValueError(f"{edition.pdf_file}: missing embedded fonts: {', '.join(missing_fonts)}")
    return {
        "file": edition.pdf_file,
        "language": edition.language,
        "pages": len(reader.pages),
        "chapters": chapter_count,
        "bytes": len(final_bytes),
        "sha256": sha256_bytes(final_bytes),
        "sourceEpubSha256": source_epub_sha256,
        **semantics,
    }


def build_pdf(edition: Edition, target: Path, temp_root: Path) -> dict:
    epub_path = DOWNLOADS / edition.epub_file
    extracted_root = temp_root / edition.key
    with zipfile.ZipFile(epub_path) as archive:
        archive.extractall(extracted_root)
    opf = ET.parse(extracted_root / "OEBPS/package.opf").getroot()
    ns_opf = {"o": "http://www.idpf.org/2007/opf", "dc": "http://purl.org/dc/elements/1.1/"}
    modified = opf.find("o:metadata/o:meta[@property='dcterms:modified']", ns_opf)
    publication_date = (modified.text or "").split("T", 1)[0] if modified is not None else ""
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", publication_date):
        raise ValueError(f"{edition.pdf_file}: EPUB has no valid dcterms:modified date")
    manifest = {
        item.attrib["id"]: item.attrib["href"]
        for item in opf.findall("o:manifest/o:item", ns_opf)
    }
    spine_files = [manifest[item.attrib["idref"]] for item in opf.findall("o:spine/o:itemref", ns_opf)]
    chapter_files = [file.removeprefix("text/") for file in spine_files if file.startswith("text/chapter-")]
    if not chapter_files:
        raise ValueError(f"{edition.pdf_file}: EPUB contains no manuscript chapters")

    parsed = {}
    h1_anchors = {}
    for file in chapter_files:
        root = ET.parse(extracted_root / "OEBPS/text" / file).getroot()
        parsed[file] = root
        h1 = root.find(".//x:h1", NS)
        raw_id = h1.attrib.get("id", h1.text or file) if h1 is not None else file
        h1_anchors[file] = heading_anchor(file, raw_id)

    if edition.key == "zh":
        glyphs = pdfmetrics.getFont(edition.body_font).face.charToGlyph
        fallback_glyphs = pdfmetrics.getFont("NotoSans-LifeLevelUp-IPA").face.charToGlyph
        used_characters = set(edition.title + edition.subtitle + edition.author + edition.contents + edition.description)
        for root in parsed.values():
            for text in root.itertext():
                used_characters.update(clean_text(text))
        missing = sorted(
            character
            for character in used_characters
            if (
                (character.isprintable() and not character.isspace())
                or character in REQUIRED_SPACING_CHARACTERS
            )
            and ord(character) not in glyphs
            and ord(character) not in fallback_glyphs
        )
        if missing:
            raise ValueError(
                f"{edition.pdf_file}: embedded font misses {len(missing)} characters: {''.join(missing[:40])}"
            )

    styles = style_sheet(edition)
    story = [NextPageTemplate("body"), PageBreak()]
    story.extend(
        [
            Spacer(1, 34 * mm),
            Paragraph(edition.title, styles["title"]),
            Paragraph(edition.subtitle, styles["subtitle"]),
            Paragraph(edition.author, styles["center"]),
            Spacer(1, 16 * mm),
            Paragraph(edition.description, styles["center"]),
            Spacer(1, 15 * mm),
            Paragraph("https://byoungd.github.io/up/", styles["center"]),
            Paragraph(f"CC BY-NC 4.0 · {publication_date}", styles["center"]),
            PageBreak(),
            Paragraph(edition.contents, styles["title"]),
        ]
    )
    toc = TableOfContents()
    toc.levelStyles = [
        ParagraphStyle("TOC0", fontName=edition.bold_font, fontSize=9.5, leading=14, leftIndent=0, firstLineIndent=0, spaceBefore=4),
        ParagraphStyle("TOC1", fontName=edition.body_font, fontSize=8.2, leading=12, leftIndent=12, firstLineIndent=0),
        ParagraphStyle("TOC2", fontName=edition.body_font, fontSize=7.6, leading=11, leftIndent=24, firstLineIndent=0),
        ParagraphStyle("TOC3", fontName=edition.body_font, fontSize=7.2, leading=10, leftIndent=36, firstLineIndent=0),
    ]
    story.extend([toc, PageBreak()])

    level_state = {"headings": 0}
    for index, file in enumerate(chapter_files):
        if index:
            story.append(PageBreak())
        root = parsed[file]
        main = root.find(".//x:main", NS)
        if main is None:
            main = root.find(".//x:body", NS)
        if main is None:
            raise ValueError(f"{edition.pdf_file}: missing main element in {file}")
        story.extend(convert_children(main, extracted_root, file, styles, edition, h1_anchors, level_state))

    if level_state["headings"] < 100:
        raise ValueError(f"{edition.pdf_file}: suspicious heading count {level_state['headings']}")

    doc = BookDocTemplate(str(target), edition, edition.cover)
    metadata = {"title": edition.title, "author": edition.author, "subject": edition.description}
    doc.multiBuild(
        story,
        canvasmaker=lambda *args, **kwargs: InvariantCanvas(*args, metadata=metadata, **kwargs),
    )
    return inspect_pdf(edition, target, sha256_bytes(epub_path.read_bytes()), len(chapter_files))


def manifest_for(outputs: list[dict]) -> dict:
    return {
        "version": 2,
        "format": "PDF 1.7",
        "pageSize": "6 × 9.6 in",
        "scope": "Main manuscript, glossary, and toolkit; archive and word lists remain online-only.",
        "inspector": {"name": "pypdf", "version": PYPDF_VERSION},
        "outputs": {metadata["language"]: metadata for metadata in outputs},
    }


def main() -> None:
    if not (CHECK_ONLY or CHECK_EXACT):
        PUBLIC_OUTPUT.mkdir(parents=True, exist_ok=True)
        LOCAL_OUTPUT.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory(prefix="life-level-up-pdf-") as temp_dir:
        temp_root = Path(temp_dir)
        outputs = []
        for edition in EDITIONS:
            target = temp_root / edition.pdf_file
            metadata = build_pdf(edition, target, temp_root)
            outputs.append((target, metadata))

        if CHECK_ONLY or CHECK_EXACT:
            committed_outputs = []
            for target, metadata in outputs:
                committed = PUBLIC_OUTPUT / metadata["file"]
                if not committed.exists():
                    raise ValueError(f"{committed.relative_to(ROOT)} 不存在；运行 npm run book:pdf:build")
                edition = next(value for value in EDITIONS if value.language == metadata["language"])
                committed_metadata = inspect_pdf(
                    edition,
                    committed,
                    metadata["sourceEpubSha256"],
                    metadata["chapters"],
                )
                committed_outputs.append(committed_metadata)
                if metadata["semanticSha256"] != committed_metadata["semanticSha256"]:
                    raise ValueError(
                        f"{committed.relative_to(ROOT)} 的分页、文本、书签、链接、图片或字体未与书稿同步；"
                        "运行 npm run book:pdf:build"
                    )
                if CHECK_EXACT and committed.read_bytes() != target.read_bytes():
                    raise ValueError(
                        f"{committed.relative_to(ROOT)} 在当前平台未逐字节复现；运行 npm run book:pdf:build"
                    )
            committed_manifest = PUBLIC_OUTPUT / "pdf-manifest.json"
            expected_manifest_text = json.dumps(manifest_for(committed_outputs), ensure_ascii=False, indent=2) + "\n"
            if not committed_manifest.exists() or committed_manifest.read_text() != expected_manifest_text:
                print("Expected pdf-manifest.json for this build:\n" + expected_manifest_text, file=sys.stderr)
                raise ValueError(f"{committed_manifest.relative_to(ROOT)} 未与 PDF 产物同步；运行 npm run book:pdf:build")
            if CHECK_EXACT:
                print("PDF editions are byte-for-byte reproducible on this platform")
            else:
                print("PDF editions are semantically in sync; published hashes match the manifest")
            return

        manifest_text = json.dumps(
            manifest_for([metadata for _, metadata in outputs]),
            ensure_ascii=False,
            indent=2,
        ) + "\n"

        for target, metadata in outputs:
            shutil.copyfile(target, PUBLIC_OUTPUT / metadata["file"])
            shutil.copyfile(target, LOCAL_OUTPUT / metadata["file"])
            print(
                f"updated docs/public/downloads/{metadata['file']} "
                f"({metadata['pages']} pages, {metadata['bytes']} bytes)"
            )
        (PUBLIC_OUTPUT / "pdf-manifest.json").write_text(manifest_text)


if __name__ == "__main__":
    pdfmetrics.registerFont(TTFont("NotoSerifSC-LifeLevelUp", str(ZH_REGULAR_FONT)))
    pdfmetrics.registerFont(TTFont("NotoSerifSC-LifeLevelUp-Bold", str(ZH_BOLD_FONT)))
    pdfmetrics.registerFont(TTFont("NotoSans-LifeLevelUp-IPA", str(ZH_IPA_FONT)))
    main()
