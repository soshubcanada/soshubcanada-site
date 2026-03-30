#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generate SOS Hub Canada CRM User Manual PDF
"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.units import inch, cm
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, ListFlowable, ListItem, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas
import os

OUTPUT = os.path.join(os.path.dirname(__file__), "Manuel_CRM_SOS_Hub_Canada.pdf")

NAVY = HexColor("#1B2559")
GOLD = HexColor("#D4A03C")
LIGHT_BG = HexColor("#F5F6FA")
LIGHT_GOLD = HexColor("#FFF8E7")
GREEN = HexColor("#10B981")
RED = HexColor("#EF4444")
GRAY = HexColor("#6B7280")

styles = getSampleStyleSheet()

# Custom styles
styles.add(ParagraphStyle(
    'CoverTitle', parent=styles['Title'],
    fontSize=32, textColor=white, alignment=TA_CENTER,
    spaceAfter=10, fontName='Helvetica-Bold'
))
styles.add(ParagraphStyle(
    'CoverSubtitle', parent=styles['Normal'],
    fontSize=16, textColor=HexColor("#D4A03C"), alignment=TA_CENTER,
    spaceAfter=30, fontName='Helvetica'
))
styles.add(ParagraphStyle(
    'SectionTitle', parent=styles['Heading1'],
    fontSize=22, textColor=NAVY, spaceAfter=12, spaceBefore=20,
    fontName='Helvetica-Bold', borderWidth=2, borderColor=GOLD,
    borderPadding=6
))
styles.add(ParagraphStyle(
    'SubSection', parent=styles['Heading2'],
    fontSize=16, textColor=NAVY, spaceAfter=8, spaceBefore=14,
    fontName='Helvetica-Bold'
))
styles.add(ParagraphStyle(
    'StepTitle', parent=styles['Heading3'],
    fontSize=13, textColor=GOLD, spaceAfter=4, spaceBefore=10,
    fontName='Helvetica-Bold'
))
styles.add(ParagraphStyle(
    'CRMBodyText', parent=styles['Normal'],
    fontSize=11, leading=16, alignment=TA_JUSTIFY,
    spaceAfter=8, fontName='Helvetica'
))
styles.add(ParagraphStyle(
    'BulletText', parent=styles['Normal'],
    fontSize=11, leading=15, leftIndent=20,
    spaceAfter=4, fontName='Helvetica'
))
styles.add(ParagraphStyle(
    'TipText', parent=styles['Normal'],
    fontSize=10, leading=14, textColor=NAVY,
    leftIndent=15, rightIndent=15, spaceAfter=8,
    fontName='Helvetica-Oblique', backColor=LIGHT_GOLD,
    borderWidth=1, borderColor=GOLD, borderPadding=8
))
styles.add(ParagraphStyle(
    'URLText', parent=styles['Normal'],
    fontSize=10, textColor=HexColor("#3B82F6"),
    fontName='Helvetica', spaceAfter=4
))
styles.add(ParagraphStyle(
    'FooterStyle', parent=styles['Normal'],
    fontSize=8, textColor=GRAY, alignment=TA_CENTER
))
styles.add(ParagraphStyle(
    'TOCEntry', parent=styles['Normal'],
    fontSize=12, leading=20, leftIndent=20,
    fontName='Helvetica', textColor=NAVY
))
styles.add(ParagraphStyle(
    'TOCSection', parent=styles['Normal'],
    fontSize=14, leading=24, fontName='Helvetica-Bold',
    textColor=NAVY, spaceBefore=6
))

def add_header_footer(canvas_obj, doc):
    canvas_obj.saveState()
    # Header line
    canvas_obj.setStrokeColor(GOLD)
    canvas_obj.setLineWidth(2)
    canvas_obj.line(50, letter[1] - 40, letter[0] - 50, letter[1] - 40)
    # Header text
    canvas_obj.setFont('Helvetica', 8)
    canvas_obj.setFillColor(NAVY)
    canvas_obj.drawString(50, letter[1] - 35, "SOS Hub Canada - Manuel CRM")
    canvas_obj.drawRightString(letter[0] - 50, letter[1] - 35, "Confidentiel")
    # Footer
    canvas_obj.setStrokeColor(GRAY)
    canvas_obj.setLineWidth(0.5)
    canvas_obj.line(50, 40, letter[0] - 50, 40)
    canvas_obj.setFont('Helvetica', 8)
    canvas_obj.setFillColor(GRAY)
    canvas_obj.drawString(50, 28, "SOS Hub Canada Inc. - Montreal, Quebec")
    canvas_obj.drawRightString(letter[0] - 50, 28, f"Page {doc.page}")
    canvas_obj.restoreState()

def build_manual():
    doc = SimpleDocTemplate(
        OUTPUT, pagesize=letter,
        topMargin=60, bottomMargin=60,
        leftMargin=50, rightMargin=50
    )
    story = []

    # ==================== COVER PAGE ====================
    story.append(Spacer(1, 100))

    # Logo placeholder
    cover_logo_data = [['[ S ]']]
    cover_logo = Table(cover_logo_data, colWidths=[80], rowHeights=[80])
    cover_logo.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), NAVY),
        ('TEXTCOLOR', (0,0), (0,0), GOLD),
        ('FONTSIZE', (0,0), (0,0), 28),
        ('FONTNAME', (0,0), (0,0), 'Helvetica-Bold'),
        ('ALIGN', (0,0), (0,0), 'CENTER'),
        ('VALIGN', (0,0), (0,0), 'MIDDLE'),
        ('ROUNDEDCORNERS', [10,10,10,10]),
    ]))
    story.append(cover_logo)
    story.append(Spacer(1, 30))

    # Title block with navy background
    title_data = [
        [Paragraph("Manuel Utilisateur CRM", styles['CoverTitle'])],
        [Paragraph("SOS Hub Canada", styles['CoverSubtitle'])],
    ]
    title_table = Table(title_data, colWidths=[500])
    title_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,-1), NAVY),
        ('TOPPADDING', (0,0), (0,0), 30),
        ('BOTTOMPADDING', (0,-1), (0,-1), 30),
        ('LEFTPADDING', (0,0), (0,-1), 20),
        ('RIGHTPADDING', (0,0), (0,-1), 20),
        ('ALIGN', (0,0), (0,-1), 'CENTER'),
    ]))
    story.append(title_table)
    story.append(Spacer(1, 40))

    info_style = ParagraphStyle('CoverInfo', parent=styles['Normal'],
        fontSize=12, alignment=TA_CENTER, textColor=NAVY, leading=20)
    story.append(Paragraph("Guide de formation pour les employes", info_style))
    story.append(Paragraph("Version 1.0 - Mars 2026", info_style))
    story.append(Spacer(1, 20))
    story.append(Paragraph("CONFIDENTIEL - Usage interne uniquement", ParagraphStyle(
        'ConfNote', parent=info_style, fontSize=10, textColor=RED
    )))

    story.append(PageBreak())

    # ==================== TABLE OF CONTENTS ====================
    story.append(Paragraph("Table des matieres", styles['SectionTitle']))
    story.append(Spacer(1, 10))

    toc_items = [
        ("1.", "Connexion au CRM"),
        ("2.", "Tableau de bord - Navigation"),
        ("3.", "Gestion des clients"),
        ("4.", "Gestion des dossiers"),
        ("5.", "Contrats et facturation"),
        ("6.", "Calendrier et rendez-vous"),
        ("7.", "Portail client / employeur"),
        ("8.", "Analyse d'immigration"),
        ("9.", "Ressources humaines (RH)"),
        ("10.", "Agent AI - Assistant virtuel"),
        ("11.", "Parametres et administration"),
        ("12.", "Securite et bonnes pratiques"),
    ]
    for num, title in toc_items:
        story.append(Paragraph(f"<b>{num}</b>  {title}", styles['TOCSection']))

    story.append(PageBreak())

    # ==================== SECTION 1: CONNEXION ====================
    story.append(Paragraph("1. Connexion au CRM", styles['SectionTitle']))
    story.append(HRFlowable(width="100%", thickness=2, color=GOLD))
    story.append(Spacer(1, 10))

    story.append(Paragraph("Acces au systeme", styles['SubSection']))
    story.append(Paragraph(
        "Le CRM SOS Hub Canada est accessible via votre navigateur web. "
        "Aucune installation n'est necessaire.",
        styles['CRMBodyText']
    ))

    story.append(Paragraph("Etape 1 : Ouvrir le navigateur", styles['StepTitle']))
    story.append(Paragraph(
        "Ouvrez Google Chrome, Safari ou Firefox et entrez l'adresse suivante :",
        styles['CRMBodyText']
    ))
    story.append(Paragraph("https://soshubca.vercel.app/crm", styles['URLText']))

    story.append(Paragraph("Etape 2 : Entrer vos identifiants", styles['StepTitle']))
    story.append(Paragraph(
        "Sur l'ecran de connexion, entrez votre courriel professionnel et votre mot de passe. "
        "Votre courriel est au format : prenom@soshubcanada.com",
        styles['CRMBodyText']
    ))

    # Credentials table
    cred_data = [
        ['Champ', 'Exemple'],
        ['Courriel', 'pcadet@soshubcanada.com'],
        ['Mot de passe', 'SosHub2026!'],
    ]
    cred_table = Table(cred_data, colWidths=[150, 300])
    cred_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY),
        ('TEXTCOLOR', (0,0), (-1,0), white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 10),
        ('GRID', (0,0), (-1,-1), 0.5, GRAY),
        ('BACKGROUND', (0,1), (-1,-1), LIGHT_BG),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(Spacer(1, 6))
    story.append(cred_table)
    story.append(Spacer(1, 10))

    story.append(Paragraph("Etape 3 : Cliquer 'Se connecter'", styles['StepTitle']))
    story.append(Paragraph(
        "Cliquez le bouton dore 'Se connecter'. Vous serez redirige vers le tableau de bord.",
        styles['CRMBodyText']
    ))

    story.append(Paragraph(
        "Astuce : Si vous oubliez votre mot de passe, cliquez 'Mot de passe oublie ?' "
        "sur l'ecran de connexion. Un lien de reinitialisation sera envoye a votre courriel.",
        styles['TipText']
    ))

    story.append(Paragraph("Etape 4 : Mot de passe oublie", styles['StepTitle']))
    story.append(Paragraph(
        "1. Cliquez 'Mot de passe oublie ?' sous le formulaire de connexion\n"
        "2. Entrez votre courriel professionnel\n"
        "3. Verifiez votre boite de reception\n"
        "4. Cliquez le lien dans le courriel pour creer un nouveau mot de passe",
        styles['CRMBodyText']
    ))

    story.append(PageBreak())

    # ==================== SECTION 2: NAVIGATION ====================
    story.append(Paragraph("2. Tableau de bord - Navigation", styles['SectionTitle']))
    story.append(HRFlowable(width="100%", thickness=2, color=GOLD))
    story.append(Spacer(1, 10))

    story.append(Paragraph(
        "Apres la connexion, vous verrez le menu de navigation a gauche avec les sections suivantes :",
        styles['CRMBodyText']
    ))

    nav_data = [
        ['Icone', 'Section', 'Description'],
        ['Clients', 'Clients', 'Liste et gestion de tous les clients'],
        ['Dossiers', 'Dossiers', 'Dossiers d\'immigration en cours'],
        ['Contrats', 'Contrats', 'Contrats de service et signatures'],
        ['Factures', 'Facturation', 'Factures et paiements'],
        ['Calendrier', 'Calendrier', 'Rendez-vous et disponibilites'],
        ['Analyse', 'Analyse immigration', 'CRS, MIFI, admissibilite'],
        ['Client', 'Portail client', 'Vue client avec documents'],
        ['Employeur', 'Portail employeurs', 'Dossiers EIMT/LMIA'],
        ['RH', 'Ressources humaines', 'Profils employes, conges, presences'],
        ['AI', 'Agent AI', 'Assistant virtuel intelligent'],
        ['Params', 'Parametres', 'Configuration, equipe, portails'],
    ]
    nav_table = Table(nav_data, colWidths=[60, 100, 300])
    nav_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY),
        ('TEXTCOLOR', (0,0), (-1,0), white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 9),
        ('GRID', (0,0), (-1,-1), 0.5, GRAY),
        ('BACKGROUND', (0,1), (-1,-1), white),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [white, LIGHT_BG]),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(nav_table)
    story.append(Spacer(1, 10))

    story.append(Paragraph(
        "Astuce : Votre role determine les sections accessibles. "
        "Le SuperAdmin a acces a toutes les fonctionnalites.",
        styles['TipText']
    ))

    story.append(Paragraph("Roles et permissions", styles['SubSection']))

    roles_data = [
        ['Role', 'Acces'],
        ['Receptionniste', 'Clients, Dossiers, Calendrier'],
        ['Conseiller', 'Clients, Dossiers, Contrats, Analyse, Calendrier'],
        ['Technicienne juridique', 'Clients, Dossiers, Contrats, Analyse, Formulaires'],
        ['Coordinatrice', 'Tout sauf RH (profils autres)'],
        ['SuperAdmin', 'Acces complet a toutes les sections'],
    ]
    roles_table = Table(roles_data, colWidths=[140, 320])
    roles_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY),
        ('TEXTCOLOR', (0,0), (-1,0), white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 10),
        ('GRID', (0,0), (-1,-1), 0.5, GRAY),
        ('BACKGROUND', (0,1), (-1,-1), white),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(roles_table)

    story.append(PageBreak())

    # ==================== SECTION 3: CLIENTS ====================
    story.append(Paragraph("3. Gestion des clients", styles['SectionTitle']))
    story.append(HRFlowable(width="100%", thickness=2, color=GOLD))
    story.append(Spacer(1, 10))

    story.append(Paragraph("3.1 Voir la liste des clients", styles['SubSection']))
    story.append(Paragraph(
        "1. Cliquez 'Clients' dans le menu de gauche\n"
        "2. La liste affiche tous les clients avec : nom, courriel, nationalite, statut\n"
        "3. Utilisez la barre de recherche pour trouver un client par nom ou courriel\n"
        "4. Filtrez par statut : Actif, Prospect, Inactif",
        styles['CRMBodyText']
    ))

    story.append(Paragraph("3.2 Ajouter un nouveau client", styles['SubSection']))
    story.append(Paragraph("Etape 1 : Cliquez le bouton 'Nouveau client' (bleu, en haut a droite)", styles['StepTitle']))
    story.append(Paragraph("Etape 2 : Remplissez le formulaire", styles['StepTitle']))

    client_fields = [
        ['Champ', 'Obligatoire', 'Exemple'],
        ['Prenom', 'Oui', 'Jean'],
        ['Nom', 'Oui', 'Dupont'],
        ['Courriel', 'Oui', 'jean.dupont@email.com'],
        ['Telephone', 'Oui', '+1 514-555-1234'],
        ['Date de naissance', 'Non', '1990-01-15'],
        ['Nationalite', 'Non', 'Francaise'],
        ['Statut actuel', 'Non', 'Visiteur / Etudiant / Travailleur'],
        ['Adresse', 'Non', '123 Rue Principale, Montreal'],
        ['Notes', 'Non', 'Informations supplementaires'],
    ]
    cf_table = Table(client_fields, colWidths=[120, 80, 260])
    cf_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY),
        ('TEXTCOLOR', (0,0), (-1,0), white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 9),
        ('GRID', (0,0), (-1,-1), 0.5, GRAY),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [white, LIGHT_BG]),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(cf_table)
    story.append(Spacer(1, 8))

    story.append(Paragraph("Etape 3 : Cliquez 'Enregistrer'", styles['StepTitle']))
    story.append(Paragraph(
        "Le client apparaitra dans la liste. Vous pouvez ensuite lui creer un dossier.",
        styles['CRMBodyText']
    ))

    story.append(Paragraph("3.3 Importer des clients (CSV)", styles['SubSection']))
    story.append(Paragraph(
        "1. Cliquez le bouton 'Importer CSV' a cote de 'Nouveau client'\n"
        "2. Glissez-deposez votre fichier .csv ou cliquez pour selectionner\n"
        "3. Le systeme detecte automatiquement les colonnes\n"
        "4. Verifiez le mapping des colonnes (prenom, nom, courriel, etc.)\n"
        "5. Cliquez 'Importer' - une barre de progression s'affiche\n"
        "6. Resume : X importes, Y doublons, Z erreurs",
        styles['CRMBodyText']
    ))

    story.append(Paragraph(
        "Astuce : Cliquez 'Telecharger le modele CSV' pour obtenir un fichier "
        "pre-formate compatible Excel avec les bonnes colonnes.",
        styles['TipText']
    ))

    story.append(Paragraph("3.4 Telecharger des documents client", styles['SubSection']))
    story.append(Paragraph(
        "1. Ouvrez la fiche d'un client en cliquant sur son nom\n"
        "2. Descendez jusqu'a la section 'Documents'\n"
        "3. Selectionnez la categorie (Identite, Education, Emploi, etc.)\n"
        "4. Glissez-deposez le fichier ou cliquez pour selectionner\n"
        "5. Formats acceptes : PDF, JPG, PNG (max 10 Mo)\n"
        "6. Ajoutez une date d'expiration si applicable (ex: passeport)",
        styles['CRMBodyText']
    ))

    story.append(Paragraph("3.5 Envoyer l'acces portail au client", styles['SubSection']))
    story.append(Paragraph(
        "1. Ouvrez la fiche du client\n"
        "2. Cliquez le bouton dore 'Envoyer acces portail' (en haut a droite)\n"
        "3. Un courriel avec identifiants temporaires est envoye au client\n"
        "4. Le client pourra se connecter sur /client pour suivre son dossier",
        styles['CRMBodyText']
    ))

    story.append(PageBreak())

    # ==================== SECTION 4: DOSSIERS ====================
    story.append(Paragraph("4. Gestion des dossiers", styles['SectionTitle']))
    story.append(HRFlowable(width="100%", thickness=2, color=GOLD))
    story.append(Spacer(1, 10))

    story.append(Paragraph("4.1 Creer un dossier", styles['SubSection']))
    story.append(Paragraph(
        "1. Allez dans 'Dossiers' dans le menu\n"
        "2. Cliquez 'Nouveau dossier'\n"
        "3. Selectionnez le client\n"
        "4. Choisissez le programme d'immigration\n"
        "5. Ajoutez un titre descriptif\n"
        "6. Assignez un conseiller responsable\n"
        "7. Definissez la date limite si applicable\n"
        "8. Cliquez 'Creer'",
        styles['CRMBodyText']
    ))

    story.append(Paragraph("4.2 Pipeline des statuts", styles['SubSection']))
    story.append(Paragraph(
        "Chaque dossier suit un pipeline en 8 etapes :",
        styles['CRMBodyText']
    ))

    pipeline_data = [
        ['Etape', 'Statut', 'Description'],
        ['1', 'Nouveau', 'Dossier vient d\'etre cree'],
        ['2', 'Consultation', 'Consultation initiale en cours'],
        ['3', 'En preparation', 'Documents en cours de collecte'],
        ['4', 'Formulaires remplis', 'Tous les formulaires completes'],
        ['5', 'Revision', 'Verification finale avant soumission'],
        ['6', 'Soumis', 'Demande soumise a IRCC/MIFI'],
        ['7', 'En traitement', 'En cours de traitement par le gouvernement'],
        ['8', 'Approuve', 'Demande approuvee'],
    ]
    pipe_table = Table(pipeline_data, colWidths=[40, 120, 300])
    pipe_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY),
        ('TEXTCOLOR', (0,0), (-1,0), white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 9),
        ('GRID', (0,0), (-1,-1), 0.5, GRAY),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [white, LIGHT_BG]),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(pipe_table)

    story.append(PageBreak())

    # ==================== SECTION 5: CONTRATS ====================
    story.append(Paragraph("5. Contrats et facturation", styles['SectionTitle']))
    story.append(HRFlowable(width="100%", thickness=2, color=GOLD))
    story.append(Spacer(1, 10))

    story.append(Paragraph("5.1 Creer un contrat de service", styles['SubSection']))
    story.append(Paragraph(
        "1. Allez dans 'Contrats' dans le menu\n"
        "2. Cliquez 'Nouveau contrat'\n"
        "3. Selectionnez le client dans la liste\n"
        "4. Choisissez le programme d'immigration\n"
        "5. Le contrat est genere automatiquement avec les 20 articles CICC\n"
        "6. Verifiez le contenu dans l'apercu\n"
        "7. Cliquez 'Creer le contrat'",
        styles['CRMBodyText']
    ))

    story.append(Paragraph(
        "Important : Le contrat est conforme aux exigences du CICC (College des consultants "
        "en immigration et citoyennete). Il inclut les 20 articles obligatoires : parties, "
        "langue de service, role du CICC, admissibilite, services, frais $250, honoraires, "
        "obligations, confidentialite, resiliation, etc.",
        styles['TipText']
    ))

    story.append(Paragraph("5.2 Faire signer le contrat", styles['SubSection']))
    story.append(Paragraph(
        "Option A - Signature a distance :\n"
        "1. Cliquez 'Envoyer au client' sur le contrat\n"
        "2. Le client recoit un courriel avec un lien de signature\n"
        "3. Le client ouvre le lien sur son telephone/tablette\n"
        "4. Il lit le contrat et signe avec son doigt\n"
        "5. Le statut passe automatiquement a 'Signe'\n\n"
        "Option B - Signature sur place :\n"
        "1. Cliquez 'Signer sur place' sur le contrat\n"
        "2. Un canvas de signature s'ouvre (ideal sur iPad)\n"
        "3. Le client signe directement sur l'ecran\n"
        "4. Cliquez 'Confirmer la signature'",
        styles['CRMBodyText']
    ))

    story.append(PageBreak())

    # ==================== SECTION 6: CALENDRIER ====================
    story.append(Paragraph("6. Calendrier et rendez-vous", styles['SectionTitle']))
    story.append(HRFlowable(width="100%", thickness=2, color=GOLD))
    story.append(Spacer(1, 10))

    story.append(Paragraph("6.1 Vue calendrier", styles['SubSection']))
    story.append(Paragraph(
        "Le calendrier affiche une vue hebdomadaire (lundi a vendredi, 8h a 18h) "
        "avec des creneaux de 30 minutes. Les rendez-vous sont codes par couleur :",
        styles['CRMBodyText']
    ))

    cal_colors = [
        ['Couleur', 'Type', 'Utilisation'],
        ['Bleu', 'Consultation', 'Premiere rencontre avec le client'],
        ['Vert', 'Suivi', 'Rendez-vous de suivi regulier'],
        ['Violet', 'Juridique', 'Consultation juridique'],
        ['Gris', 'Administratif', 'Taches administratives'],
    ]
    cal_table = Table(cal_colors, colWidths=[80, 120, 260])
    cal_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY),
        ('TEXTCOLOR', (0,0), (-1,0), white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 10),
        ('GRID', (0,0), (-1,-1), 0.5, GRAY),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [white, LIGHT_BG]),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(cal_table)
    story.append(Spacer(1, 8))

    story.append(Paragraph("6.2 Gerer les disponibilites", styles['SubSection']))
    story.append(Paragraph(
        "1. Allez dans l'onglet 'Disponibilites'\n"
        "2. Modifiez vos heures disponibles pour chaque jour\n"
        "3. Par defaut : 9h-12h et 13h-17h (pause dejeuner)\n"
        "4. Pour bloquer un jour : ajoutez une exception (vacances, maladie)\n"
        "5. Les clients verront uniquement vos creneaux disponibles",
        styles['CRMBodyText']
    ))

    story.append(Paragraph("6.3 Gerer les demandes de rendez-vous", styles['SubSection']))
    story.append(Paragraph(
        "1. L'onglet 'Demandes' affiche les requetes des clients\n"
        "2. Chaque demande montre : client, date souhaitee, type\n"
        "3. Actions : Confirmer (assigner employe + heure), Refuser (avec motif)\n"
        "4. Un badge rouge indique le nombre de demandes en attente",
        styles['CRMBodyText']
    ))

    story.append(PageBreak())

    # ==================== SECTION 7: PORTAILS ====================
    story.append(Paragraph("7. Portail client / employeur", styles['SectionTitle']))
    story.append(HRFlowable(width="100%", thickness=2, color=GOLD))
    story.append(Spacer(1, 10))

    story.append(Paragraph("7.1 Portail client (interne CRM)", styles['SubSection']))
    story.append(Paragraph(
        "Le portail client dans le CRM permet de voir les informations d'un client "
        "comme il les voit. Pour y acceder :\n\n"
        "1. Cliquez 'Portail client' dans le menu\n"
        "2. Selectionnez un client dans la liste\n"
        "3. Consultez ses dossiers, documents, rendez-vous\n"
        "4. Cliquez 'Envoyer acces portail' pour inviter le client",
        styles['CRMBodyText']
    ))

    story.append(Paragraph("7.2 Portail employeur", styles['SubSection']))
    story.append(Paragraph(
        "Pour les dossiers EIMT/LMIA :\n\n"
        "1. Cliquez 'Portail employeurs' dans le menu\n"
        "2. Selectionnez un employeur\n"
        "3. Onglets : Apercu, Bilan financier, Documents, EIMT/LMIA, Formulaires\n"
        "4. L'onglet 'Acces portails' (admin uniquement) gere les identifiants gouvernementaux\n"
        "5. Cliquez 'Envoyer acces portail' pour inviter l'employeur",
        styles['CRMBodyText']
    ))

    story.append(PageBreak())

    # ==================== SECTION 8: ANALYSE ====================
    story.append(Paragraph("8. Analyse d'immigration", styles['SectionTitle']))
    story.append(HRFlowable(width="100%", thickness=2, color=GOLD))
    story.append(Spacer(1, 10))

    story.append(Paragraph(
        "La page Analyse immigration regroupe 3 outils dans un seul onglet :",
        styles['CRMBodyText']
    ))

    story.append(Paragraph("8.1 Admissibilite", styles['SubSection']))
    story.append(Paragraph(
        "Evaluez l'admissibilite d'un client aux differents programmes :\n"
        "1. Entrez le profil du client (age, education, experience, langues)\n"
        "2. Le systeme calcule les programmes eligibles\n"
        "3. Resultat : liste des programmes avec pourcentage de compatibilite\n"
        "4. Recommandations personnalisees",
        styles['CRMBodyText']
    ))

    story.append(Paragraph("8.2 Calculateur CRS (Entree Express)", styles['SubSection']))
    story.append(Paragraph(
        "Calculez le score CRS d'un client :\n"
        "1. Remplissez les facteurs (age, education, langue, experience)\n"
        "2. Score calcule automatiquement sur 1200 points\n"
        "3. Conseils pour ameliorer le score\n"
        "4. Comparaison avec les tirages recents",
        styles['CRMBodyText']
    ))

    story.append(Paragraph("8.3 Calculateur MIFI (Arrima/Quebec)", styles['SubSection']))
    story.append(Paragraph(
        "Calculez le pointage MIFI pour le PSTQ :\n"
        "1. Remplissez les facteurs quebecois specifiques\n"
        "2. Pointage calcule automatiquement\n"
        "3. Conseils d'amelioration adaptes au Quebec",
        styles['CRMBodyText']
    ))

    story.append(PageBreak())

    # ==================== SECTION 9: RH ====================
    story.append(Paragraph("9. Ressources humaines (RH)", styles['SectionTitle']))
    story.append(HRFlowable(width="100%", thickness=2, color=GOLD))
    story.append(Spacer(1, 10))

    story.append(Paragraph(
        "Le module RH permet de gerer les employes. L'acces est strictement controle :",
        styles['CRMBodyText']
    ))

    story.append(Paragraph("9.1 Mon profil (tous les employes)", styles['SubSection']))
    story.append(Paragraph(
        "1. Cliquez 'Ressources humaines' dans le menu\n"
        "2. Vous voyez uniquement VOTRE profil\n"
        "3. Onglets : Mon profil, Mes documents, Mes conges, Mes presences\n"
        "4. Modifiez vos informations personnelles (adresse, telephone, etc.)\n"
        "5. Televersez vos documents (contrat, pieces d'identite, etc.)",
        styles['CRMBodyText']
    ))

    story.append(Paragraph("9.2 Demander un conge", styles['SubSection']))
    story.append(Paragraph(
        "1. Allez dans l'onglet 'Mes conges'\n"
        "2. Cliquez 'Nouvelle demande'\n"
        "3. Selectionnez le type : Vacances, Maladie, Personnel, Ferie\n"
        "4. Choisissez les dates de debut et fin\n"
        "5. Ajoutez des notes si necessaire\n"
        "6. Cliquez 'Soumettre'\n"
        "7. Statut : En attente -> Approuve ou Refuse par l'admin",
        styles['CRMBodyText']
    ))

    story.append(Paragraph("9.3 Pointer sa presence", styles['SubSection']))
    story.append(Paragraph(
        "1. Allez dans l'onglet 'Mes presences'\n"
        "2. Cliquez le bouton 'Pointer' pour marquer votre arrivee\n"
        "3. Votre calendrier montre les presences du mois\n"
        "4. Statistiques : jours presents, absents, teletravail, taux de presence",
        styles['CRMBodyText']
    ))

    story.append(Paragraph("9.4 Administration RH (SuperAdmin uniquement)", styles['SubSection']))
    story.append(Paragraph(
        "Le SuperAdmin peut :\n"
        "- Voir tous les profils employes\n"
        "- Ajouter un nouvel employe (bouton 'Ajouter un employe')\n"
        "- Modifier les informations et salaires\n"
        "- Approuver/refuser les demandes de conge\n"
        "- Voir les presences de tous les employes\n"
        "- Telecharger les documents de chaque employe",
        styles['CRMBodyText']
    ))

    story.append(Paragraph(
        "CONFIDENTIALITE : Les employes ne peuvent JAMAIS voir les profils des autres. "
        "Seul le SuperAdmin a acces a l'ensemble des profils.",
        styles['TipText']
    ))

    story.append(PageBreak())

    # ==================== SECTION 10: AGENT AI ====================
    story.append(Paragraph("10. Agent AI - Assistant virtuel", styles['SectionTitle']))
    story.append(HRFlowable(width="100%", thickness=2, color=GOLD))
    story.append(Spacer(1, 10))

    story.append(Paragraph(
        "L'Agent AI est un assistant intelligent specialise en immigration canadienne. "
        "Il est disponible sur toutes les pages via le bouton dore en bas a droite.",
        styles['CRMBodyText']
    ))

    story.append(Paragraph("10.1 Utilisation", styles['SubSection']))
    story.append(Paragraph(
        "1. Cliquez le bouton dore (icone bulle) en bas a droite de l'ecran\n"
        "2. La fenetre de chat s'ouvre\n"
        "3. Tapez votre question et appuyez Entree\n"
        "4. L'AI repond en quelques secondes\n"
        "5. L'historique est conserve pendant la session",
        styles['CRMBodyText']
    ))

    story.append(Paragraph("10.2 Exemples de questions", styles['SubSection']))
    story.append(Paragraph(
        "- 'Quels sont les programmes d'immigration disponibles ?'\n"
        "- 'Comment fonctionne l'Entree Express ?'\n"
        "- 'Quels documents faut-il pour un permis de travail ?'\n"
        "- 'Quelles sont les exigences du PEQ ?'\n"
        "- 'Quel est le score CRS minimum ?'\n"
        "- 'Comment faire une demande EIMT/LMIA ?'",
        styles['CRMBodyText']
    ))

    story.append(Paragraph(
        "L'AI ne donne jamais de conseils juridiques specifiques. "
        "Pour les questions complexes, il referera toujours a l'equipe.",
        styles['TipText']
    ))

    story.append(PageBreak())

    # ==================== SECTION 11: PARAMETRES ====================
    story.append(Paragraph("11. Parametres et administration", styles['SectionTitle']))
    story.append(HRFlowable(width="100%", thickness=2, color=GOLD))
    story.append(Spacer(1, 10))

    story.append(Paragraph("11.1 Equipe", styles['SubSection']))
    story.append(Paragraph(
        "Gestion des membres de l'equipe (SuperAdmin/Coordinatrice) :\n"
        "- Voir tous les membres avec role et statut\n"
        "- Ajouter un membre : nom, courriel, role, mot de passe temporaire\n"
        "- Modifier : changer le role, activer/desactiver\n"
        "- Reinitialiser un mot de passe\n"
        "- Matrice des permissions par role",
        styles['CRMBodyText']
    ))

    story.append(Paragraph("11.2 Portails", styles['SubSection']))
    story.append(Paragraph(
        "Configuration des portails client et employeur :\n"
        "- Activer/desactiver les portails\n"
        "- Voir la liste des acces actifs\n"
        "- Revoquer un acces\n"
        "- Statistiques d'utilisation",
        styles['CRMBodyText']
    ))

    story.append(Paragraph("11.3 Cabinet", styles['SubSection']))
    story.append(Paragraph(
        "Informations du cabinet d'immigration :\n"
        "- Nom, adresse, telephone, courriel\n"
        "- Licence RCIC, numero CICC\n"
        "- Ces informations apparaissent dans les contrats et documents officiels",
        styles['CRMBodyText']
    ))

    story.append(PageBreak())

    # ==================== SECTION 12: SECURITE ====================
    story.append(Paragraph("12. Securite et bonnes pratiques", styles['SectionTitle']))
    story.append(HRFlowable(width="100%", thickness=2, color=GOLD))
    story.append(Spacer(1, 10))

    story.append(Paragraph("12.1 Regles de securite obligatoires", styles['SubSection']))

    security_rules = [
        "Ne partagez JAMAIS votre mot de passe avec quiconque",
        "Deconnectez-vous en quittant votre poste de travail",
        "Ne laissez pas votre ecran visible aux clients",
        "Verifiez l'identite du client avant de partager des informations",
        "Ne televersez jamais de documents personnels sur des sites non autorises",
        "Signalez immediatement toute activite suspecte au SuperAdmin",
        "Changez votre mot de passe tous les 90 jours",
        "Utilisez un mot de passe fort : min 8 caracteres, 1 majuscule, 1 chiffre, 1 special",
    ]
    for rule in security_rules:
        story.append(Paragraph(f"* {rule}", styles['BulletText']))

    story.append(Spacer(1, 10))

    story.append(Paragraph("12.2 Protection des donnees clients", styles['SubSection']))
    story.append(Paragraph(
        "Conformement aux lois quebecoises sur la protection des renseignements personnels :\n\n"
        "- Toutes les donnees clients sont chiffrees en transit et au repos\n"
        "- L'acces est controle par role (RBAC)\n"
        "- Les API sont protegees par authentification\n"
        "- Les sessions expirent apres 30 minutes d'inactivite\n"
        "- Un journal d'audit trace toutes les actions sensibles\n"
        "- Les donnees sont hebergees au Canada (Supabase)",
        styles['CRMBodyText']
    ))

    story.append(Paragraph("12.3 Contact support", styles['SubSection']))
    story.append(Paragraph(
        "Pour toute question technique ou probleme d'acces :\n\n"
        "- SuperAdmin : pcadet@soshubcanada.com\n"
        "- Support technique : direction@soshubcanada.com\n"
        "- En cas d'urgence securite : contacter le SuperAdmin immediatement",
        styles['CRMBodyText']
    ))

    story.append(Spacer(1, 40))

    # Final note
    final_box = [
        [Paragraph(
            "<b>SOS Hub Canada Inc.</b><br/>"
            "Ce manuel est la propriete de SOS Hub Canada Inc.<br/>"
            "Toute reproduction ou distribution non autorisee est interdite.<br/>"
            "Version 1.0 - Mars 2026",
            ParagraphStyle('FinalNote', parent=styles['Normal'],
                fontSize=10, textColor=white, alignment=TA_CENTER, leading=16)
        )]
    ]
    final_table = Table(final_box, colWidths=[460])
    final_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), NAVY),
        ('TOPPADDING', (0,0), (0,0), 15),
        ('BOTTOMPADDING', (0,0), (0,0), 15),
        ('LEFTPADDING', (0,0), (0,0), 20),
        ('RIGHTPADDING', (0,0), (0,0), 20),
    ]))
    story.append(final_table)

    # Build
    doc.build(story, onFirstPage=add_header_footer, onLaterPages=add_header_footer)
    print(f"Manuel genere : {OUTPUT}")
    print(f"Taille : {os.path.getsize(OUTPUT) / 1024:.0f} Ko")

if __name__ == '__main__':
    build_manual()
