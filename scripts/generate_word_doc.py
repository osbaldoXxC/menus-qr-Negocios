#!/usr/bin/env python3
"""Generador de documento Microsoft Word (.docx) nativo sin dependencias externas.
Transforma docs/caso_estudio_cicd.md en docs/Caso_Estudio_CICD_MexxicanMX.docx
con estilos corporativos, tablas con bordes y sombreado, bloques de código e índice visual.
"""

import html
import re
import zipfile
from pathlib import Path
import xml.sax.saxutils as saxutils

ROOT = Path(__file__).resolve().parent.parent
MD_PATH = ROOT / "docs" / "caso_estudio_cicd.md"
DOCX_PATH = ROOT / "docs" / "Caso_Estudio_CICD_MexxicanMX.docx"


def xml_escape(text: str) -> str:
    # Remove any invalid XML chars
    cleaned = "".join(c for c in text if c in ("\t", "\n", "\r") or (0x20 <= ord(c) <= 0xD7FF) or (0xE000 <= ord(c) <= 0xFFFD))
    return saxutils.escape(cleaned)


def clean_markdown_links(text: str) -> str:
    # Convert [label](url) -> label
    return re.sub(r"\[([^\]]+)\]\([^\)]+\)", r"\1", text)


def parse_inline_runs(text: str, default_color: str = "1F2937", default_size: int = 21, force_bold: bool = False) -> str:
    """Convierte formato inline (**negrita**, `codigo`) en runs de WordprocessingML."""
    text = clean_markdown_links(text)
    # Tokenize by **bold** or `code`
    tokens = re.split(r"(\*\*[^*]+\*\*|`[^`]+`)", text)
    runs = []
    for tok in tokens:
        if not tok:
            continue
        is_bold = force_bold
        is_code = False
        content = tok
        if tok.startswith("**") and tok.endswith("**") and len(tok) > 4:
            is_bold = True
            content = tok[2:-2]
        elif tok.startswith("`") and tok.endswith("`") and len(tok) > 2:
            is_code = True
            content = tok[1:-1]

        rpr = []
        if is_code:
            rpr.append('<w:rFonts w:ascii="Consolas" w:hAnsi="Consolas" w:cs="Consolas"/>')
            rpr.append('<w:color w:val="0F172A"/>')
            rpr.append('<w:shd w:val="clear" w:color="auto" w:fill="F1F5F9"/>')
            rpr.append(f'<w:sz w:val="{max(default_size - 2, 17)}"/>')
        else:
            rpr.append('<w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>')
            rpr.append(f'<w:color w:val="{default_color}"/>')
            rpr.append(f'<w:sz w:val="{default_size}"/>')

        if is_bold:
            rpr.append("<w:b/>")

        runs.append(
            f'<w:r><w:rPr>{"".join(rpr)}</w:rPr>'
            f'<w:t xml:space="preserve">{xml_escape(content)}</w:t></w:r>'
        )
    return "".join(runs)


def make_paragraph(
    text: str,
    style: str = "Normal",
    align: str = "both",
    space_before: int = 80,
    space_after: int = 120,
    color: str = "1F2937",
    size: int = 21,
    bold: bool = False,
    left_indent: int = 0,
    shading: str = "",
    bottom_border: str = "",
) -> str:
    ppr = [f'<w:pStyle w:val="{style}"/>']
    ppr.append(f'<w:jc w:val="{align}"/>')
    ppr.append(f'<w:spacing w:before="{space_before}" w:after="{space_after}" w:line="276" w:lineRule="auto"/>')
    if left_indent:
        ppr.append(f'<w:ind w:left="{left_indent}"/>')
    if shading:
        ppr.append(f'<w:shd w:val="clear" w:color="auto" w:fill="{shading}"/>')
    if bottom_border:
        ppr.append(
            f'<w:pBdr><w:bottom w:val="single" w:sz="12" w:space="4" w:color="{bottom_border}"/></w:pBdr>'
        )
    runs = parse_inline_runs(text, default_color=color, default_size=size, force_bold=bold)
    return f'<w:p><w:pPr>{"".join(ppr)}</w:pPr>{runs}</w:p>'


def make_code_block(lines: list[str]) -> str:
    paragraphs = []
    for idx, line in enumerate(lines):
        before = 80 if idx == 0 else 0
        after = 80 if idx == len(lines) - 1 else 0
        escaped = xml_escape(line if line else " ")
        paragraphs.append(
            f'<w:p><w:pPr>'
            f'<w:spacing w:before="{before}" w:after="{after}" w:line="240" w:lineRule="auto"/>'
            f'<w:ind w:left="240" w:right="240"/>'
            f'<w:shd w:val="clear" w:color="auto" w:fill="F8FAFC"/>'
            f'<w:pBdr>'
            f'<w:left w:val="single" w:sz="18" w:space="8" w:color="2563EB"/>'
            f'</w:pBdr>'
            f'</w:pPr>'
            f'<w:r><w:rPr>'
            f'<w:rFonts w:ascii="Consolas" w:hAnsi="Consolas" w:cs="Consolas"/>'
            f'<w:color w:val="0F172A"/><w:sz w:val="17"/>'
            f'</w:rPr><w:t xml:space="preserve">{escaped}</w:t></w:r></w:p>'
        )
    return "".join(paragraphs)


def make_table(rows: list[list[str]]) -> str:
    if not rows:
        return ""
    num_cols = max(len(r) for r in rows)
    col_width = max(int(9360 / num_cols), 1200)
    grid_cols = "".join(f'<w:gridCol w:w="{col_width}"/>' for _ in range(num_cols))

    tbl_pr = (
        '<w:tblPr>'
        '<w:tblW w:w="5000" w:type="pct"/>'
        '<w:tblBorders>'
        '<w:top w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>'
        '<w:left w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>'
        '<w:bottom w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>'
        '<w:right w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>'
        '<w:insideH w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>'
        '<w:insideV w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>'
        '</w:tblBorders>'
        '<w:tblCellMar>'
        '<w:top w:w="100" w:type="dxa"/>'
        '<w:left w:w="120" w:type="dxa"/>'
        '<w:bottom w:w="100" w:type="dxa"/>'
        '<w:right w:w="120" w:type="dxa"/>'
        '</w:tblCellMar>'
        '</w:tblPr>'
    )

    tr_xml = []
    for r_idx, row in enumerate(rows):
        is_header = r_idx == 0
        fill = "1E3A8A" if is_header else ("F8FAFC" if r_idx % 2 == 1 else "FFFFFF")
        text_color = "FFFFFF" if is_header else "1E293B"
        cells_xml = []
        for c_idx in range(num_cols):
            cell_text = row[c_idx].strip() if c_idx < len(row) else ""
            parts = re.split(r"<br\s*/?>", cell_text, flags=re.IGNORECASE)
            cell_paras = []
            for p_part in parts:
                runs = parse_inline_runs(
                    p_part.strip(),
                    default_color=text_color,
                    default_size=19 if is_header else 18,
                    force_bold=is_header,
                )
                cell_paras.append(
                    f'<w:p><w:pPr><w:spacing w:before="40" w:after="40" w:line="240" w:lineRule="auto"/></w:pPr>{runs}</w:p>'
                )
            tc_pr = (
                f'<w:tcPr>'
                f'<w:tcW w:w="{col_width}" w:type="dxa"/>'
                f'<w:shd w:val="clear" w:color="auto" w:fill="{fill}"/>'
                f'<w:vAlign w:val="center"/>'
                f'</w:tcPr>'
            )
            cells_xml.append(f'<w:tc>{tc_pr}{"".join(cell_paras)}</w:tc>')
        tr_pr = "<w:trPr><w:tblHeader/></w:trPr>" if is_header else ""
        tr_xml.append(f'<w:tr>{tr_pr}{"".join(cells_xml)}</w:tr>')

    return (
        f'<w:tbl>{tbl_pr}<w:tblGrid>{grid_cols}</w:tblGrid>{"".join(tr_xml)}</w:tbl>'
        f'<w:p><w:pPr><w:spacing w:before="60" w:after="60"/></w:pPr></w:p>'
    )


def convert_markdown_to_word_body(md_text: str) -> str:
    lines = md_text.splitlines()
    elements = []

    # Cover Header Banner
    elements.append(
        make_paragraph(
            "DOCUMENTO TÉCNICO DE INGENIERÍA DEVOPS & ARQUITECTURA CLOUD",
            align="left",
            space_before=0,
            space_after=40,
            color="2563EB",
            size=20,
            bold=True,
        )
    )

    in_code = False
    code_lang = ""
    code_buffer = []
    table_buffer = []

    def flush_table():
        nonlocal table_buffer
        if table_buffer:
            elements.append(make_table(table_buffer))
            table_buffer = []

    for raw_line in lines:
        line = raw_line.rstrip()

        if line.startswith("```"):
            flush_table()
            if not in_code:
                in_code = True
                code_lang = line[3:].strip().lower()
                code_buffer = []
            else:
                in_code = False
                if code_lang == "mermaid":
                    elements.append(
                        make_paragraph(
                            "Diagrama de Flujo del Pipeline CI/CD (GitHub Actions OIDC -> AWS S3/CloudFront & SSM EC2):",
                            align="left",
                            space_before=120,
                            space_after=60,
                            color="1E3A8A",
                            size=20,
                            bold=True,
                        )
                    )
                    flow_steps = [
                        "1. [Gobernanza y Pre-flight] Push a rama main -> Guard Main Actor Check -> Preflight & Schema Contract (20 tablas PostgreSQL)",
                        "2. [Federación Segura] GitHub OIDC Provider -> AWS STS AssumeRoleWithWebIdentity (Rol IAM: aws-git)",
                        "3A. [Liberación Frontends] Build React SPAs (Node 20) -> AWS S3 Sync -> Invalidación de Caché CloudFront (E1K516ITL1YDZ3 / E1NK74NZM8UYXZ)",
                        "3B. [Liberación Backend] Empaquetado backend_app.zip a S3 Staging -> AWS SSM Send-Command (Ejecución remota sin puerto 22/SSH)",
                        "4. [Despliegue y Verificación] Docker Compose Build & Up + Persistencia EBS (/mnt/ebs) -> Smoke Tests & SLA Healthcheck (/health)",
                    ]
                    elements.append(make_code_block(flow_steps))
                else:
                    elements.append(make_code_block(code_buffer))
                code_buffer = []
                code_lang = ""
            continue

        if in_code:
            code_buffer.append(line)
            continue

        # Table handling
        if line.strip().startswith("|") and line.strip().endswith("|"):
            cells = [c.strip() for c in line.strip()[1:-1].split("|")]
            # Skip separator rows like | :--- | :--- |
            if all(re.match(r"^:?-+:?$", c) for c in cells if c):
                continue
            table_buffer.append(cells)
            continue
        else:
            flush_table()

        if not line.strip() or line.strip() == "---":
            continue

        # Headings
        if line.startswith("# "):
            elements.append(
                make_paragraph(
                    line[2:].strip(),
                    style="Title",
                    align="left",
                    space_before=120,
                    space_after=200,
                    color="000000",
                    size=34,
                    bold=True,
                )
            )
        elif line.startswith("## "):
            elements.append(
                make_paragraph(
                    line[3:].strip(),
                    style="Heading1",
                    align="left",
                    space_before=280,
                    space_after=120,
                    color="000000",
                    size=28,
                    bold=True,
                )
            )
        elif line.startswith("### "):
            elements.append(
                make_paragraph(
                    line[4:].strip(),
                    style="Heading3",
                    align="left",
                    space_before=200,
                    space_after=80,
                    color="1D4ED8",
                    size=24,
                    bold=True,
                )
            )
        elif line.startswith("#### "):
            elements.append(
                make_paragraph(
                    line[5:].strip(),
                    style="Heading4",
                    align="left",
                    space_before=160,
                    space_after=60,
                    color="0F172A",
                    size=22,
                    bold=True,
                )
            )
        elif re.match(r"^\s*[\*\-•]\s+", line):
            indent_level = len(line) - len(line.lstrip())
            clean_item = re.sub(r"^\s*[\*\-•]\s+", "", line)
            bullet_prefix = "▪ " if indent_level >= 2 else "• "
            elements.append(
                make_paragraph(
                    bullet_prefix + clean_item,
                    align="both",
                    space_before=40,
                    space_after=60,
                    left_indent=360 if indent_level < 2 else 720,
                )
            )
        elif re.match(r"^\s*\d+\.\s+", line):
            indent_level = len(line) - len(line.lstrip())
            elements.append(
                make_paragraph(
                    line.strip(),
                    align="both",
                    space_before=40,
                    space_after=60,
                    left_indent=360 if indent_level < 2 else 720,
                )
            )
        else:
            elements.append(make_paragraph(line.strip()))

    flush_table()
    return "".join(elements)


def build_docx(md_path: Path, docx_path: Path):
    md_text = md_path.read_text(encoding="utf-8")
    body_content = convert_markdown_to_word_body(md_text)

    content_types_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>"""

    rels_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>"""

    word_rels_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>"""

    styles_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:rPr>
      <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>
      <w:sz w:val="21"/>
      <w:color w:val="1F2937"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Title">
    <w:name w:val="Title"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr><w:keepNext/></w:pPr>
    <w:rPr><w:b/><w:sz w:val="34"/><w:color w:val="000000"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr><w:keepNext/><w:outlineLvl w:val="0"/></w:pPr>
    <w:rPr><w:b/><w:sz w:val="28"/><w:color w:val="000000"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading3">
    <w:name w:val="heading 3"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr><w:keepNext/></w:pPr>
    <w:rPr><w:b/><w:sz w:val="24"/><w:color w:val="1D4ED8"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading4">
    <w:name w:val="heading 4"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr><w:keepNext/></w:pPr>
    <w:rPr><w:b/><w:sz w:val="22"/><w:color w:val="0F172A"/></w:rPr>
  </w:style>
</w:styles>"""

    document_xml = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    {body_content}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="720" w:footer="720" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>"""

    with zipfile.ZipFile(docx_path, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("[Content_Types].xml", content_types_xml)
        zf.writestr("_rels/.rels", rels_xml)
        zf.writestr("word/_rels/document.xml.rels", word_rels_xml)
        zf.writestr("word/styles.xml", styles_xml)
        zf.writestr("word/document.xml", document_xml)

    print(f"[OK] Documento Word generado en: {docx_path} ({docx_path.stat().st_size:,} bytes)")


if __name__ == "__main__":
    build_docx(MD_PATH, DOCX_PATH)
