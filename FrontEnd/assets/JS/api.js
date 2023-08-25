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
  
  export async function addWork(formData, token) {
    try {
      const response = await fetch('http://localhost:5678/api/works', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (response.ok) {
        return true; // Ajout a réussi
      } else {
        throw new Error('L\'ajout a échoué');
      }
    } catch (error) {
      console.error(error);
      return null; // Erreur lors de la requête
    }
  }
  
  
  // Page Login 

export async function loginUser(email, password) {
  try {
    const response = await fetch("http://localhost:5678/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    return data.token || null;
  } catch (error) {
    console.error("Une erreur s'est produite lors de la connexion :", error);
    throw new Error("Erreur lors de la connexion. Veuillez réessayer plus tard.");
  }
}

export async function fetchProtectedData(token) {
  try {
    const response = await fetch("http://localhost:5678/api/login", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Une erreur s'est produite lors de la récupération des données :", error);
    throw new Error("Erreur lors de la récupération des données. Veuillez réessayer plus tard.");
  }
}
