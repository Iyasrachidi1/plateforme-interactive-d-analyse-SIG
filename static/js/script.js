
const toggleButton = document.getElementById('toggle-controls');
const filters = document.getElementById('filters');

toggleButton.addEventListener('click', () => {
    const isHidden = filters.classList.contains('hidden');
    filters.classList.toggle('hidden');
});



// Initialisation de la carte
var map = L.map('map').setView([48.85908, 2.34688], 15);
// add Leaflet-Geoman controls with some options to the map  
map.pm.addControls({  
    position: 'topright',  
    drawCircleMarker: false,
    rotateMode: false,
  }); 
// Listen for the creation of shapes
map.on('pm:create', function (e) {
    const layer = e.layer; // The newly created layer (polygon or rectangle)

    if (layer instanceof L.Polygon || layer instanceof L.Rectangle) {
        // Calculate the area in square meters
        const latLngs = layer.getLatLngs()[0]; // Get the vertices of the shape
        const area = L.GeometryUtil.geodesicArea(latLngs); // Geodesic area in m²
        const areaInHectares = (area / 10000).toFixed(2); // Convert to hectares

        // Bind a popup to the layer with the area information
        layer.bindPopup(`Surface: ${areaInHectares} ha`).openPopup();
    }
});
// Ajout d'une couche de base OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);


var vectorLayer;
let numElementsTotale = 0;
// Fonction pour appliquer les filtres
function applyFilters() {
    if (vectorLayer) {
    map.removeLayer(vectorLayer);
    }
    document.getElementById("num-elements").textContent = "En cours de comptage des éléments filtrés...";
    document.getElementById("num-elements").style.color = "red";
    var usageType = document.getElementById("usage-filter").value;
    var minHeight = parseFloat(document.getElementById("min-height").value) || 0;
    var maxHeight = parseFloat(document.getElementById("max-height").value) || Infinity;
    var minSurface = parseFloat(document.getElementById("surface-filter").value) || 0;
    var isolationType = document.getElementById("isolation-filter").value;
    var materialType = document.getElementById("material-filter").value;
    var floorType = document.getElementById("floor-filter").value;
    var minYear = parseInt(document.getElementById("min-year").value) || null; // Année minimale
    var maxYear = parseInt(document.getElementById("max-year").value) || null; // Année maximale
    var filteredColor = document.getElementById("filtered-color").value;
    var unfilteredColor = document.getElementById("unfiltered-color").value;
    
    fetch(`https://ilyasra1.pythonanywhere.com/get_filtered_data?categories=${encodeURIComponent(usageType)}&min_height=${minHeight}&max_height=${maxHeight}&min_surface=${minSurface}&isolation=${encodeURIComponent(isolationType)}&material=${encodeURIComponent(materialType)}&floor=${encodeURIComponent(floorType)}&min_year=${minYear}&max_year=${maxYear}`)
    .then(response => {
        if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Données reçues depuis l’API :', data);
        document.getElementById("num-elements").textContent = `Nombre d'éléments filtrés : ${data.num_elements}`;
        document.getElementById("num-elements").style.color = "green"; // Success color
        numElementsTotale = data.num_elements_totale;
    })
    .catch(error => {
        console.error('Erreur lors de la récupération des données :', error);
        document.getElementById("num-elements").textContent = "Erreur : impossible de récupérer les données.";
    });

    // Charger et afficher les tuiles vectorielles filtrées
    vectorLayer = L.vectorGrid.protobuf(
    'https://api.maptiler.com/tiles/7ac1b707-2d6a-4766-aaee-be71f6b60979/{z}/{x}/{y}.pbf?key=bL66FVK5J4yUTp9TkgHD',
    
    {
        interactive: true,
        vectorTileLayerStyles: {
        me__bdnb__batiment_groupe_compile: function (properties) {
            // Vérifiez si tous les filtres sont vides
            var isFilterEmpty = !usageType && minHeight === 0 && maxHeight === Infinity && minSurface === 0 && !isolationType && !materialType && !floorType && minYear === null && maxYear === null;

            // Si aucun filtre n'est appliqué, afficher tous les bâtiments
            if (isFilterEmpty) {
            return { color: unfilteredColor, fill: true, fillColor: unfilteredColor, fillOpacity: 0.8, opacity: 0 };
            }
            var usageMatch = !usageType || (properties.bdtopo_bat_l_usage_1 && properties.bdtopo_bat_l_usage_1.toLowerCase().includes(usageType.toLowerCase()));
            var heightMatch = !isNaN(minHeight) && !isNaN(maxHeight) && properties.bdtopo_bat_hauteur_mean >= minHeight && properties.bdtopo_bat_hauteur_mean <= maxHeight;
            var surfaceMatch = properties.dpe_mix_arrete_surface_habitable_logement >= minSurface;
            var isolationMatch = isolationType === "" || (properties.dpe_mix_arrete_type_isolation_mur_exterieur && properties.dpe_mix_arrete_type_isolation_mur_exterieur.toLowerCase() === isolationType.toLowerCase());
            var materialMatch = materialType === "" || (properties.dpe_mix_arrete_materiaux_structure_mur_exterieur && properties.dpe_mix_arrete_materiaux_structure_mur_exterieur.toLowerCase() === materialType.toLowerCase());
            var floorMatch = !floorType || (properties.dpe_mix_arrete_type_plancher_bas_deperditif && properties.dpe_mix_arrete_type_plancher_bas_deperditif.toLowerCase().includes(floorType.toLowerCase()));
            
            // Extraction des années de construction
            var yearStrings = properties.rnc_l_annee_construction; // Supposons que c'est une chaîne comme '(1:1787)'
            var years = [];

            var regex = /\d+:\d+/g; // Capture les paires de type "X:YYYY"
            var matches = yearStrings.match(regex);

            if (matches) {
            // Pour chaque match, extraire l'année
            matches.forEach(match => {
                var year = parseInt(match.split(':')[1]); // Prendre la partie après ':'
                if (!isNaN(year)) {
                years.push(year); // Ajouter l'année à la liste
                }
            });
            }

            // Vérifiez si les années extraites se situent dans la plage spécifiée
            var yearMatch = (minYear === null || years.some(year => year >= minYear)) && (maxYear === null || years.some(year => year <= maxYear));

            return (usageMatch && heightMatch && surfaceMatch && isolationMatch && materialMatch && floorMatch && yearMatch)
                ? { color: filteredColor, fill: true, fillColor: filteredColor, fillOpacity: 0.9, opacity: 0, interactive: true }
                : { color: unfilteredColor, fill: true, fillColor: unfilteredColor, fillOpacity: 0.7, opacity: 0, interactive: true };

        }
        }
    }
    );

    vectorLayer.on('click', function (event) {
    // Récupération des propriétés de la tuile 
    var properties = event.layer.properties;

    // Création du contenu du popup
    var popupContent = `
        <b>Type d'usage :</b> ${properties.bdtopo_bat_l_usage_1 || 'N/A'}<br>
        <b>Hauteur moyenne :</b> ${properties.bdtopo_bat_hauteur_mean || 'N/A'} m<br>
        <b>Surface habitable :</b> ${properties.dpe_mix_arrete_surface_habitable_logement || 'N/A'} m²<br>
        <b>Type d'isolation :</b> ${properties.dpe_mix_arrete_type_isolation_mur_exterieur || 'Non spécifié'}<br>
        <b>Matériau des murs :</b> ${properties.dpe_mix_arrete_materiaux_structure_mur_exterieur || 'Non spécifié'}<br>
        <b>Type de plancher :</b> ${properties.dpe_mix_arrete_type_plancher_bas_deperditif || 'N/A'}<br>
        <b>Année de construction :</b> ${properties.rnc_l_annee_construction || 'N/A'}<br>
    `;

    // Affichage du popup
    L.popup()
    .setLatLng(event.latlng)
    .setContent(popupContent)
    .openOn(map);
    });

    vectorLayer.addTo(map);
}



// Ajout d'écouteurs pour le bouton d'application des filtres
document.getElementById("apply-filters").addEventListener("click", applyFilters);
document.getElementById('download-geojson').addEventListener('click', () => {
    const numElementsEl = document.getElementById("num-elements");
    numElementsEl.textContent = "En cours de telechargement des éléments filtrés...";
    numElementsEl.style.color = "red";

    // Récupérer les filtres
    const usageType = document.getElementById("usage-filter").value;
    const minHeight = parseFloat(document.getElementById("min-height").value) || 0;
    const maxHeight = parseFloat(document.getElementById("max-height").value) || Infinity;
    const minSurface = parseFloat(document.getElementById("surface-filter").value) || 0;
    const isolationType = document.getElementById("isolation-filter").value;
    const materialType = document.getElementById("material-filter").value;
    const floorType = document.getElementById("floor-filter").value;
    const minYear = parseInt(document.getElementById("min-year").value) || null; // Année minimale
    const maxYear = parseInt(document.getElementById("max-year").value) || null; // Année maximale

    // Construire l'URL de l'API
    const url = `https://ilyasra1.pythonanywhere.com/download_filtered_data?categories=${encodeURIComponent(usageType)}&min_height=${minHeight}&max_height=${maxHeight}&min_surface=${minSurface}&isolation=${encodeURIComponent(isolationType)}&material=${encodeURIComponent(materialType)}&floor=${encodeURIComponent(floorType)}&min_year=${minYear}&max_year=${maxYear}`;

    // Envoyer une requête pour vérifier si le fichier est prêt (optionnel)
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error("Erreur lors du téléchargement du fichier.");
            }

            // Télécharger le fichier
            const link = document.createElement('a');
            link.href = url;
            link.download = 'filtered_data.geojson';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Mise à jour du message
            numElementsEl.textContent = "Téléchargement terminé.";
            numElementsEl.style.color = "green";
        })
        .catch(error => {
            // Gestion des erreurs
            console.error(error);
            numElementsEl.textContent = "Erreur lors du téléchargement.";
            numElementsEl.style.color = "red";
        });
});

document.getElementById('download-report').addEventListener('click', function () {
    // Récupérer les filtres appliqués
    const usageType = document.getElementById("usage-filter").value;
    const minHeight = parseFloat(document.getElementById("min-height").value) || 0;
    const maxHeight = parseFloat(document.getElementById("max-height").value) || Infinity;
    const minSurface = parseFloat(document.getElementById("surface-filter").value) || 0;
    const isolationType = document.getElementById("isolation-filter").value;
    const materialType = document.getElementById("material-filter").value;
    const floorType = document.getElementById("floor-filter").value;
    const minYear = parseInt(document.getElementById("min-year").value) || null;
    const maxYear = parseInt(document.getElementById("max-year").value) || null;

    // Remplacement des valeurs pour l'affichage
    const displayUsageType = usageType === "" || usageType === "0" ? "toutes les catégories" : usageType;
    const displayMinHeight = isNaN(minHeight) || minHeight === 0 ? "Non spécifié" : String(minHeight);  // Convertir en chaîne
    const displayMaxHeight = isNaN(maxHeight) || maxHeight === Infinity ? "Non spécifié" : String(maxHeight);  // Convertir en chaîne
    const displayMinSurface = isNaN(minSurface) || minSurface === 0 ? "Non spécifié" : String(minSurface);  // Convertir en chaîne
    const displayIsolationType = isolationType === "" ? "toutes les catégories" : isolationType;
    const displayMaterialType = materialType === "" ? "toutes les catégories" : materialType;
    const displayFloorType = floorType === "" ? "toutes les catégories" : floorType;
    const displayMinYear = minYear === null ? "Non spécifié" : String(minYear);  // Convertir en chaîne
    const displayMaxYear = maxYear === null ? "Non spécifié" : String(maxYear);  // Convertir en chaîne

    // Récupérer le nombre d'éléments filtrés
    const filteredElementsCountText = document.getElementById("num-elements").textContent;
    const filteredElementsCount = filteredElementsCountText.includes('Nombre') 
        ? filteredElementsCountText.split(': ')[1] 
        : 'En cours de comptage des éléments filtrés...';
    
    if (filteredElementsCount === 'En cours de comptage des éléments filtrés...') {
        alert("Le comptage des éléments est toujours en cours. Veuillez patienter...");
        return; // Empêche le téléchargement si le comptage n'est pas terminé
    }

    // Vérifiez que filteredElementsCount est un nombre ou une chaîne valide
    const filteredElementsCountNumber = parseInt(filteredElementsCount) || 0;

    // Récupérer le nombre total d'éléments (assurez-vous qu'il est défini quelque part dans votre code)
    const numElementsTotale = 74407; // Exemple, remplacez par la vraie valeur

    // Créer un PDF avec jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // En-tête du rapport
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Rapport des Filtres Appliqués', 105, 20, { align: 'center' });

    // Sous-titre
    doc.setFontSize(12);
    doc.setFont('Helvetica', 'normal');
    doc.text('{Ce rapport présente les filtres appliqués à la recherche, ainsi que les résultats correspondants}', 105, 30, { align: 'center' });

    // Ajouter une ligne de séparation
    doc.setLineWidth(0.5);
    doc.line(10, 35, 200, 35);

    // Ajouter un tableau pour les filtres
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0); // Texte noir

    // En-tête du tableau
    const tableHeaders = ['Critère', 'Valeur'];
    doc.setFont('Helvetica', 'bold');
    let yOffset = 40;
    doc.text(tableHeaders[0], 10, yOffset);
    doc.text(tableHeaders[1], 100, yOffset);
    doc.setLineWidth(0.5);
    doc.line(10, yOffset + 2, 200, yOffset + 2); // Ligne de séparation après les en-têtes

    // Ajouter les filtres dans le tableau
    const filters = [
        { label: "Type d'usage", value: displayUsageType },
        { label: "Hauteur minimale (m)", value: displayMinHeight },
        { label: "Hauteur maximale (m)", value: displayMaxHeight },
        { label: "Surface minimale (m²)", value: displayMinSurface },
        { label: "Type d'isolation", value: displayIsolationType },
        { label: "Matériau des murs", value: displayMaterialType },
        { label: "Type de plancher", value: displayFloorType },
        { label: "Année de construction minimale", value: displayMinYear },
        { label: "Année de construction maximale", value: displayMaxYear },
    ];

    filters.forEach((filter, index) => {
        yOffset += 10;
        doc.setFont('Helvetica', 'normal');
        doc.text(filter.label, 10, yOffset);
        doc.text(filter.value, 100, yOffset);
    });

    // Ajouter le nombre d'éléments filtrés
    yOffset += 15;
    doc.setFontSize(14);
    doc.setFont('Helvetica', 'bold'); // Gras
    doc.setTextColor(0, 128, 0); // Couleur verte (RGB)

    const filteredText = `Nombre d'éléments filtrés : ${filteredElementsCountNumber} sur ${numElementsTotale}`;
    // Calculer la largeur du texte pour le centrer
    const textWidth = doc.getTextWidth(filteredText);
    // Calculer la position X pour centrer
    const xPosition = (210 - textWidth) / 2;

    doc.text(filteredText, xPosition, yOffset);
    // Sauvegarder le PDF
    doc.save('rapport_filtres.pdf');
});

// Charger les données initiales sans filtres
applyFilters();
