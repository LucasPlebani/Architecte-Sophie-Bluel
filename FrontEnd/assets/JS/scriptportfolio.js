import * as api from "./api.js";
const allWorks = new Set();
const allCats = new Set();
let modal = {};
let addPhotoModal = {};
const focusableSelector = 'button, a, input, textarea';
let focusables = [];
const token = localStorage.getItem("token");
let moveIcon = null;
let selectedCategoryInModal = "";

async function init() {
  await fetchData("works", allWorks);
  await fetchData("categories", allCats);
  displayWorks();
  if (token) {
    displayAdmin(true);
    setupModals();
    updateCategoryDropdown();
    addWorkListener();
    displayWorksModal();
  } else {
    displayCats();
    displayAdmin(false);
  }
}

async function fetchData(type, set) {
  const data = await api.getDatabaseInfo(type);
  if (!data) {
    alert("Erreur lors du contact avec le serveur");
  } else {
    data.forEach(item => set.add(item));
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

//affichage des travaux 
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
    loginLink.addEventListener("click", function (e) {
      e.preventDefault()
      localStorage.removeItem("token");
      window.location.reload()
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
  deleteIcon.dataset.workId = image.id;
  imageContainer.appendChild(deleteIcon);

  // Créer l'élément moveIcon
  const moveIcon = document.createElement('i');
  moveIcon.className = 'fa-solid fa-arrows-up-down-left-right';
  moveIcon.style.display = 'none'; // Masquer moveIcon par défaut
  imageContainer.appendChild(moveIcon);

  // Gestionnaire d'événement pour afficher moveIcon lorsque survolé
  imageContainer.addEventListener('mouseover', () => {
    moveIcon.style.display = 'block'; // Afficher moveIcon lorsque survolé
  });

  // Gestionnaire d'événement pour masquer moveIcon lorsque non survolé
  imageContainer.addEventListener('mouseout', () => {
    moveIcon.style.display = 'none'; // Masquer moveIcon lorsque non survolé
  });

  const imageElement = document.createElement('img');
  imageElement.src = image.imageUrl;
  imageElement.alt = image.title;

  const editText = document.createElement('p');
  editText.className = 'edit-text';
  editText.textContent = 'éditer';

  imageContainer.appendChild(imageElement);
  imageContainer.appendChild(editText);

  return imageContainer;
}



/// Fonction Supprimé projet  ///
function setDeleteListener() {

  const deleteIcons = document.querySelectorAll('.delete-icon');
  deleteIcons.forEach(deleteIcon => {
    deleteIcon.addEventListener('click', async (e) => {
      const workIdToDelete = e.target.dataset.workId;
      if (workIdToDelete) {
        try {
          const testDel = await api.deleteWork(workIdToDelete, token);
          if (testDel) {
            console.log('Travail supprimé avec succès.');
            // Supprimer de la galerie
            const galleryImage = document.querySelector(`[data-work-id="${workIdToDelete}"]`);
            if (galleryImage) {
              galleryImage.remove();
            }
            // Supprimer de la fenêtre modale
            const modalImage = document.querySelector(`[data-modal-work-id="${workIdToDelete}"]`);
            if (modalImage) {
              const modalGallery = document.querySelector('#modal-gallery');
              modalGallery.removeChild(modalImage);
            }

            for (const work of allWorks) {
              if (work.id == workIdToDelete) {
                allWorks.delete(work);
                break;
              }
            }
            displayWorks();
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
/// Fonction Ajout de projet ///

const VALIDER_BUTTON_COLOR_ACTIVE = "#1D6154";
const VALIDER_BUTTON_COLOR_DEFAULT = "#B3B3B3";
const imageInput = document.getElementById("image");
const titleInput = document.getElementById("title");
const categoryInput = document.getElementById("category");
const validerButton = document.querySelector(".js-valider");
const imagePreview = document.getElementById('image-preview');
const allowedFormats = ["image/png", "image/jpeg"];

// Fonction d'ajout de travail
async function addWorkListener() {
  const submitPhotoButton = document.getElementById("submitPhoto");

  submitPhotoButton.addEventListener("click", function (event) {
    event.preventDefault();
  });

  validerButton.addEventListener("click", async function (event) {
    event.preventDefault();
// Refus de l'ajout de travail if +4MO if pas jpeg/PNG
const formData = new FormData();

if (imageInput.files && imageInput.files[0]) {
  const imageFile = imageInput.files[0];
  const maxSize = 4 * 1024 * 1024; // 4 Mo

  if (imageFile.size > maxSize) {
    alert("L'image est trop grosse. La taille maximale autorisée est de 4 Mo.");
    // Affichez un message d'alerte ou effectuez d'autres actions si nécessaire
    return;
  }

  const allowedFormats = ["image/jpeg", "image/png"]; // Formats autorisés
  if (!allowedFormats.includes(imageFile.type)) {
    alert("Le format de l'image n'est pas autorisé. Seuls les formats PNG et JPEG sont autorisés.");
    // Affichez un message d'alerte ou effectuez d'autres actions si nécessaire
    return;
  }

  formData.append("image", imageFile);
}

formData.append("title", titleInput.value);
formData.append("category", categoryInput.value);

const result = await sendNewProjectToAPI(formData);
if (result.success) {

      const newWork = {
        imageUrl: imagePreview.src,
        title: titleInput.value,
        categoryId: categoryInput.value,
      };
      allWorks.add(newWork);

      // Actualisation de la galerie (à implémenter)
      displayWorks();

      // Ajout de l'image à la galerie modale (à implémenter)
      const modalGallery = document.querySelector("#modal-gallery");
      const imageContainer = createImageContainer(newWork);
      imageContainer.setAttribute("data-modal-work-id", newWork.id);
      modalGallery.appendChild(imageContainer);

      // Affichage de la galerie modale (à implémenter)
      displayWorksModal();

      // Fermez la modale
      closeModal(addPhotoModal);
      closeModal(modal);
    } else {
      // Il y a eu une erreur lors de l'ajout du projet, affichez le message d'erreur
      console.error(result.message);
    }
    // Récupérez la référence à la div blueCadre
const blueCadre = document.querySelector('.blueCadre');

// Ajoutez un gestionnaire d'événements pour le clic sur la div blueCadre
blueCadre.addEventListener('click', () => {
  // Réinitialisez le formulaire d'ajout de projet
  imagePreview.src = '';
  titleInput.value = '';
  categoryInput.value = '';

  // Rouvrez la modal d'ajout de projet
  showModal(openAddPhotoModal);
});

  });
  // Fonction retour console //
  async function sendNewProjectToAPI(formData) {
    try {
      const response = await api.addWork(formData, token);
      if (response && response.success) {
        console.log("Le projet a été ajouté avec succès.");
        return {
          success: true,
          imageUrl: response.imageUrl,
          message: "Le projet a été ajouté avec succès."
        };
      } else {
        console.error("Erreur lors de l'ajout du projet :", response.error);
        return {
          success: false,
          message: "Erreur lors de l'ajout du projet : " + response.error
        };
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout du projet :", error.message);
      return {
        success: false,
        message: "Erreur lors de l'ajout du projet : " + error.message
      };
    }
  }

  // Éviter le rafraîchissement de la page lors de la soumission du formulaire
  const addWorkForm = document.getElementById('addWorkForm');
  addWorkForm.addEventListener("submit", function (event) {
    event.preventDefault();
  });

  // Masquer l'élément imagePreview
  const imageIcon = document.querySelector(".fa-sharp.fa-regular.fa-image");

  imageInput.addEventListener("change", function () {
    if (imageInput.files && imageInput.files[0]) {
      const reader = new FileReader();
      reader.onload = function (e) {
        imagePreview.src = e.target.result;
        imagePreview.style.display = "block";
        imageIcon.style.display = "none";
        imageInput.style.display = "none";
      };

      reader.readAsDataURL(imageInput.files[0]);
    }
  });

  // Éviter le refresh de la page lors de imagePreview
  addWorkForm.addEventListener("submit", function (event) {
    event.preventDefault();
  });

  // Sauvegarde travaux
  window.addEventListener("load", () => {
    const savedWorks = JSON.parse(localStorage.getItem("savedWorks")) || [];
    const gallery = document.getElementById("gallery");

    // Supprimez tous les enfants de la galerie
    while (gallery.firstChild) {
      gallery.removeChild(gallery.firstChild);
    }

    savedWorks.forEach(work => {
      const newImage = document.createElement("img");
      newImage.src = work.imageUrl;
      gallery.appendChild(newImage);
    });
  });
}

// Modification Bouton + changement couleur bouton
const formElements = [imageInput, titleInput, categoryInput];
formElements.forEach(element => {
  element.addEventListener("change", checkFormCompleted);
  element.addEventListener("input", checkFormCompleted);
});
// Vérification si le form est complet 
function checkFormCompleted() {
  const isFormComplete = imageInput.files[0] && titleInput.value && categoryInput.value;
  validerButton.disabled = !isFormComplete;
  validerButton.style.backgroundColor = isFormComplete ? VALIDER_BUTTON_COLOR_ACTIVE : VALIDER_BUTTON_COLOR_DEFAULT;
}

function updateCategoryDropdown() {
  const categoryDropdown = document.getElementById("category");
  categoryDropdown.innerHTML = '';

  // Ajout la première option "Sélectionnez une catégorie"
  const selectOption = document.createElement("option");
  selectOption.value = "";
  selectOption.textContent = "Sélectionnez une catégorie";
  categoryDropdown.appendChild(selectOption);

  allCats.forEach(category => {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.name;
    categoryDropdown.appendChild(option);
  });
}

//Mise à jour catégorie selectionné 
function updateSelectedCategoryDropdown(selectedCategoryId) {
  const categoryDropdown = document.getElementById("category");
  categoryDropdown.value = selectedCategoryId;
}
// Fonction pour mettre à jour le menu déroulant des catégories dans la modal
function updateCategoryDropdownInModal() {
  const categoryDropdownModal = document.getElementById("category-modal");
  const categoryDropdown = document.getElementById("category");
  if (categoryDropdownModal && categoryDropdownModal.style.display !== 'none') {
    categoryDropdownModal.removeEventListener("change", onCategorySelect);
    categoryDropdown.value = categoryDropdownModal.value;
    categoryDropdownModal.addEventListener("change", onCategorySelect);
  }
}
//Mise à jour de la gallery 
function onCategorySelect() {
  const selectedCategoryId = document.getElementById("category").value;
  if (selectedCategoryId !== selectedCategoryInModal) {
    selectedCategoryInModal = selectedCategoryId;
  } else {
    displayWorks(selectedCategoryId);
  }
  updateSelectedCategoryDropdown(selectedCategoryId);
}
updateCategoryDropdown();
document.getElementById("category").addEventListener("change", onCategorySelect);

//Fonction affichage modal
function displayWorksModal() {
  const modalGallery = document.querySelector('#modal-gallery');
  modalGallery.innerHTML = ''; // Effacer le contenu existant

  allWorks.forEach((image) => {
    const imageContainer = createImageContainer(image);
    imageContainer.setAttribute('data-modal-work-id', image.id);
    modalGallery.appendChild(imageContainer);
  });

  setDeleteListener();
  updateCategoryDropdownInModal();
}

// Fonction pour ouvrir la fenêtre modale
function openModal(e, targetModal) {
  e.preventDefault();
  modal = document.querySelector(targetModal);
  focusables = Array.from(modal.querySelectorAll(focusableSelector));
  showModal(modal);
};
// Fonction pour ouvrir la fenêtre modale d'ajout de photo
function openAddPhotoModal(e, targetModal) {
  e.preventDefault();
  addPhotoModal = document.querySelector(targetModal);
  focusables = Array.from(addPhotoModal.querySelectorAll(focusableSelector));
  showModal(addPhotoModal);

  document.addEventListener('click', (event) => {
    if (!addPhotoModal.contains(event.target)) {
      closeModal(addPhotoModal);
    }
  });
  selectedCategoryInModal = document.getElementById("category").value;
}

// Fonction modification affichage élément modal 
function showModal(modalElement) {
  modalElement.style.display = '';
  modalElement.removeAttribute('aria-hidden');
  modalElement.setAttribute('aria-modal', 'true');
  modalElement.addEventListener('click', () => closeModal(modalElement));
  modalElement.querySelector('.js-modal-close').addEventListener('click', () => closeModal(modalElement));
  modalElement.querySelector('.js-modal-stop').addEventListener('click', stopPropagation);
};

//PARTIE FERMETURE MODAL // 
// fonction fermer la modal en cliquant en dehors 
function closeModal(targetModal) {
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
function focusInModal(e, targetModal, focusables) {
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





