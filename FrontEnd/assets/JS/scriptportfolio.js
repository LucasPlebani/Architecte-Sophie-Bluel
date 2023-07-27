import * as api from "./api.js"; /* import de /api.js sur scriptporfolio.js*/

const allWorks = new Set();
const allCat = new Set();

async function init() {
    const works = await api.getDatabaseInfo("works")
    if (works) {
        for (const work of works) {
            allWorks.add(work)
        }
    } else {
        alert("erreur lors du contact avec le serveur")
    }
    displayWorks()  /* Affichage dans la console*/
}
init()

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
    
    async function loadCategories() {
      const apiUrlCat = 'http://localhost:5678/api/categories';
      try {
        const response = await fetch(apiUrlCat);
        const data = await response.json();
        const contentContainer = document.getElementById("categories-menu");
    
        data.forEach(categorie => {
          const categorieUl = document.createElement("ul");
          categorieUl.innerHTML = `
            <li>${categorie.name}</li>
            `;
            contentContainer.appendChild(categorieUl);
          });
        } catch (error) {
          console.error('Une erreur est survenue lors de la récupération du contenu depuis l\'API des Categories:', error);
          alert("erreur lors du contact avec le serveur");
        }
      }

      // FILTRES //

     //objet Set 