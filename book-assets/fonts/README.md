# PDF font maintenance

The Chinese print edition embeds OFL-licensed subsets of Noto Serif SC. The subset character set is derived from the current Chinese EPUB, while IPA characters not present in Noto Serif SC remain in the separate Noto Sans fallback subset.

The pinned upstream source is `ofl/notoserifsc/NotoSerifSC[wght].ttf` from Google Fonts commit `2e61f4355afd22b801791b0df176065082423b87`, SHA-256 `050080d9255a86808f2945bffac582b31ef32bc36411ce29563b4961670c66f9`.

To regenerate the 400 and 700 subsets:

```sh
python3 -m pip install -r requirements-fonts.txt
python3 scripts/subset-pdf-fonts.py --source-font /path/to/NotoSerifSC[wght].ttf
npm run book:pdf:build
```

Verify the downloaded source SHA before regeneration. The PDF builder performs a second coverage check, including required spacing glyphs, and fails before publication if any required manuscript character is missing.
