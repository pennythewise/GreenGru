# Bundled CJK font

Per PRD §8.11 edge case #10, this backend must bundle its own CJK-capable
font rather than relying on whatever happens to be installed on the host —
otherwise the first deploy to a fresh Linux container (Render, etc.) renders
CJK text as tofu (□□) because no CJK font is present at all.

Download **Noto Sans SC** (SIL Open Font License) and place the regular
weight here as:

```
NotoSansSC-Regular.ttf
```

Source: https://fonts.google.com/noto/specimen/Noto+Sans+SC

Until this file is present, `pdf_generator.py` falls back to the OS's
installed CJK fonts (Microsoft YaHei on Windows, Noto/WenQuanYi on most
Linux distros) via the template's font-family fallback chain — sufficient
for local development, but do not deploy to a fresh container without
adding the bundled font first. The rendering test in
`tests/test_edge_cases.py` asserts a known CN string survives PDF
generation, but it cannot detect tofu rendering from text extraction alone
— a visual check is still required before launch.
