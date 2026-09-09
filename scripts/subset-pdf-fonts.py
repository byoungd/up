#!/usr/bin/env python3

from __future__ import annotations

import argparse
from pathlib import Path
import tempfile
from xml.etree import ElementTree as ET
import zipfile

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont


ROOT = Path(__file__).resolve().parents[1]
EPUB = ROOT / "docs/public/downloads/life-level-up-guide-zh.epub"
FONT_DIR = ROOT / "book-assets/fonts"
OUTPUTS = {
    400: FONT_DIR / "NotoSerifSC-LifeLevelUp-Regular.ttf",
    700: FONT_DIR / "NotoSerifSC-LifeLevelUp-Bold.ttf",
}
EXTRA_TEXT = (
    "人生进阶指南 AI 时代终身学习指南 韩先凯 目录 "
    "https://byoungd.github.io/up/ CC BY-NC 4.0 2026-09-01 •"
)
IPA_FALLBACK_CHARACTERS = set("ɪʌː")
REQUIRED_SPACING_CHARACTERS = set(" \u00a0")


def publication_characters(epub_path: Path) -> set[str]:
    characters = set(EXTRA_TEXT)
    with zipfile.ZipFile(epub_path) as archive:
        chapters = sorted(
            name
            for name in archive.namelist()
            if name.startswith("OEBPS/text/chapter-") and name.endswith(".xhtml")
        )
        if not chapters:
            raise ValueError(f"{epub_path}: no publication chapters found")
        for name in chapters:
            root = ET.fromstring(archive.read(name))
            for value in root.itertext():
                characters.update(value)
    return {
        character
        for character in characters
        if (
            (character.isprintable() and not character.isspace())
            or character in REQUIRED_SPACING_CHARACTERS
        )
        and character not in IPA_FALLBACK_CHARACTERS
    }


def build_subset(source: Path, weight: int, characters: set[str], output: Path) -> None:
    font = TTFont(source, recalcTimestamp=False)
    if "fvar" not in font:
        raise ValueError(f"{source}: expected a variable font with a wght axis")
    font = instantiateVariableFont(
        font,
        {"wght": weight},
        inplace=True,
        optimize=True,
        updateFontNames=True,
    )
    font.recalcTimestamp = False

    options = subset.Options()
    options.drop_tables += ["DSIG"]
    options.layout_features = ["*"]
    options.glyph_names = True
    options.legacy_cmap = True
    options.symbol_cmap = True
    options.notdef_glyph = True
    options.notdef_outline = True
    options.recommended_glyphs = True
    options.name_legacy = True
    options.name_languages = ["*"]

    subsetter = subset.Subsetter(options=options)
    subsetter.populate(text="".join(sorted(characters)))
    subsetter.subset(font)
    output.parent.mkdir(parents=True, exist_ok=True)
    font.save(output, reorderTables=True)

    generated = TTFont(output, recalcTimestamp=False)
    cmap = generated.getBestCmap() or {}
    missing = sorted(character for character in characters if ord(character) not in cmap)
    if missing:
        raise ValueError(f"{output}: generated subset misses {len(missing)} characters: {''.join(missing[:40])}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Regenerate the Chinese PDF font subsets from the current EPUB.")
    parser.add_argument("--source-font", type=Path, required=True, help="Pinned NotoSerifSC[wght].ttf source file")
    args = parser.parse_args()
    source = args.source_font.resolve()
    if not source.exists():
        raise FileNotFoundError(source)
    characters = publication_characters(EPUB)

    with tempfile.TemporaryDirectory(prefix="life-level-up-fonts-") as temp_dir:
        generated = {}
        for weight, destination in OUTPUTS.items():
            target = Path(temp_dir) / destination.name
            build_subset(source, weight, characters, target)
            generated[destination] = target
        for destination, target in generated.items():
            destination.write_bytes(target.read_bytes())
            print(f"updated {destination.relative_to(ROOT)} ({destination.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
