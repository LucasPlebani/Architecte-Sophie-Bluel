// apport des api Catégories //
export async function getDatabaseInfo(type){
	const response  = await fetch(`http://localhost:5678/api/${type}`)
	if (response.ok) {
		return response.json()
	} else {
		console.log(response);
		return false;
	}
}

export async function deleteWork(id, token){
	const response = await fetch(`http://localhost:5678/api/works/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
		return true
	  }else{
        throw new Error('La suppression a échoué.');
      }
}
  // Appel API Ajout Photo
  
const addWork = async (event) => {
  event.preventDefault();

  const formData = new FormData(addWorkForm);

  try {
    const response = await fetch('/api/works', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(`Erreur lors de l'ajout du travail: ${errorResponse.message}`);
    } else {
      const addedWork = await response.json();
      if (addedWork) {
        console.log('Nouveau travail ajouté :', addedWork);
      }
    }
  } catch (error) {
    console.error(error);
  }
};
const addWorkForm = document.getElementById('addWorkForm');
addWorkForm.addEventListener('submit', addWork);
  
// Gestionnaires d'événements pour les icônes de suppression
document.querySelectorAll('.delete-icon').forEach(deleteIcon => {
	deleteIcon.addEventListener('click', async (e) => {
		console.log('addEventListener');
	  const workIdToDelete = e.target.getAttribute('data-work-id');
	  if (workIdToDelete) {
		try {
		  await deleteWork(workIdToDelete); // Appeler la fonction de suppression
		  console.log('Travail supprimé avec succès.');
		  
		  // Supprimer l'élément associé au DOM
		  const deletedWorkContainer = document.querySelector(`[data-work-id="${workIdToDelete}"]`);
		  if (deletedWorkContainer) {
			deletedWorkContainer.remove();
		  }
		} catch (error) {
		  console.error('Erreur lors de la suppression :', error);
		}
	  }
	});
  });
  
  