import * as api from "./api.js"; /* import de /api.js sur scriptporfolio.js*/
const allWorks = new Set(); // création du set allWorks 
const allCat = new Set(); // création du set allCat 

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
  addElements();
}
function displayCats() {
  console.log(allCat);
}
init();

// Affichage de l'api Works sur l'html
async function addElements() {
  await loadCategories();

  const tousButton = document.getElementById("tous-input");
  tousButton.addEventListener("click", function () {
    displayWorksByCategory(0); // 0 correspond à l'ID de catégorie pour afficher tous les works
  });

}

async function loadCategories() {
  try {
    const categories = await api.getDatabaseInfo("categories");
    if (categories) {
      for (const categorie of categories) {
        allCat.add(categorie);
        // Générer les boutons de filtre pour chaque catégorie
        const categoriesMenu = document.getElementById("categories-menu");
        const btn = document.createElement("button");
        btn.textContent = categorie.name;
        btn.value = categorie.id; // Utiliser l'id de la catégorie comme valeur du bouton
        btn.addEventListener("click", function () {
          displayWorksByCategory(categorie.id); // Utiliser l'id de la catégorie lors du filtrage
        });
        categoriesMenu.appendChild(btn);
      }
    } else {
      alert("erreur lors du contact avec le serveur categories");
    }
    displayCats(); // Ajouter l'appel à la fonction displayCats ici
  } catch (error) {
    console.error('Une erreur est survenue lors de la récupération du contenu depuis API des Categories:', error);
    alert("erreur lors du contact avec le serveur");
  }
}

// Fonction pour filtrer et afficher les works en fonction de la catégorie
function displayWorksByCategory(categoryId) {
  hideOtherContent(categoryId); // Appeler la fonction hideOtherContent pour masquer les contenus associés aux autres catégories

  const filteredWorks = Array.from(allWorks).filter((work) => {
    if (categoryId === 0) {
      // Si categoryId est 0, afficher tous les works
      return true;
    } else {
      return work.categoryId === categoryId;
    }
  });

  console.log(filteredWorks);

  // Obtenez la référence de la section où les works filtrés seront affichés
  const filteredWorksSection = document.getElementById("gallery");

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
    if (categoryId !== 0 && container.dataset.categoryId !== categoryId) {
      container.style.display = "none";
    } else {
      container.style.display = "block";
    }
  });
}

// Fonction pour afficher le contenu associé à la catégorie sélectionnée
function displayWorks(filter = 0) {
  console.log(allWorks);

  // Affichage de l'api Works sur l'html
  try {
    const gallery = document.getElementById("gallery");

    allWorks.forEach(work => {
      const workDiv = document.createElement("div");
      workDiv.innerHTML = `
          <img src="${work.imageUrl}" alt="${work.title}">
          <h2>${work.title}</h2>
          `;
      gallery.appendChild(workDiv);
    });
  } catch (error) {
    console.error('Une erreur est survenue lors de la récupération du contenu depuis l\'API des Works:', error);
    alert("erreur lors du contact avec le serveur");
  }
}


//modal
let modal = null;
let addPhotoModal = null;
const focusableSelector = 'button, a, input, textarea';
let focusables = [];
const createImageContainer = function (image, isFirst) {
  const imageContainer = document.createElement('div');
  imageContainer.className = 'modal-image-container';
  imageContainer.style.position = 'relative';

  const deleteIcon = document.createElement('i');
  deleteIcon.className = 'fa-solid fa-trash-can delete-icon';
  deleteIcon.style.position = 'absolute';
  deleteIcon.style.top = '0.2';
  deleteIcon.style.right = '0';
  deleteIcon.addEventListener('click', () => deleteWork(image.id)); // Remplacez image.id par l'ID du travail

  imageContainer.appendChild(deleteIcon);

  if (isFirst) {
    const icon = document.createElement('i');
    icon.className = 'fa-solid fa-arrows-up-down-left-right';
    icon.style.position = 'absolute';
    icon.style.top = '1';
    icon.style.right = '0.5';
    imageContainer.appendChild(icon);
  }

  const imageElement = document.createElement('img');
  imageElement.src = image.src;
  imageElement.alt = image.alt;

  const editText = document.createElement('p');
  editText.className = 'edit-text';
  editText.textContent = 'éditer';

  imageContainer.appendChild(imageElement);
  imageContainer.appendChild(editText);

  return imageContainer;
};

// ... le reste du code



const closeModal = function (targetModal) {
  if (targetModal === null) return;
  targetModal.style.display = 'none';
  targetModal.setAttribute('aria-hidden', 'true');
  targetModal.removeAttribute('aria-modal');
  targetModal.removeEventListener('click', () => closeModal(targetModal));
  targetModal.querySelector('.js-modal-close').removeEventListener('click', () => closeModal(targetModal));
  targetModal.querySelector('.js-modal-stop').removeEventListener('click', stopPropagation);

  targetModal = null;
};

const stopPropagation = function (e) {
  e.stopPropagation();
};

const focusInModal = function (e, targetModal, focusables) {
  e.preventDefault();
  let index = focusables.findIndex((f) => f === targetModal.querySelector(':focus'));
  index++;
  if (index >= focusables.length) {
    index = 0;
  }
  focusables[index].focus();
};

const openAddPhotoModal = function (e, targetModal) {
  e.preventDefault();
  addPhotoModal = document.querySelector(targetModal);
  focusables = Array.from(addPhotoModal.querySelectorAll(focusableSelector));
  addPhotoModal.style.display = null;
  addPhotoModal.removeAttribute('aria-hidden');
  addPhotoModal.setAttribute('aria-modal', 'true');
  addPhotoModal.addEventListener('click', () => closeModal(addPhotoModal));
  addPhotoModal.querySelector('.fa-xmark').addEventListener('click', () => closeModal(addPhotoModal));
  addPhotoModal.querySelector('.js-modal-stop').addEventListener('click', stopPropagation);

  document.addEventListener('click', (event) => {
    if (!addPhotoModal.contains(event.target)) {
      closeModal(addPhotoModal);
    }
  });
};

const openModal = function (e, targetModal) {
  e.preventDefault();
  modal = document.querySelector(targetModal);
  focusables = Array.from(modal.querySelectorAll(focusableSelector));
  modal.style.display = null;
  modal.removeAttribute('aria-hidden');
  modal.setAttribute('aria-modal', 'true');
  modal.addEventListener('click', () => closeModal(modal));
  modal.querySelector('.js-modal-close').addEventListener('click', () => closeModal(modal));
  modal.querySelector('.js-modal-stop').addEventListener('click', stopPropagation);

  const addPhotoLink = modal.querySelector('.js-addphoto');
  addPhotoLink.addEventListener('click', (e) => openAddPhotoModal(e, addPhotoLink.getAttribute('href')));

  const modalGallery = modal.querySelector('#modal-gallery');
  modalGallery.innerHTML = '';

  const galleryImages = document.querySelectorAll('#gallery img');

  galleryImages.forEach((image, index) => {
    const imageContainer = createImageContainer(image, index === 0);
    modalGallery.appendChild(imageContainer);
  });
};

document.querySelectorAll('.js-modal').forEach((a) => {
  a.addEventListener('click', (e) => openModal(e, a.getAttribute('href')));
});

window.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' || e.key === 'Esc') {
    closeModal(modal);
    closeModal(addPhotoModal);
  }
  if (e.key === 'Tab' && (modal !== null || addPhotoModal !== null)) {
    focusInModal(e, modal || addPhotoModal, focusables);
  }
});

const deleteWork = async (workId) => {
  try {
    const response = await fetch(`/api/works/${workId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('La suppression a échoué.');
    }

    const deletedWorkContainer = document.querySelector(`[data-work-id="${workId}"]`);
    if (deletedWorkContainer) {
      deletedWorkContainer.remove();
    } else {
      console.log('Élément introuvable dans le DOM.');
    }
  } catch (error) {
    console.error('Erreur lors de la suppression :', error);
  }
};