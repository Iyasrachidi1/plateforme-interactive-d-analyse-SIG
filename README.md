# 🌍 Plateforme Interactive d'Analyse SIG  

Une solution web interactive permettant l'analyse et la visualisation des données géospatiales liées aux bâtiments.  

## 🚀 Fonctionnalités  
- 📌 **Filtrage avancé** : Filtrer les données selon plusieurs critères (type d'usage, hauteur, surface, etc.).  
- 🗺️ **Carte interactive** : Visualisation avec **Leaflet.js** et **tuiles vectorielles**.  
- 📝 **Génération de rapports PDF** : Export des résultats sous forme de documents détaillés.  
- 📂 **Export des données** : Possibilité de télécharger les données filtrées au format **GeoJSON**.  
- ⚡ **Performance optimisée** : Chargement rapide des données avec **MapTiler** et **Flask** en backend.  

---

## 🛠 Technologies Utilisées  
- **Frontend** : HTML, CSS, JavaScript, **Leaflet.js**  
- **Backend** : **Flask** (API, comptage d'entités, export GeoJSON, génération de PDF)  
- **Base de données** : **GPKG (GeoPackage)**  
- **Stockage des tuiles vectorielles** : **MapTiler**  
- **Déploiement** : **PythonAnywhere**  

---
## 📂 Structure du Projet 
```bash

/plateforme-interactive-d-analyse-SIG
│── app.py                  # Backend Flask
│── requirements.txt         # Dépendances
│── README.md                # Documentation
│── static/                  # Frontend (CSS, JS, Images)
│── templates/               # Pages HTML
│── docs/                    # Documentation (PDF)
```
---

## 🏗 Architecture de la plateforme  
![Architecture](https://github.com/user-attachments/assets/783f00eb-72c7-4201-a619-8228c703e18c)

---

## 🏗 Installation et Exécution  
### 1️⃣ **Cloner le dépôt**  
```bash
git clone https://github.com/Iyasrachidi1/plateforme-interactive-d-analyse-SIG.git
cd plateforme-interactive-d-analyse-SIG
```
### 2️⃣ Installer les dépendances
```bash
python -m venv venv
source venv/bin/activate  # Mac/Linux
venv\Scripts\activate     # Windows
pip install -r requirements.txt
```
### 3️⃣ Lancer l'application Flask
```bash
python app.py
```
➡️ L'application sera accessible à : http://127.0.0.1:5000/

🌐 Accès en ligne

l'application est également accessible via GitHub Pages :

🔗 👉 https://iyasrachidi1.github.io/ilyas/
---
👤 Auteur

[**Ilyas Rachidi**](https://github.com/Iyasrachidi1)
📌 **Lien du projet GitHub** : [plateforme-interactive-d-analyse-SIG](https://github.com/Iyasrachidi1/plateforme-interactive-d-analyse-SIG)  
📌 **Lien vers la documentation** : [Rapport_SIG.pdf]([docs](https://github.com/Iyasrachidi1/plateforme-interactive-d-analyse-SIG/tree/main/docs/Rapport_SIG.pdf)
