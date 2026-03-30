#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SOS Hub Canada - Guide d'Onboarding CRM pour le Staff
PDF professionnel avec tous les modules
"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch, cm
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, ListFlowable, ListItem, KeepTogether, HRFlowable
)
from reportlab.platypus.flowables import Flowable
from reportlab.pdfgen import canvas
from reportlab.lib.utils import simpleSplit
import os

# ── Colors ──
NAVY = HexColor('#1B2559')
GOLD = HexColor('#D4A03C')
DARK_NAVY = HexColor('#0F1740')
LIGHT_GOLD = HexColor('#FEF3C7')
GREEN = HexColor('#059669')
LIGHT_GREEN = HexColor('#D1FAE5')
RED = HexColor('#DC2626')
LIGHT_RED = HexColor('#FEE2E2')
BLUE = HexColor('#2563EB')
LIGHT_BLUE = HexColor('#DBEAFE')
SLATE = HexColor('#475569')
LIGHT_SLATE = HexColor('#F1F5F9')
MEDIUM_SLATE = HexColor('#94A3B8')
WHITE = HexColor('#FFFFFF')
ORANGE = HexColor('#EA580C')
LIGHT_ORANGE = HexColor('#FFF7ED')

OUTPUT = os.path.expanduser("~/Downloads/_CLAUDE Code 2026/SOS_Hub_Canada_Guide_Onboarding_CRM.pdf")

# ── Custom Flowables ──
class ColorBox(Flowable):
    """A colored box with icon, title and text"""
    def __init__(self, icon, title, text, bg_color, border_color, width=6.5*inch):
        Flowable.__init__(self)
        self.icon = icon
        self.title = title
        self.text = text
        self.bg = bg_color
        self.border = border_color
        self.box_width = width
        self.box_height = 0.9*inch if len(text) < 80 else 1.1*inch

    def wrap(self, aW, aH):
        return (self.box_width, self.box_height)

    def draw(self):
        c = self.canv
        c.setFillColor(self.bg)
        c.setStrokeColor(self.border)
        c.setLineWidth(1.5)
        c.roundRect(0, 0, self.box_width, self.box_height, 6, fill=1, stroke=1)
        # Left accent bar
        c.setFillColor(self.border)
        c.roundRect(0, 0, 5, self.box_height, 3, fill=1, stroke=0)
        # Icon
        c.setFont("Helvetica-Bold", 16)
        c.setFillColor(self.border)
        c.drawString(16, self.box_height - 24, self.icon)
        # Title
        c.setFont("Helvetica-Bold", 11)
        c.drawString(38, self.box_height - 24, self.title)
        # Text
        c.setFont("Helvetica", 9)
        c.setFillColor(SLATE)
        lines = simpleSplit(self.text, "Helvetica", 9, self.box_width - 54)
        y = self.box_height - 42
        for line in lines[:3]:
            c.drawString(38, y, line)
            y -= 13

class StepBox(Flowable):
    """A numbered step with description"""
    def __init__(self, number, title, desc, width=6.5*inch):
        Flowable.__init__(self)
        self.number = str(number)
        self.title = title
        self.desc = desc
        self.box_width = width
        self.box_height = 0.7*inch

    def wrap(self, aW, aH):
        return (self.box_width, self.box_height)

    def draw(self):
        c = self.canv
        # Number circle
        c.setFillColor(GOLD)
        c.circle(16, self.box_height/2, 14, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 14)
        c.drawCentredString(16, self.box_height/2 - 5, self.number)
        # Title
        c.setFillColor(NAVY)
        c.setFont("Helvetica-Bold", 11)
        c.drawString(40, self.box_height/2 + 6, self.title)
        # Desc
        c.setFillColor(SLATE)
        c.setFont("Helvetica", 9)
        lines = simpleSplit(self.desc, "Helvetica", 9, self.box_width - 50)
        y = self.box_height/2 - 10
        for line in lines[:2]:
            c.drawString(40, y, line)
            y -= 12

class SectionHeader(Flowable):
    """Module section header with number"""
    def __init__(self, number, title, subtitle="", width=6.5*inch):
        Flowable.__init__(self)
        self.number = number
        self.title = title
        self.subtitle = subtitle
        self.box_width = width
        self.box_height = 0.85*inch

    def wrap(self, aW, aH):
        return (self.box_width, self.box_height)

    def draw(self):
        c = self.canv
        # Full-width navy bar
        c.setFillColor(NAVY)
        c.roundRect(0, 0, self.box_width, self.box_height, 8, fill=1, stroke=0)
        # Gold accent left
        c.setFillColor(GOLD)
        c.roundRect(0, 0, 6, self.box_height, 3, fill=1, stroke=0)
        # Module number
        c.setFillColor(GOLD)
        c.setFont("Helvetica-Bold", 10)
        c.drawString(20, self.box_height - 22, f"MODULE {self.number}")
        # Title
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 18)
        c.drawString(20, self.box_height - 46, self.title)
        # Subtitle
        if self.subtitle:
            c.setFillColor(HexColor('#94A3B8'))
            c.setFont("Helvetica", 9)
            c.drawString(20, self.box_height - 62, self.subtitle)

# ── Page Templates ──
def cover_page(canvas_obj, doc):
    c = canvas_obj
    w, h = letter
    # Navy background
    c.setFillColor(NAVY)
    c.rect(0, 0, w, h, fill=1, stroke=0)
    # Gold accent bar top
    c.setFillColor(GOLD)
    c.rect(0, h-8, w, 8, fill=1, stroke=0)
    # Logo area
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 36)
    c.drawCentredString(w/2, h - 180, "[ SOS")
    c.setFillColor(GOLD)
    c.drawString(w/2 + 18, h - 180, "HUB ]")
    c.setFillColor(GOLD)
    c.setFont("Helvetica-Bold", 11)
    c.drawCentredString(w/2, h - 200, "IMMIGRATION CANADA")
    # Title
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 32)
    c.drawCentredString(w/2, h - 300, "GUIDE D'ONBOARDING")
    c.setFont("Helvetica-Bold", 28)
    c.drawCentredString(w/2, h - 340, "CRM INTERNE")
    # Gold line
    c.setStrokeColor(GOLD)
    c.setLineWidth(3)
    c.line(w/2 - 120, h - 365, w/2 + 120, h - 365)
    # Subtitle
    c.setFillColor(MEDIUM_SLATE)
    c.setFont("Helvetica", 14)
    c.drawCentredString(w/2, h - 400, "Manuel de formation pour le personnel")
    c.drawCentredString(w/2, h - 420, "soshubca.vercel.app/crm")
    # Version
    c.setFillColor(GOLD)
    c.setFont("Helvetica-Bold", 11)
    c.drawCentredString(w/2, 120, "Version 1.0 - Mars 2026")
    c.setFillColor(MEDIUM_SLATE)
    c.setFont("Helvetica", 10)
    c.drawCentredString(w/2, 100, "Document confidentiel - Usage interne uniquement")
    # Bottom gold bar
    c.setFillColor(GOLD)
    c.rect(0, 0, w, 6, fill=1, stroke=0)

def header_footer(canvas_obj, doc):
    c = canvas_obj
    w, h = letter
    # Header line
    c.setStrokeColor(LIGHT_SLATE)
    c.setLineWidth(0.5)
    c.line(0.75*inch, h - 0.5*inch, w - 0.75*inch, h - 0.5*inch)
    # Header text
    c.setFont("Helvetica-Bold", 8)
    c.setFillColor(NAVY)
    c.drawString(0.75*inch, h - 0.45*inch, "SOS Hub Canada")
    c.setFillColor(GOLD)
    c.drawString(1.7*inch, h - 0.45*inch, "| Guide d'Onboarding CRM")
    c.setFillColor(MEDIUM_SLATE)
    c.setFont("Helvetica", 8)
    c.drawRightString(w - 0.75*inch, h - 0.45*inch, "Confidentiel")
    # Footer
    c.setStrokeColor(LIGHT_SLATE)
    c.line(0.75*inch, 0.55*inch, w - 0.75*inch, 0.55*inch)
    c.setFillColor(MEDIUM_SLATE)
    c.setFont("Helvetica", 8)
    c.drawString(0.75*inch, 0.35*inch, "SOS Hub Canada Inc. | 3737 Cremazie Est #402, Montreal QC H1Z 2K4")
    c.drawRightString(w - 0.75*inch, 0.35*inch, f"Page {doc.page}")

# ── Build PDF ──
def build():
    doc = SimpleDocTemplate(
        OUTPUT,
        pagesize=letter,
        topMargin=0.75*inch,
        bottomMargin=0.75*inch,
        leftMargin=0.75*inch,
        rightMargin=0.75*inch,
    )

    styles = getSampleStyleSheet()
    W = 6.5 * inch

    # Custom styles
    s_h1 = ParagraphStyle('H1', parent=styles['Heading1'], fontName='Helvetica-Bold',
                          fontSize=18, textColor=NAVY, spaceAfter=6, spaceBefore=16)
    s_h2 = ParagraphStyle('H2', parent=styles['Heading2'], fontName='Helvetica-Bold',
                          fontSize=13, textColor=NAVY, spaceAfter=4, spaceBefore=12)
    s_h3 = ParagraphStyle('H3', parent=styles['Heading3'], fontName='Helvetica-Bold',
                          fontSize=11, textColor=NAVY, spaceAfter=4, spaceBefore=8)
    s_body = ParagraphStyle('Body', parent=styles['Normal'], fontName='Helvetica',
                            fontSize=10, textColor=SLATE, leading=14, alignment=TA_JUSTIFY, spaceAfter=6)
    s_bold = ParagraphStyle('Bold', parent=s_body, fontName='Helvetica-Bold', textColor=NAVY)
    s_small = ParagraphStyle('Small', parent=s_body, fontSize=9, textColor=MEDIUM_SLATE)
    s_gold = ParagraphStyle('GoldLabel', parent=s_body, fontName='Helvetica-Bold',
                            fontSize=9, textColor=GOLD, spaceAfter=2)
    s_bullet = ParagraphStyle('Bullet', parent=s_body, leftIndent=20, bulletIndent=8,
                              bulletFontName='Helvetica', bulletFontSize=10)
    s_center = ParagraphStyle('Center', parent=s_body, alignment=TA_CENTER)
    s_tip = ParagraphStyle('Tip', parent=s_body, fontSize=9, textColor=GREEN,
                           fontName='Helvetica-Oblique', leftIndent=12)

    story = []

    # ══════════════════════════════════════════
    # COVER PAGE
    # ══════════════════════════════════════════
    story.append(Spacer(1, 0.1*inch))
    story.append(PageBreak())

    # ══════════════════════════════════════════
    # TABLE DES MATIERES
    # ══════════════════════════════════════════
    story.append(Paragraph("TABLE DES MATIERES", s_h1))
    story.append(Spacer(1, 0.2*inch))

    toc_items = [
        ("1", "Connexion et Navigation", "Acces, roles, interface principale"),
        ("2", "Tableau de Bord", "KPIs, pipeline, alertes, revenus"),
        ("3", "Gestion des Clients", "Creation, profils, documents, notes de suivi"),
        ("4", "Gestion des Dossiers", "Creation de dossiers, statuts, timeline, taches"),
        ("5", "Analyse d'Admissibilite", "Scoring CRS/MIFI, recommandations, rapports"),
        ("6", "Formulaires IRCC", "Bibliotheque, auto-remplissage, soumission"),
        ("7", "Contrats et Facturation", "Contrats, signatures, factures, paiements"),
        ("8", "Calendrier et Rendez-vous", "Disponibilites, reservations, confirmations"),
        ("9", "Portail Client", "Acces client, documents, suivi de dossier"),
        ("10", "Portail Employeurs", "EIMT/LMIA, documents, jumelage"),
        ("11", "Agent IA", "Chatbot, base de connaissances, delais IRCC"),
        ("12", "Rapports et Analyses", "KPIs, exports CSV, performance"),
        ("13", "Parametres et Securite", "Equipe, roles, permissions, audit"),
        ("14", "Workflow Nouveau Client", "Processus complet de A a Z"),
    ]

    toc_data = [["#", "Module", "Contenu"]]
    for num, title, desc in toc_items:
        toc_data.append([num, title, desc])

    toc_table = Table(toc_data, colWidths=[0.4*inch, 2.2*inch, 3.9*inch])
    toc_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('TEXTCOLOR', (0, 1), (0, -1), GOLD),
        ('TEXTCOLOR', (1, 1), (1, -1), NAVY),
        ('TEXTCOLOR', (2, 1), (2, -1), SLATE),
        ('FONTNAME', (1, 1), (1, -1), 'Helvetica-Bold'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, LIGHT_SLATE]),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#E2E8F0')),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ROUNDEDCORNERS', [4, 4, 4, 4]),
    ]))
    story.append(toc_table)
    story.append(PageBreak())

    # ══════════════════════════════════════════
    # MODULE 1: CONNEXION ET NAVIGATION
    # ══════════════════════════════════════════
    story.append(SectionHeader("01", "CONNEXION ET NAVIGATION", "Acces au CRM, roles utilisateur, interface"))
    story.append(Spacer(1, 0.3*inch))

    story.append(Paragraph("1.1 Se connecter au CRM", s_h2))
    story.append(Paragraph(
        "Accedez au CRM via <b>soshubca.vercel.app/crm</b>. L'ecran de connexion demande votre <b>courriel</b> "
        "et <b>mot de passe</b> Supabase. Si vous n'avez pas encore de compte, demandez a votre superviseur (superadmin) "
        "de vous en creer un depuis Parametres > Equipe.", s_body))

    story.append(ColorBox("!", "IMPORTANT", "Ne partagez jamais vos identifiants. Chaque action est enregistree dans le journal d'audit avec votre nom.", LIGHT_RED, RED))
    story.append(Spacer(1, 0.15*inch))

    story.append(Paragraph("1.2 Les 6 roles du CRM", s_h2))
    roles_data = [
        ["Role", "Acces", "Actions cles"],
        ["Superadmin", "Tout", "Creer/supprimer utilisateurs, parametres, audit"],
        ["Coordinatrice", "Tout sauf suppression", "Gerer equipe, assigner dossiers, rapports"],
        ["Avocat / Consultant", "Dossiers, clients, formulaires", "Analyse, formulaires IRCC, contrats"],
        ["Technicienne juridique", "Dossiers, documents", "Preparation formulaires, documents"],
        ["Conseiller", "Clients, dossiers", "Suivi clients, rendez-vous"],
        ["Receptionniste", "Leads, calendrier", "Accueil, prise RDV, saisie leads"],
    ]
    rt = Table(roles_data, colWidths=[1.5*inch, 2*inch, 3*inch])
    rt.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('TEXTCOLOR', (0, 1), (0, -1), NAVY),
        ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
        ('TEXTCOLOR', (1, 1), (-1, -1), SLATE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, LIGHT_SLATE]),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#E2E8F0')),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(rt)
    story.append(Spacer(1, 0.15*inch))

    story.append(Paragraph("1.3 Navigation principale (barre laterale)", s_h2))
    nav_items = [
        "Tableau de bord - Vue d'ensemble des KPIs et alertes",
        "Clients - Liste et gestion de tous les clients",
        "Dossiers - Suivi des dossiers d'immigration",
        "Analyse / Scoring - Calcul CRS, MIFI, admissibilite",
        "Formulaires - Bibliotheque IRCC avec auto-remplissage",
        "Contrats - Gestion des contrats de service",
        "Facturation - Factures et suivi des paiements",
        "Calendrier - Rendez-vous et disponibilites",
        "Portail Client - Acces client libre-service",
        "Portail Employeurs - EIMT/LMIA et employeurs partenaires",
        "Agent IA - Chatbot d'aide a l'immigration",
        "Rapports - Analyses et exports",
        "Parametres - Administration et securite",
    ]
    for item in nav_items:
        parts = item.split(" - ")
        story.append(Paragraph(f"<bullet>&bull;</bullet> <b>{parts[0]}</b> - {parts[1]}", s_bullet))

    story.append(Spacer(1, 0.1*inch))
    story.append(ColorBox("*", "ASTUCE", "La barre laterale est repliable. Cliquez sur le bouton hamburger pour gagner de l'espace ecran. La recherche globale (en haut) cherche dans clients, dossiers et employeurs simultanement.", LIGHT_BLUE, BLUE))

    story.append(PageBreak())

    # ══════════════════════════════════════════
    # MODULE 2: TABLEAU DE BORD
    # ══════════════════════════════════════════
    story.append(SectionHeader("02", "TABLEAU DE BORD", "KPIs en temps reel, pipeline, alertes urgentes"))
    story.append(Spacer(1, 0.3*inch))

    story.append(Paragraph("Le tableau de bord est votre page d'accueil. Il affiche en temps reel les indicateurs cles de l'entreprise.", s_body))
    story.append(Spacer(1, 0.1*inch))

    story.append(Paragraph("2.1 Les 6 KPIs principaux", s_h2))
    kpi_data = [
        ["KPI", "Description", "Action si anormal"],
        ["Clients actifs", "Nombre de clients avec statut actif", "Verifier les clients inactifs depuis 30j+"],
        ["Dossiers ouverts", "Cas en traitement (non fermes)", "Prioriser les dossiers en retard"],
        ["Contrats en attente", "Contrats non signes", "Relancer par courriel ou telephone"],
        ["Revenus du mois", "Total facture et paye ce mois", "Comparer avec objectif mensuel"],
        ["RDV aujourd'hui", "Rendez-vous planifies", "Preparer les dossiers avant chaque RDV"],
        ["Alertes documents", "Documents expires ou manquants", "Contacter le client immediatement"],
    ]
    kt = Table(kpi_data, colWidths=[1.4*inch, 2.2*inch, 2.9*inch])
    kt.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8.5),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('TEXTCOLOR', (0, 1), (0, -1), NAVY),
        ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
        ('TEXTCOLOR', (1, 1), (-1, -1), SLATE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, LIGHT_SLATE]),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#E2E8F0')),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(kt)
    story.append(Spacer(1, 0.15*inch))

    story.append(Paragraph("2.2 Pipeline des dossiers", s_h2))
    story.append(Paragraph(
        "La barre de pipeline montre visuellement la distribution des dossiers par statut : "
        "<b>Nouveau > Consultation > Preparation > Formulaires > Revision > Soumis > Traitement IRCC > Approuve/Refuse</b>. "
        "Survolez chaque segment pour voir le nombre exact.", s_body))

    story.append(Paragraph("2.3 Alertes urgentes", s_h2))
    story.append(ColorBox("!", "PRIORITE", "Les alertes rouges (dossiers en retard, documents expires, priorite urgente) doivent etre traitees en premier chaque matin. C'est la premiere chose a verifier a votre arrivee.", LIGHT_ORANGE, ORANGE))

    story.append(PageBreak())

    # ══════════════════════════════════════════
    # MODULE 3: GESTION DES CLIENTS
    # ══════════════════════════════════════════
    story.append(SectionHeader("03", "GESTION DES CLIENTS", "Creation, profils complets, documents, notes de suivi"))
    story.append(Spacer(1, 0.3*inch))

    story.append(ColorBox("*", "MODULE CLE", "C'est le module le plus utilise au quotidien. Chaque interaction avec un client passe par cette section. Maitrisez-le parfaitement.", LIGHT_GOLD, GOLD))
    story.append(Spacer(1, 0.15*inch))

    story.append(Paragraph("3.1 Creer un nouveau client", s_h2))
    story.append(StepBox(1, "Cliquer sur '+ Nouveau Client'", "Le bouton se trouve en haut a droite de la page Clients."))
    story.append(StepBox(2, "Remplir les informations personnelles", "Prenom, nom, courriel (obligatoire), telephone, date de naissance, pays de residence, nationalite."))
    story.append(StepBox(3, "Definir le profil immigration", "Statut actuel, programme d'interet, niveau de francais/anglais, education, experience professionnelle."))
    story.append(StepBox(4, "Ajouter une photo (optionnel)", "Cliquez sur l'avatar pour telecharger une photo du client. Aide a l'identification rapide."))
    story.append(StepBox(5, "Sauvegarder", "Le client recoit automatiquement le statut 'prospect'. Changez-le apres la consultation initiale."))
    story.append(Spacer(1, 0.1*inch))

    story.append(Paragraph("3.2 Statuts des clients", s_h2))
    status_data = [
        ["Statut", "Signification", "Prochaine action"],
        ["Prospect", "Lead recu, pas encore contacte", "Appeler dans les 24h"],
        ["Actif", "Client confirme, dossier en cours", "Suivi regulier"],
        ["En attente", "Attend un document ou une reponse", "Relance apres 7 jours"],
        ["Inactif", "Pas de nouvelles depuis 30j+", "Courriel de suivi"],
        ["Ferme", "Dossier termine ou abandonne", "Archiver"],
    ]
    st = Table(status_data, colWidths=[1.2*inch, 2.2*inch, 3.1*inch])
    st.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
        ('TEXTCOLOR', (1, 1), (-1, -1), SLATE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, LIGHT_SLATE]),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#E2E8F0')),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        # Color code statuses
        ('TEXTCOLOR', (0, 1), (0, 1), BLUE),
        ('TEXTCOLOR', (0, 2), (0, 2), GREEN),
        ('TEXTCOLOR', (0, 3), (0, 3), ORANGE),
        ('TEXTCOLOR', (0, 4), (0, 4), MEDIUM_SLATE),
        ('TEXTCOLOR', (0, 5), (0, 5), RED),
    ]))
    story.append(st)
    story.append(Spacer(1, 0.15*inch))

    story.append(Paragraph("3.3 Notes de suivi (NOUVEAU)", s_h2))
    story.append(Paragraph(
        "Chaque client dispose d'un <b>onglet Notes</b> pour documenter toutes les interactions. "
        "Les notes sont horodatees automatiquement avec le nom de l'utilisateur.", s_body))

    notes_items = [
        "Cliquez sur l'onglet 'Notes' dans le profil client",
        "Selectionnez la categorie : Appel, Courriel, Reunion, Suivi, Document, Autre",
        "Redigez votre note (minimum 10 caracteres recommande)",
        "La note est enregistree avec date, heure et votre nom",
        "Utilisez 'Epingler' pour garder une note importante visible en haut",
    ]
    for i, item in enumerate(notes_items):
        story.append(Paragraph(f"<bullet>&bull;</bullet> {item}", s_bullet))

    story.append(Spacer(1, 0.1*inch))
    story.append(ColorBox("*", "BEST PRACTICE", "Documentez CHAQUE interaction avec le client. Si ce n'est pas dans les notes, ca n'a pas eu lieu. Cela protege l'entreprise et assure la continuite du suivi si un collegue reprend le dossier.", LIGHT_GREEN, GREEN))

    story.append(Spacer(1, 0.15*inch))
    story.append(Paragraph("3.4 Gestion des documents client", s_h2))
    story.append(Paragraph("L'onglet <b>Documents</b> permet de telecharger, categoriser et suivre l'etat des documents.", s_body))

    doc_cats = [
        ["Categorie", "Exemples"],
        ["Identite", "Passeport, carte d'identite, acte de naissance"],
        ["Education", "Diplomes, releves de notes, equivalences (WES/ECA)"],
        ["Emploi", "Lettres d'emploi, CV, contrats de travail"],
        ["Medical", "Examen medical designe (EMD), vaccins"],
        ["Police", "Certificats de police, antecedents judiciaires"],
        ["Financier", "Preuves de fonds, releves bancaires"],
        ["Langue", "Resultats TEF/TCF, IELTS, CELPIP"],
        ["Autre", "Tout autre document pertinent"],
    ]
    dt = Table(doc_cats, colWidths=[1.4*inch, 5.1*inch])
    dt.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
        ('TEXTCOLOR', (0, 1), (0, -1), NAVY),
        ('TEXTCOLOR', (1, 1), (-1, -1), SLATE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, LIGHT_SLATE]),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#E2E8F0')),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(dt)

    story.append(Spacer(1, 0.1*inch))
    story.append(Paragraph("3.5 Import CSV en masse", s_h2))
    story.append(Paragraph(
        "Pour importer plusieurs clients d'un coup, utilisez le bouton <b>Importer CSV</b>. "
        "Le systeme detecte automatiquement les colonnes et verifie les doublons.", s_body))

    story.append(PageBreak())

    # ══════════════════════════════════════════
    # MODULE 4: GESTION DES DOSSIERS
    # ══════════════════════════════════════════
    story.append(SectionHeader("04", "GESTION DES DOSSIERS", "Creation, statuts, timeline, taches, scoring"))
    story.append(Spacer(1, 0.3*inch))

    story.append(Paragraph("4.1 Creer un dossier", s_h2))
    story.append(Paragraph(
        "Un dossier (cas) represente une demande d'immigration specifique. Un client peut avoir "
        "plusieurs dossiers (ex: permis de travail + residence permanente).", s_body))

    story.append(StepBox(1, "Depuis le profil client ou la page Dossiers", "Cliquez '+ Nouveau Dossier' et selectionnez le client."))
    story.append(StepBox(2, "Choisir le programme d'immigration", "Entree Express, PEQ, PSTQ, Permis travail, Permis etudes, Parrainage, etc."))
    story.append(StepBox(3, "Definir la priorite", "Normal, Haute, Urgente. Les dossiers urgents apparaissent en rouge dans le tableau de bord."))
    story.append(StepBox(4, "Assigner un responsable", "Selectionnez le conseiller ou avocat qui prend en charge le dossier."))
    story.append(Spacer(1, 0.1*inch))

    story.append(Paragraph("4.2 Pipeline des statuts", s_h2))
    pipeline_data = [
        ["Statut", "Description", "Duree typique"],
        ["Nouveau", "Dossier cree, pas encore traite", "0-2 jours"],
        ["Consultation", "RDV initial avec le client", "1 semaine"],
        ["Preparation", "Collecte de documents", "2-4 semaines"],
        ["Formulaires", "Remplissage des formulaires IRCC", "1-2 semaines"],
        ["Revision", "Verification finale avant soumission", "3-5 jours"],
        ["Soumis", "Demande deposee aupres d'IRCC", "1 jour"],
        ["Traitement IRCC", "En attente de decision", "3-12 mois"],
        ["Approuve / Refuse", "Decision recue", "Final"],
    ]
    pt = Table(pipeline_data, colWidths=[1.5*inch, 2.8*inch, 2.2*inch])
    pt.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
        ('TEXTCOLOR', (0, 1), (0, -1), NAVY),
        ('TEXTCOLOR', (1, 1), (-1, -1), SLATE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, LIGHT_SLATE]),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#E2E8F0')),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(pt)
    story.append(Spacer(1, 0.1*inch))

    story.append(Paragraph("4.3 Gestion des taches", s_h2))
    story.append(Paragraph(
        "Chaque dossier a un gestionnaire de taches integre. Creez des taches pour chaque etape "
        "et suivez leur progression : <b>A faire > En cours > Termine</b>.", s_body))

    story.append(ColorBox("*", "BEST PRACTICE", "Creez les taches des l'ouverture du dossier selon la checklist du programme. Assignez des echeances realistes. Les taches en retard apparaissent automatiquement dans les alertes du tableau de bord.", LIGHT_GREEN, GREEN))

    story.append(PageBreak())

    # ══════════════════════════════════════════
    # MODULE 5: ANALYSE D'ADMISSIBILITE
    # ══════════════════════════════════════════
    story.append(SectionHeader("05", "ANALYSE D'ADMISSIBILITE", "Scoring CRS, MIFI, recommandations, rapport premium"))
    story.append(Spacer(1, 0.3*inch))

    story.append(Paragraph(
        "Le module d'analyse calcule automatiquement les scores d'admissibilite du client "
        "pour tous les programmes federaux et provinciaux.", s_body))

    story.append(Paragraph("5.1 Types de scoring", s_h2))
    scoring_data = [
        ["Type", "Programmes", "Score max"],
        ["CRS (federal)", "Entree Express (FSW, CEC, FST)", "1200 points"],
        ["MIFI (Quebec)", "PEQ, PSTQ, Arrima", "Variable"],
        ["Admissibilite generale", "Tous les 18 programmes", "Eligible/Non eligible"],
    ]
    sct = Table(scoring_data, colWidths=[1.8*inch, 2.8*inch, 1.9*inch])
    sct.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
        ('TEXTCOLOR', (0, 1), (0, -1), NAVY),
        ('TEXTCOLOR', (1, 1), (-1, -1), SLATE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, LIGHT_SLATE]),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#E2E8F0')),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(sct)
    story.append(Spacer(1, 0.1*inch))

    story.append(Paragraph("5.2 Generer un rapport d'analyse", s_h2))
    story.append(StepBox(1, "Selectionnez un client", "Choisissez le client dans le menu deroulant en haut de la page."))
    story.append(StepBox(2, "Le systeme calcule automatiquement", "Les scores CRS, MIFI et l'eligibilite a chaque programme s'affichent."))
    story.append(StepBox(3, "Consultez les recommandations", "Le systeme suggere des actions pour ameliorer le score (ex: passer le TEF, obtenir une EIMT)."))
    story.append(StepBox(4, "Exportez en PDF ou envoyez par courriel", "Le bouton 'Envoyer au client' envoie le rapport premium par courriel avec l'offre a 49,99 $."))

    story.append(Spacer(1, 0.1*inch))
    story.append(ColorBox("$", "CONVERSION", "Le rapport premium envoye automatiquement 23h apres reception du lead inclut un lien d'achat a 49,99 $. Vous pouvez aussi l'envoyer manuellement via le bouton 'Envoyer analyse' dans le dossier.", LIGHT_GOLD, GOLD))

    story.append(PageBreak())

    # ══════════════════════════════════════════
    # MODULE 6: FORMULAIRES IRCC
    # ══════════════════════════════════════════
    story.append(SectionHeader("06", "FORMULAIRES IRCC", "Bibliotheque de 25+ formulaires, auto-remplissage"))
    story.append(Spacer(1, 0.3*inch))

    story.append(Paragraph(
        "La bibliotheque contient tous les formulaires IRCC organises par categorie. "
        "Le systeme pre-remplit automatiquement les champs a partir du profil client.", s_body))

    story.append(Paragraph("6.1 Categories de formulaires", s_h2))
    forms = [
        "General - IMM 5562 (renseignements supplementaires), IMM 5476 (representant)",
        "Residence permanente - IMM 0008, IMM 0008 Annexe 1, IMM 5669",
        "Temporaire - IMM 1294 (permis travail), IMM 1295 (permis etudes)",
        "Parrainage familial - IMM 1344, IMM 5481, IMM 5532",
        "Refugie - IMM 0008 DEP, IMM 5669 RPD",
        "Citoyennete - CIT 0002, CIT 0007",
    ]
    for f in forms:
        parts = f.split(" - ")
        story.append(Paragraph(f"<bullet>&bull;</bullet> <b>{parts[0]}</b> - {parts[1]}", s_bullet))

    story.append(Spacer(1, 0.1*inch))
    story.append(Paragraph("6.2 Auto-remplissage intelligent", s_h2))
    story.append(Paragraph(
        "Quand vous selectionnez un client, les champs du formulaire sont remplis automatiquement "
        "a partir de son profil. Les champs auto-remplis sont marques d'une icone eclair dorée. "
        "Verifiez toujours les donnees avant soumission.", s_body))

    story.append(ColorBox("!", "ATTENTION", "Les formulaires IRCC changent regulierement. Le systeme verifie automatiquement les mises a jour. Si un formulaire est marque 'Mise a jour disponible', telechargez la derniere version depuis le site d'IRCC.", LIGHT_RED, RED))

    story.append(PageBreak())

    # ══════════════════════════════════════════
    # MODULE 7: CONTRATS ET FACTURATION
    # ══════════════════════════════════════════
    story.append(SectionHeader("07", "CONTRATS ET FACTURATION", "Contrats RCIC/CICC, signatures, factures, paiements"))
    story.append(Spacer(1, 0.3*inch))

    story.append(Paragraph("7.1 Creer un contrat de service", s_h2))
    story.append(StepBox(1, "Depuis le dossier ou la page Contrats", "Cliquez '+ Nouveau Contrat' et selectionnez client + dossier."))
    story.append(StepBox(2, "Le contrat est genere automatiquement", "Conforme aux normes RCIC/CICC avec numero auto-incremente."))
    story.append(StepBox(3, "Definir les frais", "Frais de service + frais gouvernementaux. Consultez la grille tarifaire 2026."))
    story.append(StepBox(4, "Envoyer pour signature", "Le client recoit un lien unique pour signer electroniquement sur mobile ou ordinateur."))

    story.append(Spacer(1, 0.15*inch))
    story.append(Paragraph("7.2 Grille tarifaire 2026 (reference)", s_h2))
    tarifs = [
        ["Programme", "Frais service", "Frais gouv."],
        ["Entree Express", "3 500 - 5 000 $", "1 365 $"],
        ["PEQ / PSTQ", "3 000 - 4 500 $", "883 $"],
        ["Permis de travail", "1 500 - 3 000 $", "255 $"],
        ["Permis d'etudes", "1 500 - 2 500 $", "255 $"],
        ["Parrainage familial", "3 000 - 5 000 $", "1 365 $"],
        ["EIMT / LMIA", "2 000 - 3 500 $", "1 000 $"],
        ["Citoyennete", "1 500 - 2 500 $", "630 $"],
    ]
    tt = Table(tarifs, colWidths=[2.2*inch, 2.2*inch, 2.1*inch])
    tt.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
        ('TEXTCOLOR', (0, 1), (0, -1), NAVY),
        ('TEXTCOLOR', (1, 1), (-1, -1), SLATE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, LIGHT_SLATE]),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#E2E8F0')),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(tt)
    story.append(Spacer(1, 0.1*inch))

    story.append(Paragraph("7.3 Facturation et paiements", s_h2))
    story.append(Paragraph(
        "La page <b>Facturation</b> permet de creer des factures, suivre les paiements et gerer les "
        "versements echelonnes. Methodes acceptees : <b>Carte (Square), Interac e-Transfert, cheque, en personne</b>.", s_body))

    story.append(PageBreak())

    # ══════════════════════════════════════════
    # MODULE 8: CALENDRIER
    # ══════════════════════════════════════════
    story.append(SectionHeader("08", "CALENDRIER ET RENDEZ-VOUS", "Disponibilites, reservations, confirmations"))
    story.append(Spacer(1, 0.3*inch))

    story.append(Paragraph("8.1 Gerer vos disponibilites", s_h2))
    story.append(Paragraph(
        "Definissez vos plages horaires disponibles (8h-16h30 par defaut) avec la possibilite d'ajouter "
        "des exceptions (jours bloques, horaires reduits). Les clients ne peuvent reserver que dans vos "
        "creneaux disponibles.", s_body))

    story.append(Paragraph("8.2 Types de rendez-vous", s_h2))
    rdv_data = [
        ["Type", "Duree", "Usage"],
        ["Consultation", "60 min", "Premier rendez-vous avec nouveau client"],
        ["Suivi", "30 min", "Mise a jour du dossier"],
        ["Juridique", "45-60 min", "Questions legales, revision de documents"],
        ["Administratif", "30 min", "Signatures, remise de documents"],
    ]
    rdvt = Table(rdv_data, colWidths=[1.5*inch, 1.2*inch, 3.8*inch])
    rdvt.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
        ('TEXTCOLOR', (0, 1), (0, -1), NAVY),
        ('TEXTCOLOR', (1, 1), (-1, -1), SLATE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, LIGHT_SLATE]),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#E2E8F0')),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(rdvt)

    story.append(PageBreak())

    # ══════════════════════════════════════════
    # MODULE 9-10: PORTAILS
    # ══════════════════════════════════════════
    story.append(SectionHeader("09", "PORTAIL CLIENT", "Acces client libre-service, documents, suivi"))
    story.append(Spacer(1, 0.3*inch))

    story.append(Paragraph(
        "Le portail client permet a vos clients de suivre leur dossier, telecharger des documents "
        "et communiquer avec leur conseiller sans vous appeler.", s_body))

    story.append(Paragraph("9.1 Inviter un client au portail", s_h2))
    story.append(StepBox(1, "Ouvrir le profil du client", "Depuis la page Clients, selectionnez le client concerne."))
    story.append(StepBox(2, "Cliquer 'Inviter au portail'", "Le systeme genere un mot de passe temporaire et envoie un courriel d'invitation."))
    story.append(StepBox(3, "Le client se connecte", "Via soshubca.vercel.app/client avec son courriel et mot de passe temporaire."))

    story.append(Paragraph("9.2 Ce que le client peut faire", s_h2))
    portal_features = [
        "Voir le statut de son dossier avec la barre de progression",
        "Telecharger des documents avec categorisation automatique",
        "Consulter la liste des formulaires requis pour son programme",
        "Voir ses rendez-vous passes et a venir",
        "Envoyer des messages a son conseiller",
    ]
    for f in portal_features:
        story.append(Paragraph(f"<bullet>&bull;</bullet> {f}", s_bullet))

    story.append(Spacer(1, 0.3*inch))
    story.append(SectionHeader("10", "PORTAIL EMPLOYEURS", "EIMT/LMIA, documents, jumelage travailleurs"))
    story.append(Spacer(1, 0.3*inch))

    story.append(Paragraph(
        "Le portail employeurs permet de gerer les entreprises partenaires, leurs demandes EIMT/LMIA "
        "et le jumelage avec les travailleurs etrangers.", s_body))

    empl_features = [
        "Creer et gerer les profils d'employeurs (nom, NAICS, NEQ, adresse)",
        "Suivre les demandes EIMT/LMIA (statut, postes, salaires, NOC)",
        "Telecharger les documents employeur (offre d'emploi, plan de transition, preuves recrutement)",
        "Verifier les accreditations (WES, IQAS, CES)",
        "Ajouter des notes avec categories et epingles",
    ]
    for f in empl_features:
        story.append(Paragraph(f"<bullet>&bull;</bullet> {f}", s_bullet))

    story.append(PageBreak())

    # ══════════════════════════════════════════
    # MODULE 11: AGENT IA
    # ══════════════════════════════════════════
    story.append(SectionHeader("11", "AGENT IA", "Chatbot immigration, delais IRCC, FAQ"))
    story.append(Spacer(1, 0.3*inch))

    story.append(Paragraph(
        "L'agent IA est un assistant intelligent qui connait tous les programmes d'immigration canadiens, "
        "les delais de traitement IRCC et Quebec, et les exigences documentaires.", s_body))

    story.append(Paragraph("11.1 Cas d'utilisation pour le staff", s_h2))
    ai_uses = [
        "Verifier rapidement les delais de traitement d'un programme",
        "Obtenir la liste des documents requis pour un programme specifique",
        "Verifier les criteres d'eligibilite d'un programme",
        "Repondre a une question client sans chercher sur le site IRCC",
        "Generer une recommandation de programme basee sur le profil client",
    ]
    for u in ai_uses:
        story.append(Paragraph(f"<bullet>&bull;</bullet> {u}", s_bullet))

    story.append(Spacer(1, 0.1*inch))
    story.append(ColorBox("*", "RAPPEL", "L'agent IA est un outil d'aide, pas un conseiller juridique. Verifiez toujours les informations critiques sur le site officiel d'IRCC avant de les communiquer au client.", LIGHT_BLUE, BLUE))

    story.append(PageBreak())

    # ══════════════════════════════════════════
    # MODULE 12: RAPPORTS
    # ══════════════════════════════════════════
    story.append(SectionHeader("12", "RAPPORTS ET ANALYSES", "KPIs, exports, performance d'equipe"))
    story.append(Spacer(1, 0.3*inch))

    story.append(Paragraph("12.1 KPIs disponibles", s_h2))
    report_kpis = [
        ["Indicateur", "Calcul"],
        ["Total clients", "Nombre de clients dans le systeme"],
        ["Dossiers ouverts", "Cas non fermes / non refuses"],
        ["Taux d'approbation", "Approuves / (Approuves + Refuses) x 100"],
        ["Revenus", "Total des factures payees dans la periode"],
        ["Taux de conversion", "Clients actifs / Total leads x 100"],
        ["Delai moyen", "Temps moyen creation-soumission du dossier"],
    ]
    rkt = Table(report_kpis, colWidths=[2*inch, 4.5*inch])
    rkt.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
        ('TEXTCOLOR', (0, 1), (0, -1), NAVY),
        ('TEXTCOLOR', (1, 1), (-1, -1), SLATE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, LIGHT_SLATE]),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#E2E8F0')),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(rkt)
    story.append(Spacer(1, 0.1*inch))

    story.append(Paragraph("12.2 Exports CSV", s_h2))
    story.append(Paragraph(
        "Exportez vos donnees en CSV pour analyse externe : <b>Clients, Dossiers, Factures, Rapport complet</b>. "
        "Utile pour les rapports trimestriels ou les audits.", s_body))

    story.append(PageBreak())

    # ══════════════════════════════════════════
    # MODULE 13: PARAMETRES
    # ══════════════════════════════════════════
    story.append(SectionHeader("13", "PARAMETRES ET SECURITE", "Gestion equipe, roles, permissions, audit"))
    story.append(Spacer(1, 0.3*inch))

    story.append(Paragraph("13.1 Gestion de l'equipe (Superadmin / Coordinatrice)", s_h2))
    story.append(Paragraph("Depuis <b>Parametres > Equipe</b>, vous pouvez :", s_body))
    team_actions = [
        "Ajouter un nouvel employe (nom, courriel, role, mot de passe)",
        "Modifier le role d'un employe existant",
        "Desactiver un compte (l'employe ne peut plus se connecter)",
        "Reinitialiser le mot de passe d'un employe",
        "Voir la matrice des permissions par role",
    ]
    for a in team_actions:
        story.append(Paragraph(f"<bullet>&bull;</bullet> {a}", s_bullet))

    story.append(Spacer(1, 0.1*inch))
    story.append(Paragraph("13.2 Journal d'audit", s_h2))
    story.append(Paragraph(
        "Chaque action dans le CRM est enregistree : <b>date, utilisateur, action, adresse IP</b>. "
        "Consultez le journal dans l'onglet Securite pour verifier l'historique des modifications.", s_body))

    story.append(ColorBox("!", "SECURITE", "Ne donnez jamais le role Superadmin a un employe non autorise. Verifiez regulierement le journal d'audit pour detecter toute activite suspecte.", LIGHT_RED, RED))

    story.append(PageBreak())

    # ══════════════════════════════════════════
    # MODULE 14: WORKFLOW NOUVEAU CLIENT (FOCUS)
    # ══════════════════════════════════════════
    story.append(SectionHeader("14", "WORKFLOW : NOUVEAU CLIENT", "Processus complet de la reception du lead a l'approbation"))
    story.append(Spacer(1, 0.3*inch))

    story.append(ColorBox("*", "PROCESSUS CLE", "Ce workflow est le coeur de l'activite de SOS Hub Canada. Chaque membre du staff doit le connaitre parfaitement.", LIGHT_GOLD, GOLD))
    story.append(Spacer(1, 0.2*inch))

    # Full workflow steps
    workflow = [
        ("Reception du lead",
         "Le lead arrive via le test d'admissibilite sur soshub.ca, par courriel, WhatsApp ou telephone. "
         "Il apparait automatiquement dans le CRM avec statut 'prospect'."),
        ("Contact initial (< 24h)",
         "Appelez ou envoyez un courriel dans les 24 heures. Le systeme envoie automatiquement un courriel "
         "d'analyse a 23h si aucun contact n'a eu lieu. Objectif : fixer un RDV de consultation."),
        ("Consultation initiale (60 min)",
         "Evaluez le profil du client en detail. Utilisez l'outil d'analyse d'admissibilite pour calculer "
         "les scores CRS/MIFI. Presentez les options et recommandations."),
        ("Signature du contrat",
         "Generez le contrat de service depuis le dossier. Envoyez le lien de signature electronique. "
         "Le client signe sur son telephone ou ordinateur."),
        ("Paiement des frais d'ouverture",
         "250 $ de frais d'ouverture de dossier. Acceptez par carte (Square), Interac e-Transfert ou en personne. "
         "Le dossier passe en statut 'Preparation' apres paiement."),
        ("Collecte de documents",
         "Envoyez la checklist de documents au client via le portail. Suivez les documents recus et "
         "relancez pour les documents manquants. Verifiez chaque document (statut: verifie/rejete)."),
        ("Remplissage des formulaires IRCC",
         "Utilisez la bibliotheque de formulaires avec auto-remplissage. Verifiez chaque champ. "
         "Faites reviser par un collegue avant soumission."),
        ("Revision finale",
         "Revue complete du dossier : tous les documents, tous les formulaires, coherence des informations. "
         "Faites signer la demande par le client."),
        ("Soumission a IRCC",
         "Deposez la demande en ligne ou par courrier. Mettez a jour le statut du dossier. "
         "Notez le numero de demande/UCI dans le dossier."),
        ("Suivi du traitement",
         "Verifiez regulierement le portail IRCC pour les mises a jour. Communiquez chaque mise a jour "
         "au client. Repondez aux demandes de documents supplementaires dans les 30 jours."),
    ]

    for i, (title, desc) in enumerate(workflow):
        story.append(StepBox(i + 1, title, desc))

    story.append(Spacer(1, 0.2*inch))

    # Timeline summary
    story.append(Paragraph("CHRONOLOGIE TYPE", s_h2))
    chrono = [
        ["Etape", "Delai", "Responsable"],
        ["Lead > Premier contact", "< 24 heures", "Receptionniste / Conseiller"],
        ["Contact > Consultation", "1-3 jours", "Conseiller"],
        ["Consultation > Contrat signe", "1-2 jours", "Conseiller / Avocat"],
        ["Contrat > Documents complets", "2-6 semaines", "Client + Technicienne"],
        ["Documents > Formulaires", "1-2 semaines", "Technicienne juridique"],
        ["Formulaires > Soumission", "3-5 jours", "Avocat / Consultant"],
        ["Soumission > Decision IRCC", "3-12 mois", "Suivi par Conseiller"],
    ]
    ct = Table(chrono, colWidths=[2.3*inch, 1.5*inch, 2.7*inch])
    ct.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
        ('TEXTCOLOR', (0, 1), (0, -1), NAVY),
        ('TEXTCOLOR', (1, 1), (1, -1), GOLD),
        ('FONTNAME', (1, 1), (1, -1), 'Helvetica-Bold'),
        ('TEXTCOLOR', (2, 1), (-1, -1), SLATE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, LIGHT_SLATE]),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#E2E8F0')),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(ct)

    story.append(PageBreak())

    # ══════════════════════════════════════════
    # CHECKLIST QUOTIDIENNE
    # ══════════════════════════════════════════
    story.append(Paragraph("CHECKLIST QUOTIDIENNE DU MATIN", s_h1))
    story.append(Spacer(1, 0.15*inch))

    story.append(Paragraph("A faire chaque jour a votre arrivee :", s_bold))
    story.append(Spacer(1, 0.1*inch))

    daily_checks = [
        ("Tableau de bord", "Verifier les alertes rouges (documents expires, dossiers urgents, echeances)"),
        ("Nouveaux leads", "Contacter tous les leads recus depuis hier (< 24h)"),
        ("Rendez-vous du jour", "Preparer les dossiers pour chaque RDV planifie"),
        ("Documents en attente", "Relancer les clients qui doivent fournir des documents"),
        ("Courriels", "Repondre aux messages clients et mettre a jour les notes de suivi"),
        ("Taches", "Completer les taches assignees pour aujourd'hui"),
        ("Dossiers IRCC", "Verifier les mises a jour sur le portail IRCC pour les dossiers soumis"),
    ]

    for i, (title, desc) in enumerate(daily_checks):
        story.append(StepBox(i + 1, title, desc))

    story.append(Spacer(1, 0.2*inch))
    story.append(HRFlowable(width="100%", color=GOLD, thickness=2))
    story.append(Spacer(1, 0.15*inch))

    # Contact info
    story.append(Paragraph("SUPPORT ET CONTACT", s_h1))
    story.append(Spacer(1, 0.1*inch))

    contact_data = [
        ["", ""],
        ["CRM", "soshubca.vercel.app/crm"],
        ["WhatsApp Support", "+1 (438) 630-2869"],
        ["Courriel", "info@soshubcanada.com"],
        ["Adresse", "3737 Cremazie Est #402, Montreal QC H1Z 2K4"],
    ]
    cdt = Table(contact_data, colWidths=[2*inch, 4.5*inch])
    cdt.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TEXTCOLOR', (0, 0), (0, -1), GOLD),
        ('TEXTCOLOR', (1, 0), (1, -1), NAVY),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(cdt)

    story.append(Spacer(1, 0.3*inch))
    story.append(Paragraph(
        "Ce guide est un document vivant. Il sera mis a jour regulierement avec les nouvelles fonctionnalites "
        "du CRM. Pour toute question ou suggestion, contactez votre superviseur.", s_small))

    # ── BUILD ──
    doc.build(story, onFirstPage=cover_page, onLaterPages=header_footer)
    print(f"PDF genere: {OUTPUT}")
    print(f"Taille: {os.path.getsize(OUTPUT) / 1024:.0f} KB")

if __name__ == '__main__':
    build()
