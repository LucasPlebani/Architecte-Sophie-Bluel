import * as api from "./api.js"; /* import de /api.js sur scriptporfolio.js*/
const allWorks = new Set(); // création du set allWorks 
const allCats = new Set(); // création du set allCat 
let modal = null; // fenetre modale 
let addPhotoModal = null; // fenetre modale ajout photo
const focusableSelector = 'button, a, input, textarea'; // Sélecteur pour les éléments focusables dans la fenêtre modale
let focusables = []; // Tableau pour stocker les éléments focusables dans la fenêtre modale
const token = localStorage.getItem("token")

async function init() {
  const works = await api.getDatabaseInfo("works");
  if (works) {
    for (const work of works) {
      allWorks.add(work);
    }
  } else {
    alert("erreur lors du contact avec le serveur");
  }
  const cats = await api.getDatabaseInfo("categories");
  if (cats) {
    for (const cat of cats) {
      allCats.add(cat);
    }
  } else {
    alert("erreur lors du contact avec le serveur");
  }
  displayWorks();  /* Affichage dans la console*/
  if(token){
    displayAdmin();
    displayWorksModal();
    setupModals();
  } else {
    displayCats();
  }
}
init();

function displayAdmin(){

}

function displayCats() {
  const tousButton = document.getElementById("tous-input");
  tousButton.addEventListener("click", function () {
    displayWorks();
  });
  for (const categorie of allCats) {
    // Générer les boutons de filtre pour chaque catégorie
    const categoriesMenu = document.getElementById("categories-menu");
    const btn = document.createElement("button");
    btn.textContent = categorie.name;
    btn.value = categorie.id; //id de la catégorie comme valeur du bouton
    btn.addEventListener("click", function () {
      displayWorks(categorie.id); //id de la catégorie lors du filtrage
    });
    categoriesMenu.appendChild(btn);
  }
}


function displayWorks(filter = 0) {
  let selectedWorks = allWorks;

  if (filter !== 0) {
    selectedWorks = [...allWorks].filter(work => work.categoryId == filter);
  }

  try {
    const gallery = document.getElementById("gallery");
    gallery.innerHTML = "";

    selectedWorks.forEach(work => {
      const workDiv = document.createElement("figure");
      workDiv.innerHTML = `
      <img src="${work.imageUrl}" alt="${work.title}">
      <figcaption>${work.title}</figcaption>
    `;
      gallery.appendChild(workDiv);
    });
  } catch (error) {
    console.error('Une erreur est survenue lors de la récupération du contenu depuis l\'API des Works:', error);
    alert("Erreur lors du contact avec le serveur");
  }
}
//modal
// CRÉATION DE LA PREMIERE MODAL // 
// Fonction pour créer un conteneur d'image
function createImageContainer(image) {
  const imageContainer = document.createElement('div');
  imageContainer.className = 'modal-image-container';

  const deleteIcon = document.createElement('i');
  deleteIcon.className = 'fa-solid fa-trash-can delete-icon';
  deleteIcon.dataset.workId = image.id
  imageContainer.appendChild(deleteIcon);
  // (id === 0 ) pour l'affichage arrow que sur le 1er élément 
  if (image.id === 1) {
    const moveIcon = document.createElement('i')
    moveIcon.className = 'fa-solid fa-arrows-up-down-left-right'
    imageContainer.appendChild(moveIcon);
  }

  const imageElement = document.createElement('img');
  imageElement.src = image.imageUrl;
  imageElement.alt = image.title;

  const editText = document.createElement('p');
  editText.className = 'edit-text';
  editText.textContent = 'éditer';

  imageContainer.appendChild(imageElement);
  imageContainer.appendChild(editText);

  return imageContainer;
};

function setDeleteListener() {
  // Fonction Icon delete (poubelle)
  const deleteIcons = document.querySelectorAll('.delete-icon');
  deleteIcons.forEach(deleteIcon => {
    deleteIcon.addEventListener('click', async (e) => {
      const workIdToDelete = e.target.dataset.workId;
      if (workIdToDelete) {
        try {
          const testDel = await api.deleteWork(workIdToDelete, token);
          if (testDel) {
            console.log('Travail supprimé avec succès.');
            for (const work of allWorks) {
              if (work.id == workIdToDelete) {
                allWorks.remove(work)
                break
              }
              displayWorks()
              displayWorksModal()            }
            //retrait work de allWorks + displayWork & displayWorksModal
          }
        } catch (error) {
          console.error('Erreur lors de la suppression :', error);
        }
      }
    });
  });
  const addPhotoLink = document.querySelector('.js-addphoto');
  addPhotoLink.addEventListener('click', (e) => openAddPhotoModal(e, addPhotoLink.getAttribute('href')));


}

function displayWorksModal() {
  const modalGallery = document.querySelector('#modal-gallery');
  modalGallery.innerHTML = '';
  allWorks.forEach((image) => {
    const imageContainer = createImageContainer(image);
    modalGallery.appendChild(imageContainer);
  });
  setDeleteListener()
}
// Fonction pour ouvrir la fenêtre modale
function openModal(e, targetModal) {
  e.preventDefault();
  modal = document.querySelector(targetModal);
  focusables = Array.from(modal.querySelectorAll(focusableSelector));
  showModal(modal);
};

function openAddPhotoModal (e, targetModal)  {
  e.preventDefault();
  addPhotoModal = document.querySelector(targetModal);
  focusables = Array.from(addPhotoModal.querySelectorAll(focusableSelector));
  showModal(addPhotoModal);

  document.addEventListener('click', (event) => {
    if (!addPhotoModal.contains(event.target)) {
      closeModal(addPhotoModal);
    }
  });

};
// Fonction affichage modal 
function showModal (modalElement) {
  modalElement.style.display = null;
  modalElement.removeAttribute('aria-hidden');
  modalElement.setAttribute('aria-modal', 'true');
  modalElement.addEventListener('click', () => closeModal(modalElement));
  modalElement.querySelector('.js-modal-close').addEventListener('click', () => closeModal(modalElement));
  modalElement.querySelector('.js-modal-stop').addEventListener('click', stopPropagation);
};


//PARTIE FERMETURE MODAL // 


// fonction fermer la modal en cliquant en dehors 
function closeModal  (targetModal)  {
  if (targetModal === null) return;
  targetModal.style.display = 'none';
  targetModal.setAttribute('aria-hidden', 'true');
  targetModal.removeAttribute('aria-modal');
  targetModal.removeEventListener('click', () => closeModal(targetModal));
  targetModal.querySelector('.js-modal-close').removeEventListener('click', () => closeModal(targetModal));
  targetModal.querySelector('.js-modal-stop').removeEventListener('click', stopPropagation);
  targetModal = null;
};

const stopPropagation = (e) => {
  e.stopPropagation();
};
// focus dans la modal 
function focusInModal  (e, targetModal, focusables)  {
  e.preventDefault();
  let index = focusables.findIndex((f) => f === targetModal.querySelector(':focus'));
  index++;
  if (index >= focusables.length) {
    index = 0;
  }
  focusables[index].focus();
};
// interraction modal
function setupModals() {
  document.querySelectorAll('.js-modal').forEach((a) => {
    a.addEventListener('click', (e) => openModal(e, a.getAttribute('href')));
  });
  //utilisation clavier modal 
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'Esc') {
      closeModal(modal);
      closeModal(addPhotoModal);
    }
    if (e.key === 'Tab' && (modal !== null || addPhotoModal !== null)) {
      focusInModal(e, modal || addPhotoModal, focusables);
    }
  });
  // arrow retour modal 2 à 1 
  document.querySelector('.js-modal-return').addEventListener('click', (e) => {
    e.preventDefault();
    closeModal(addPhotoModal);
  });
};





