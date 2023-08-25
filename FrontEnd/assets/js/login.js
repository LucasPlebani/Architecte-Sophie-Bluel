import * as api from "./api.js";

document.addEventListener("DOMContentLoaded", function () {
  const emailInput = document.getElementById("e-mail");
  const passwordInput = document.getElementById("motdepasse");
  const loginButton = document.getElementById("seconnecter");

  async function loginOk() {
    const email = emailInput.value;
    const password = passwordInput.value;

    try {
      const token = await api.loginUser(email, password);

      if (token) {
        localStorage.setItem("token", token);
        window.location.href = "../FrontEnd/index.html";
      } else {
        alert("Nom d'utilisateur ou mot de passe incorrect.");
      }
    } catch (error) {
      alert(error.message);
    }
  }

  loginButton.addEventListener("click", loginOk);
});

  