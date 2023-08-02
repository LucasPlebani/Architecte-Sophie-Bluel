document.addEventListener("DOMContentLoaded", function () {
    const emailInput = document.getElementById("e-mail");
    const passwordInput = document.getElementById("motdepasse");
    const loginButton = document.getElementById("seconnecter");
  
    // Fonction pour gérer la soumission du formulaire de connexion
    async function loginOk() {
      const email = emailInput.value;
      const password = passwordInput.value;
  
      try {
        const response = await fetch("http://localhost:5678/api/users/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });
  
        const data = await response.json();
  
        if (data.token) {
          // Enregistrer le token dans le local storage 
          localStorage.setItem("token", data.token);
  
          // Rediriger vers la page d'accueil si info correctes
          window.location.href = "../FrontEnd/index.html";
        } else {
          // Afficher un message d'erreur si les informations incorrectes
          alert("Nom d'utilisateur ou mot de passe incorrect.");
        }
      } catch (error) {
        console.error("Une erreur s'est produite lors de la connexion :", error);
        alert("Erreur lors de la connexion. Veuillez réessayer plus tard.");
      }
    }
  
    loginButton.addEventListener("click", loginOk);
  });
  
  // Fonction pour récupérer le token depuis le local storage
  function getToken() {
    return localStorage.getItem("token");
  }
  
  // Requête GET à l'API avec le token dans l'en-tête Authorization
  async function fetchProtectedData() {
    const token = getToken();
  
    try {
      const response = await fetch("http://localhost:5678/api/login", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${"token"}`, 
        },
      });
  
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error("Une erreur s'est produite lors de la récupération des données :", error);
    }
  }
  