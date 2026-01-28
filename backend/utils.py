import os
import json
from typing import Any, Dict, List

def save_catalog(catalog_db: List[Dict[str, Any]]) -> None:
    os.makedirs('data', exist_ok=True)
    with open('data/catalog.json', 'w') as f:
        json.dump(catalog_db, f, indent=2)

def save_test_pricing(pricing_db: Dict[str, Any]) -> None:
    os.makedirs('data', exist_ok=True)
    with open('data/test_pricing.json', 'w') as f:
        json.dump(pricing_db, f, indent=2)

def save_rfps(rfps_db: List[Dict[str, Any]]) -> None:
    os.makedirs('data', exist_ok=True)
    with open('data/rfps.json', 'w') as f:
        json.dump(rfps_db, f, indent=2)


def generate_pdf_report(output_path: str, title: str, sections: list):
    """Generate a professional PDF report with proper text wrapping and formatting."""
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Preformatted
    from reportlab.lib.enums import TA_LEFT, TA_CENTER
    from reportlab.lib import colors
    import re

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        rightMargin=inch,
        leftMargin=inch,
        topMargin=inch,
        bottomMargin=inch
    )
    
    story = []
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=colors.HexColor('#1a1a1a'),
        spaceAfter=30,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#2c3e50'),
        spaceAfter=12,
        spaceBefore=20,
        fontName='Helvetica-Bold'
    )
    
    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['BodyText'],
        fontSize=9,
        textColor=colors.HexColor('#333333'),
        spaceAfter=8,
        leading=12,
        fontName='Helvetica'
    )
    
    story.append(Paragraph(title, title_style))
    story.append(Spacer(1, 0.3 * inch))
    
    for heading, body in sections:
        story.append(Paragraph(heading, heading_style))
        
        if body:
            # Convert markdown to plain text safely
            clean_text = body
            # Remove all markdown formatting
            clean_text = re.sub(r'\*\*(.+?)\*\*', r'\1', clean_text)  # Bold
            clean_text = re.sub(r'\*(.+?)\*', r'\1', clean_text)  # Italic  
            clean_text = re.sub(r'`(.+?)`', r'"\1"', clean_text)  # Code to quotes
            clean_text = re.sub(r'#+\s+', '', clean_text)  # Headers
            clean_text = re.sub(r'\[(.+?)\]\(.+?\)', r'\1', clean_text)  # Links
            clean_text = re.sub(r'[|]', ' | ', clean_text)  # Table separators
            
            # Use Preformatted for better plain text rendering
            lines = clean_text.split('\n')
            for line in lines:
                if line.strip():
                    # Escape HTML entities for safety
                    safe_line = line.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
                    try:
                        story.append(Preformatted(safe_line, body_style, maxLineLength=80))
                    except:
                        # Fallback to plain paragraph if preformatted fails
                        story.append(Paragraph(safe_line, body_style))
            
            story.append(Spacer(1, 0.1 * inch))
        
        story.append(Spacer(1, 0.2 * inch))
    
    doc.build(story)
    print(f"📄 PDF report generated: {output_path}")
