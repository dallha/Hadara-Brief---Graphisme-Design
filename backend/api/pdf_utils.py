import os
import datetime
from io import BytesIO
from django.conf import settings
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm

def generate_brief_pdf(brief):
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4,
                            rightMargin=2*cm, leftMargin=2*cm,
                            topMargin=2*cm, bottomMargin=2*cm)
    
    Story = []
    styles = getSampleStyleSheet()
    
    # Custom Styles
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        textColor=colors.HexColor('#FBBF24'), # Amber 400
        spaceAfter=12
    )
    
    heading2_style = ParagraphStyle(
        'Heading2Style',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=16,
        textColor=colors.HexColor('#0F172A'), # Slate 900
        spaceBefore=12,
        spaceAfter=6
    )
    
    normal_style = styles['Normal']
    normal_style.fontSize = 11
    normal_style.leading = 14
    
    # Header Section
    Story.append(Paragraph("HADARA STUDIO", title_style))
    Story.append(Paragraph("<b>Devis & Résumé du Projet</b>", heading2_style))
    Story.append(Spacer(1, 0.5*cm))
    
    # Client Info Table
    client_data = [
        ['Client:', brief.clientName],
        ['Organisation:', brief.organization or 'N/A'],
        ['Contact:', brief.whatsapp],
        ['Email:', brief.email or 'N/A'],
        ['Date de demande:', brief.createdAt],
        ['Référence:', f"BRF-{str(brief.id)[:8].upper()}"],
    ]
    
    client_table = Table(client_data, colWidths=[4*cm, 10*cm])
    client_table.setStyle(TableStyle([
        ('TEXTCOLOR', (0,0), (0,-1), colors.HexColor('#475569')),
        ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
    ]))
    Story.append(client_table)
    Story.append(Spacer(1, 1*cm))
    
    # Project Details
    Story.append(Paragraph("1. Détails du Projet", heading2_style))
    
    project_data = [
        ['Type de Projet:', brief.projectType.capitalize()],
        ['Titre Principal:', brief.mainTitle],
        ['Format Technique:', brief.technicalFormat],
        ['Style Graphique:', brief.stylePreference.replace('_', ' ').capitalize()],
        ['Couleurs:', brief.colors or 'Laissées à l\'appréciation du graphiste'],
    ]
    
    project_table = Table(project_data, colWidths=[4*cm, 10*cm])
    project_table.setStyle(TableStyle([
        ('TEXTCOLOR', (0,0), (0,-1), colors.HexColor('#475569')),
        ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
    ]))
    Story.append(project_table)
    Story.append(Spacer(1, 0.5*cm))
    
    # Description text
    if brief.textContent:
        Story.append(Paragraph("<b>Contenu / Textes à intégrer:</b>", normal_style))
        Story.append(Paragraph(brief.textContent, normal_style))
        Story.append(Spacer(1, 0.5*cm))
    
    if brief.additionalInfo:
        Story.append(Paragraph("<b>Informations Additionnelles:</b>", normal_style))
        Story.append(Paragraph(brief.additionalInfo, normal_style))
        Story.append(Spacer(1, 1*cm))
    
    # Pricing & Status
    Story.append(Paragraph("2. Estimation Budgétaire", heading2_style))
    
    budget = f"{brief.quotedPriceFCFA:,} FCFA" if brief.quotedPriceFCFA else "Sur devis (En attente d'évaluation)"
    
    price_data = [
        ['Statut Actuel:', brief.status.replace('_', ' ').title()],
        ['Budget Initial:', brief.budgetRange],
        ['Prix Devisé:', budget],
    ]
    
    price_table = Table(price_data, colWidths=[4*cm, 10*cm])
    price_table.setStyle(TableStyle([
        ('TEXTCOLOR', (0,0), (0,-1), colors.HexColor('#475569')),
        ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
    ]))
    Story.append(price_table)
    Story.append(Spacer(1, 1.5*cm))
    
    # Footer Note
    footer_text = (
        "Merci pour votre confiance ! <br/>"
        "Hadara Studio - Design Graphique & Stratégie Digitale<br/>"
        "Contact: +221 7X XXX XX XX | Email: contact@hadara-design.com"
    )
    Story.append(Paragraph(footer_text, ParagraphStyle('Footer', parent=normal_style, alignment=1, textColor=colors.HexColor('#64748B'))))
    
    doc.build(Story)
    pdf = buffer.getvalue()
    buffer.close()
    return pdf
