const portfolio = document.getElementById ("portfolio"); 
console.log(portfolio);
const reponse = fetch ("listelement.json");
const portfolioTableau = reponse.json();

const article = portfolioTableau [0];
const imageElement = document.createElement("img");
imageElement.src = article.image;

const titreElement = document.createElement("figcaption");
titreElement.innerText = titreElement;

const sectionPortfolio = document.querySelector(".portfolio");
sectionportfolio.appendChild(imageElement);
sectionportfolio.appendChild(titreElement);
