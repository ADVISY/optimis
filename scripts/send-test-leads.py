#!/usr/bin/env python3
"""Envoie 3 leads test pour chaque type de formulaire Optimis (13 types × 3 = 39 leads)."""

import json
import random
import urllib.request
import uuid
from datetime import datetime

URL = "https://iuuefrxcmrcdbbuyzhqf.supabase.co/functions/v1/submit-lead"
ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1dWVmcnhjbXJjZGJidXl6aHFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NDYwNjEsImV4cCI6MjA5NDMyMjA2MX0.cyCemdPbEsAnW6gu9GP_cJ2Qr_DKovARzO9cjit41tE"

CANTONS = ["VD","GE","VS","FR","NE","BE","ZH","BS","JU","LU","ZG","SG","TI"]
PRENOMS = {
    "fr": ["Marie","Jean","Sophie","Paul","Laura","Pierre","Anne","Marc","Julie","Thomas","Léa","Lucas","Camille","Antoine"],
    "de": ["Stefan","Petra","Hans","Sabine","Michael","Anna","Klaus","Eva","Markus","Lisa","Daniel","Nicole","Tobias","Sarah"],
}
NOMS = {
    "fr": ["Dupont","Favre","Roy","Martin","Bernard","Petit","Robert","Richard","Simon","Lefebvre","Chappuis","Rochat","Bovet","Galland"],
    "de": ["Müller","Schmidt","Weber","Meyer","Wagner","Becker","Schulz","Hofmann","Koch","Fischer","Huber","Bauer","Wolf","Vogel"],
}

def rand_birth(min_age, max_age):
    age = random.randint(min_age, max_age)
    yr = datetime.now().year - age
    return f"{yr}-{random.randint(1,12):02d}-{random.randint(1,28):02d}", age

def commons(lang, form_type):
    p = random.choice(PRENOMS[lang])
    n = random.choice(NOMS[lang])
    sid = uuid.uuid4().hex[:8]
    return {
        "formType": form_type,
        "leadId": f"TEST-{form_type.upper().replace('-','_')}-{sid}",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "Prénom": p,
        "Nom": n,
        "Email": f"{p.lower().replace(' ','')}.{n.lower().replace(' ','')}.{sid}@example.com",
        "Téléphone": f"+41 7{random.randint(6,9)} {random.randint(100,999)} {random.randint(10,99)} {random.randint(10,99)}",
        "Canton": random.choice(CANTONS),
        "Langue": lang,
    }

def send(payload):
    prenom = payload.get("Prénom") or payload.get("PRENOM") or "?"
    nom = payload.get("Nom") or payload.get("NOM") or "?"
    canton = payload.get("Canton") or payload.get("CANTON") or "?"
    langue = payload.get("Langue") or payload.get("LANGUE") or "?"
    label = f"{payload['formType']:<23} — {prenom} {nom} ({canton}, {langue})"
    try:
        req = urllib.request.Request(URL, data=json.dumps(payload).encode(), headers={
            "Authorization": f"Bearer {ANON}", "Content-Type": "application/json"
        })
        resp = json.loads(urllib.request.urlopen(req, timeout=30).read())
        ok = resp.get("bd", {}).get("stored", False)
        print(f"  {'✓' if ok else '✗'} {label}")
    except Exception as e:
        print(f"  ✗ {label} — {e}")

# ============================================================
# Builders par type
# ============================================================

def build_health(lang):
    birth, _ = rand_birth(22, 62)
    base = commons(lang, "health-insurance")
    is_de = lang == "de"
    return {**base,
        "Code postal": str(random.randint(1000, 9999)),
        "Date de naissance": birth,
        "Assurance actuelle": "Ja" if is_de else "Oui",
        "Assureur actuel": random.choice(["CSS","Helsana","Sanitas","Groupe Mutuel","Assura","Visana","Concordia","SWICA"]),
        "Situation familiale": random.choice(["Allein","Paar","Paar mit Kindern"] if is_de else ["Seul(e)","Couple","Couple + enfant(s)","Seul + enfant(s)"]),
        "Modèle LAMal": random.choice(["Standard","HMO","Hausarztmodell","Telemedizin","Médecin de famille"]),
        "Franchise": random.choice(["CHF 300","CHF 500","CHF 1000","CHF 1500","CHF 2500"]),
        "Couverture accident": "Ja" if is_de else random.choice(["Oui","Non"]),
        "Niveau complémentaire": random.choice(["basic","premium","diamond"]),
        "Complémentaire dentaire": random.choice(["Oui","Non"]),
        "Complémentaire hospitalisation": random.choice(["Oui","Non"]),
        "Complémentaire lunettes": random.choice(["Oui","Non"]),
        "Complémentaire médecine alternative": "Non",
        "Complémentaire monde entier": random.choice(["Oui","Non"]),
    }

def build_subsidy(lang):
    birth, _ = rand_birth(25, 60)
    base = commons(lang, "subsidy")
    return {**base,
        "Code postal": str(random.randint(1000, 9999)),
        "Date de naissance": birth,
        "Composition du foyer": random.choice(["Seul","Couple","Seul + enfant(s)","Couple + enfant(s)"]),
        "Assurance actuelle": "Oui",
        "Nom de l'assureur": random.choice(["CSS","Helsana","Groupe Mutuel","Assura","Visana"]),
        "Franchise actuelle": random.choice(["CHF 300","CHF 500","CHF 2500"]),
        "Revenu annuel": f"CHF {random.choice([45000,60000,75000,90000,110000])}",
        "Situation particulière": random.choice(["Aucune situation particulière","Étudiant","Au chômage","Retraité"]),
    }

def build_pillar3(lang):
    base = commons(lang, "pillar-3a")
    # 3e Pilier utilise des MAJUSCULES (cf Excel + interface form)
    return {
        "formType": base["formType"], "leadId": base["leadId"], "timestamp": base["timestamp"],
        "PRENOM": base["Prénom"], "NOM": base["Nom"], "EMAIL": base["Email"], "TELEPHONE": base["Téléphone"],
        "CANTON": base["Canton"], "LANGUE": base["Langue"],
        "3ème pilier existant": random.choice(["Oui","Non","Ja","Nein"]),
        "Prestataire actuel": random.choice(["-","Swisslife","Helvetia","Generali","Bâloise"]),
        "OBJECTIF": random.choice(["Économie d'impôt","Préparer la retraite","Investir","Acheter un bien"]),
        "AGE": random.randint(25, 60),
        "STATUT": random.choice(["Salarié","Indépendant","Cadre","Cadre dirigeant"]),
        "REVENUS": random.choice(["CHF 50000-80000","CHF 80000-120000","CHF 120000-200000","CHF 200000+"]),
        "EPARGNE": random.choice(["CHF 100-300 / mois","CHF 300-500 / mois","CHF 500-max / mois"]),
        "HORIZON": random.choice(["< 10 ans","10 – 20 ans","20 – 30 ans","> 30 ans"]),
        "PROFIL": random.choice(["Prudent","Modéré","Dynamique"]),
    }

def build_lpp(lang):
    birth, _ = rand_birth(28, 58)
    base = commons(lang, "lpp-libre-passage")
    return {**base,
        "Objectif": random.choice(["🔍 Retrouver mes fonds LPP","Consolider mes avoirs LPP"]),
        "Situation actuelle": random.choice(["Salarié","Indépendant","Sans emploi"]),
        "Années travaillées en Suisse": random.choice(["Moins de 10 ans","Plus de 10 ans","Plus de 20 ans","Plus de 30 ans"]),
        "Date de naissance": birth,
    }

def build_mortgage(lang):
    base = commons(lang, "mortgage")
    return {**base,
        "Type de projet": random.choice(["Acquisition","Renouvellement","Refinancement"]),
        "Type de bien": random.choice(["Appartement","Maison","Immeuble"]),
        "Valeur du bien": str(random.choice([450000, 650000, 850000, 1200000, 1800000])),
        "Commune": random.choice(["Lausanne","Sion","Genève","Fribourg","Berne","Zurich","Neuchâtel"]),
        "Nombre d'emprunteurs": str(random.choice([1, 2])),
        "Situation professionnelle": random.choice(["Salarié","Indépendant","Cadre dirigeant","Retraité"]),
        "Revenu annuel": random.choice(["80000-120000","120000-150000","150000-200000","200000+"]),
        "Fonds propres": random.choice(["50000-100000","100000-200000","200000-500000","500000+"]),
    }

def build_car(lang):
    base = commons(lang, "car-insurance")
    cant = base["Canton"]
    return {**base,
        "Plaque d'immatriculation": f"{cant} {random.randint(1000, 999999)}",
        "Marque du véhicule": random.choice(["BMW","Audi","Volkswagen","Toyota","Mercedes","Renault","Tesla","Peugeot"]),
        "Modèle du véhicule": random.choice(["Série 3","A4","Golf","Corolla","Classe C","Clio","Model 3","208"]),
        "Année du véhicule": str(random.randint(2015, 2025)),
        "Utilisation": random.choice(["Privé","Privé + travail","Professionnel"]),
        "Km annuels": str(random.choice([5000, 10000, 15000, 20000, 30000])),
        "Date de naissance du conducteur": rand_birth(22, 60)[0],
        "Année du permis": str(random.randint(2000, 2018)),
        "Accidents (5 dernières années)": str(random.choice([0, 0, 0, 1, 2])),
        "Type de couverture": random.choice(["Responsabilité civile","Casco partielle","Casco complète"]),
        "Option bris de glace": random.choice(["Oui","Non"]),
        "Option assistance": random.choice(["Oui","Non"]),
        "Option véhicule de remplacement": random.choice(["Oui","Non"]),
    }

def build_household(lang):
    base = commons(lang, "household-insurance")
    return {**base,
        "Type de bien": random.choice(["Appartement","Maison","Villa","Studio"]),
        "Statut de propriété": random.choice(["Locataire","Propriétaire"]),
        "Surface habitable": str(random.choice([65, 85, 120, 150])),
        "Nombre de pièces": random.choice(["3","4","5","6+"]),
        "Valeur du bien": str(random.choice([80000, 120000, 200000, 350000])),
        "Code postal": str(random.randint(1000, 9999)),
    }

def build_legal(lang):
    base = commons(lang, "legal-protection")
    return {**base,
        "Type de couverture": random.choice(["Protection circulation","Protection privée","Protection complète"]),
        "Couverture circulation": random.choice(["Oui","Non"]),
        "Couverture privée": random.choice(["Oui","Non"]),
        "Couverture travail": random.choice(["Oui","Non"]),
        "Couverture propriété": random.choice(["Oui","Non"]),
        "Couverture locataire": random.choice(["Oui","Non"]),
        "Taille du ménage": random.choice(["Seul(e)","Couple","Famille"]),
    }

def build_pro(lang):
    base = commons(lang, "professional-insurance")
    return {**base,
        "Type d'activité": random.choice(["Conseil","Courtier en assurance","Avocat","Médecin","Restaurateur","Architecte"]),
        "Forme juridique": random.choice(["Indépendant","Sàrl","SA","SNC"]),
        "Nombre d'employés": random.choice(["0","1-5","6-10","11-20","20+"]),
        "Chiffre d'affaires annuel": str(random.choice([100000, 250000, 500000, 1000000, 2500000])),
        "Date de début de contrat": f"{datetime.now().year}-{random.randint(1,12):02d}-01",
        "insuranceTypes": ", ".join(random.sample(["RC Professionnelle","Perte de gain","LAA (Accident)","LPP (Prévoyance)","Protection juridique","Multirisque"], 3)),
        "Message": "Test automatisé",
    }

def build_estimation(lang):
    base = commons(lang, "estimation-immobiliere")
    return {**base,
        "Adresse du bien": f"Rue de la Gare {random.randint(1, 99)}, {random.randint(1000,9999)} {base['Canton']}",
        "Type de bien": random.choice(["Appartement","Maison","Villa","Commercial","Terrain"]),
        "Nombre de pièces": random.choice(["2-3 pièces","3-4 pièces","5-6 pièces","7+ pièces"]),
        "Surface (m²)": str(random.choice([60, 90, 120, 180, 250])),
        "Délai de vente": random.choice(["Urgent","Le plus vite possible","3 mois","6 mois","Pas pressé"]),
        "Mandat agence signé": random.choice(["Oui","Non"]),
    }

def build_termination(lang):
    base = commons(lang, "termination")
    return {**base,
        "Type de contrat": random.choice(["Assurance maladie","Assurance voiture","Assurance ménage","Protection juridique","Assurance vie"]),
        "Assureur actuel": random.choice(["CSS","Helsana","AXA","La Mobilière","Allianz","Zurich","Bâloise"]),
        "Numéro de police": f"POL-{random.randint(100000, 999999)}",
        "Date de résiliation souhaitée": f"{datetime.now().year}-12-31",
        "Motif": random.choice(["Changement d'assureur","Prix trop élevé","Couverture insuffisante","Déménagement"]),
    }

def build_prenatal(lang):
    base = commons(lang, "prenatal-insurance")
    return {**base,
        "Date de naissance": rand_birth(25, 40)[0],
        "Franchise enfant": random.choice(["CHF 0","CHF 100","CHF 200","CHF 300","CHF 500"]),
        "Soins dentaires enfant": random.choice(["Oui","Non"]),
        "Maman a déjà une assurance": "Oui",
        "Assureur actuel de la maman": random.choice(["CSS","Helsana","Sanitas","Groupe Mutuel"]),
    }

def build_partner(lang):
    base = commons(lang, "partner")
    return {**base,
        "Budget mensuel": random.choice(["Moins de CHF 3'000","CHF 3'000 – 5'000","CHF 5'000 – 10'000","Plus de CHF 10'000"]),
        "Secteur d'activité": random.choice(["Assurance","Immobilier","Finance","Télécom"]),
        "Entreprise": random.choice(["Cabinet Alpha","Beta Conseils","Gamma SA","Delta Sàrl"]),
        "Force de vente": random.choice(["1 commercial","2 – 5 commerciaux","6 – 10 commerciaux","11 – 20 commerciaux"]),
    }

# ============================================================
# Dispatch
# ============================================================
FORMS = [
    ("health-insurance", build_health, ["fr","fr","de"]),
    ("subsidy", build_subsidy, ["fr","fr","fr"]),
    ("pillar-3a", build_pillar3, ["fr","de","fr"]),
    ("lpp-libre-passage", build_lpp, ["fr","fr","de"]),
    ("mortgage", build_mortgage, ["fr","fr","de"]),
    ("car-insurance", build_car, ["fr","de","fr"]),
    ("household-insurance", build_household, ["fr","de","fr"]),
    ("legal-protection", build_legal, ["fr","fr","de"]),
    ("professional-insurance", build_pro, ["fr","fr","fr"]),
    ("estimation-immobiliere", build_estimation, ["fr","fr","fr"]),
    ("termination", build_termination, ["fr","de","fr"]),
    ("prenatal-insurance", build_prenatal, ["fr","fr","de"]),
    ("partner", build_partner, ["fr","fr","fr"]),
]

print(f"📤 Envoi de {len(FORMS) * 3} leads tests ({len(FORMS)} types × 3 leads chacun)\n")
total_ok = 0
for form_type, builder, langs in FORMS:
    print(f"━━━ {form_type} ━━━")
    for lang in langs:
        payload = builder(lang)
        send(payload)
        total_ok += 1
    print()
print(f"✅ Total : {total_ok} leads envoyés")
