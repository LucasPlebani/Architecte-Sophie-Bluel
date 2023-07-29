import * as api from "./api.js"; /* import de /api.js sur scriptporfolio.js*/

const allWorks = new Set();

async function init() {
  const works = await api.getDatabaseInfo("works");
  if (works) {
    for (const work of works) {
      allWorks.add(work);
    }
  } else {
    alert("erreur lors du contact avec le serveur");
  }
  displayWorks();  /* Affichage dans la console*/
}
init();

function displayWorks(filter = 0) {
  console.log(allWorks);
}

// Affichage de l'api Works sur l'html
document.body.onload = addElements;
async function addElements() {
  await loadWorks();
  await loadCategories();
}

async function loadWorks() {
  const apiUrl = 'http://localhost:5678/api/works';
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    const contentContainer = document.getElementById("gallery");

    data.forEach(work => {
      const workDiv = document.createElement("div");
      workDiv.innerHTML = `
          <img src="${work.imageUrl}" alt="${work.title}">
          <h2>${work.title}</h2>
          `;
      contentContainer.appendChild(workDiv);
    });
  } catch (error) {
    console.error('Une erreur est survenue lors de la récupération du contenu depuis l\'API des Works:', error);
    alert("erreur lors du contact avec le serveur");
  }
}

const allCat = new Set();

async function initCat() {
  const categories = await api.getDatabaseInfo("categories");
  if (categories) {
    for (const categorie of categories) {
      allCat.add(categorie);
    }
  } else {
    alert("erreur lors du contact avec le serveur categories");
  }
  displayCats();  /* Affichage dans la console*/
}

function displayCats(filter = 0) {
  console.log(allCat);
}

async function loadCategories() {
  const apiUrlCat = 'http://localhost:5678/api/categories';
  try {
    const response = await fetch(apiUrlCat);
    const data = await response.json();

    data.forEach(categorie => allCat.add(categorie));
    // Générer les boutons de filtre pour chaque catégorie
    const categoriesMenu = document.getElementById("categories-menu");
    data.forEach(categorie => {
      const btn = document.createElement("button");
      btn.textContent = categorie.name;
      btn.value = categorie.id; // Utiliser l'id de la catégorie comme valeur du bouton
      btn.addEventListener("click", function () {
        displayWorksByCategory(categorie.id); // Utiliser l'id de la catégorie lors du filtrage
      });
      categoriesMenu.appendChild(btn);
    });
  } catch (error) {
    console.error('Une erreur est survenue lors de la récupération du contenu depuis API des Categories:', error);
    alert("erreur lors du contact avec le serveur");
  }
}

initCat();
// FILTRES //

// Fonction pour filtrer et afficher les works en fonction de la catégorie
function displayWorksByCategory(categoryId) {
  hideOtherContent(categoryId); // Appeler la fonction hideOtherContent pour masquer les contenus associés aux autres catégories

  // ... Votre code pour masquer les contenus associés aux autres catégories ...

  const filteredWorks = Array.from(allWorks).filter((work) => work.categoryId === categoryId);
  console.log(filteredWorks);

  // Obtenez la référence de la section où les works filtrés seront affichés
  const filteredWorksSection = document.getElementById("filtered-works");

  // Videz le contenu de la section avant d'ajouter les works filtrés
  filteredWorksSection.innerHTML = "";

  // Parcourez les works filtrés et créez les éléments HTML correspondants
  filteredWorks.forEach(work => {
    const workDiv = document.createElement("div");
    workDiv.innerHTML = `
      <img src="${work.imageUrl}" alt="${work.title}">
      <h2>${work.title}</h2>
      `;
    filteredWorksSection.appendChild(workDiv);
  });
}

// Fonction pour masquer les contenus associés aux autres catégories
function hideOtherContent(categoryId) {
  const contentContainers = document.querySelectorAll(".content-container");
  contentContainers.forEach(container => {
    if (container.dataset.categoryId !== categoryId) {
      container.style.display = "none";
    } else {
      container.style.display = "block";
    }
  });
}

// Fonction pour afficher le contenu associé à la catégorie sélectionnée

document.body.onload = addElements;
displayCats();






