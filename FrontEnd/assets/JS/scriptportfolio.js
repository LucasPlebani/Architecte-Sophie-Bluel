import * as api from "./api.js"; /* import de /api.js sur scriptporfolio.js*/
const allWorks = new Set(); // création du set allWorks 
const allCats = new Set(); // création du set allCat 
let modal = {}; // fenetre modale 
let addPhotoModal = {}; // fenetre modale ajout photo
const focusableSelector = 'button, a, input, textarea'; // Sélecteur pour les éléments focusables dans la fenêtre modale
let focusables = []; // Tableau pour stocker les éléments focusables dans la fenêtre modale
const token = localStorage.getItem("token")
let moveIcon = null;

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
    displayAdmin(true);
    displayWorksModal();
    setupModals(); 
    updateCategoryDropdown()
  } else {
   displayCats();
   displayAdmin(false);
  }
}
init();
// function affichage Admin / user 
function displayAdmin(isAdminLoggedIn) {

  const adminBar = document.querySelector('.black-bar');
  const adminModificationElements = document.querySelectorAll('.admin-modification');
  const tousButton = document.getElementById('tous-input');
  
  if (isAdminLoggedIn) {
    adminBar.style.visibility = 'visible';
    adminModificationElements.forEach(element => {
 
      element.style.visibility = 'visible';
    });
    tousButton.style.visibility = 'hidden';
  } else {
    adminBar.style.visibility = 'hidden';
    adminModificationElements.forEach(element => {
      element.style.visibility = 'hidden';
    });
    tousButton.style.visibility = 'visible';
  }
}


// Affichage Catégorie
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
// boutton login/logout 
function logButton() {
  const loginLink = document.getElementById("loginLink");
  const token = localStorage.getItem("token");

  if (token) {
    loginLink.textContent = "logout";
    loginLink.addEventListener("click", function () {
      localStorage.removeItem("token");
    });
  } else {
    // Utilisateur non connecté : laissez le texte du lien comme "login"
  }
}

document.addEventListener("DOMContentLoaded", logButton);


//modal
// CRÉATION DE LA PREMIERE MODAL // 
// Fonction pour créer un conteneur d'image
function createImageContainer(image) {
  const imageContainer = document.createElement('figure');
  imageContainer.className = 'modal-image-container';

  const deleteIcon = document.createElement('i');
  deleteIcon.className = 'fa-solid fa-trash-can delete-icon';
  deleteIcon.dataset.workId = image.id
  imageContainer.appendChild(deleteIcon);
  
  // Fonction MoveIcon modal hover 
  

  const addMoveIcon = () => {
    if (!moveIcon) {
      moveIcon = document.createElement('i');
      moveIcon.className = 'fa-solid fa-arrows-up-down-left-right';
      imageElement.insertAdjacentElement('afterend', moveIcon);
    }
  };

  const removeMoveIcon = () => {
    if (moveIcon) {
      moveIcon.remove();
      moveIcon = null;
    }
  };

  imageContainer.addEventListener('mouseover', addMoveIcon);
  imageContainer.addEventListener('mouseout', removeMoveIcon);

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
  // Fonction Delete work
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
// Fonction pour gérer l'ajout d'une nouvelle œuvre
async function addWorkListener() {
  const addWorkForm = document.getElementById('addWorkForm');
  const imagePreview = document.getElementById('image-preview');
  const submitPhotoButton = document.getElementById("submitPhoto");
  const imageInput = document.getElementById("image");
  const titleInput = document.getElementById("title");
  const categoryInput = document.getElementById("category");
  const validerButton = document.querySelector(".js-valider"); // Sélectionner le bouton "Valider"

  submitPhotoButton.addEventListener("click", function(event) {
      event.preventDefault(); // Empêcher le comportement par défaut du clic sur le bouton
  });

  validerButton.addEventListener("click", async function(event) {
    event.preventDefault();

    const formData = new FormData();

    if (imageInput.files && imageInput.files[0]) {
      formData.append("image", imageInput.files[0]);
    }

    formData.append("title", titleInput.value);
    formData.append("category", categoryInput.value);

    try {
      const response = await api.addWork(formData, token);
      if (response) {
        // Le travail a été ajouté avec succès
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du travail :', error);
    }
  });

  imageInput.addEventListener("change", function () {
      if (imageInput.files && imageInput.files[0]) {
          const reader = new FileReader();

          reader.onload = function (e) {
              imagePreview.src = e.target.result;
              imagePreview.style.display = "block";
          };

          reader.readAsDataURL(imageInput.files[0]);
      }
  });
}

// Appeler la fonction pour activer l'écouteur d'événement
addWorkListener();

// Fonction pour mettre à jour les options du menu déroulant des catégories
function updateCategoryDropdown() {
  const categoryDropdown = document.getElementById("category");

  // Supprimez toutes les options existantes
  categoryDropdown.innerHTML = '<option value="0">Tous</option>';

  // Ajoutez les nouvelles options basées sur les catégories de l'API
  allCats.forEach(category => {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.name;
    categoryDropdown.appendChild(option);
  });
}

// Fonction à appeler lorsqu'une catégorie est sélectionnée
function onCategorySelect() {
  // Mettez à jour l'affichage en fonction de la catégorie sélectionnée
  const selectedCategoryId = document.getElementById("category").value;
  displayWorks(selectedCategoryId); // Appel de la fonction qui affiche les œuvres en fonction de la catégorie sélectionnée
}

// Appelez la fonction pour mettre à jour les options du menu déroulant
updateCategoryDropdown();

// Ajoutez un écouteur d'événement pour gérer les changements de catégorie
document.getElementById("category").addEventListener("change", onCategorySelect);







//Fonction affichage modal
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
// Fonction pour ouvrir la fenêtre modale d'ajout de photo
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
addWorkListener();
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





