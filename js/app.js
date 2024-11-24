let tabCategorie = [];
let tabMots = [];
let motADeviner = "";
let discover = 0;
let essai = 0;


//TODO faire un SVG avec Inkscape


let selectOption = document.getElementById("categorie");

selectOption.addEventListener("change", genererMot);

manipImage();

await recuperationListe();

async function recuperationListe() {
    await fetch('https://trouve-mot.fr/api/random/50')
        .then(reponse => reponse.json())
        .then(mot => {
            trierCategorie(mot);
        });
}

async function trierCategorie(json) {
    let etat;
    tabMots = json;

    for (let i = 0; i < json.length; i++) { //parcours le tableau des mots JSON
        etat = 0;
        for (let y = 0; y <= tabCategorie.length; y++) {
            if (tabCategorie.length === 0) {
                etat = 1;
                tabCategorie.push(json[i].categorie);
                y = tabCategorie.length;
            }
            if (tabCategorie[y] === json[i].categorie) {
                etat = 1;
                y = tabCategorie.length;
            }
            if (y === tabCategorie.length && etat === 0) {
                tabCategorie.push(json[i].categorie);
                y = tabCategorie.length;
            }
        }
    }
    tabCategorie.sort();
    listerCategorie();
}

function listerCategorie() {
    let select = document.getElementById("categorie");
    let option = document.createElement("option");


    for (let i = 0; i < tabCategorie.length; i++) {
        let cloneOption = option.cloneNode();

        cloneOption.setAttribute("value", tabCategorie[i]);
        cloneOption.textContent = tabCategorie[i];
        select.appendChild(cloneOption);
    }
}

async function genererMot(event) {
    motADeviner = "";

    for (let i = 0; i < tabMots.length; i++) {

        if (event.target.value === tabMots[i].categorie) { //vérification correspondance entre la lettre saisie et la lettre dans le mot
            motADeviner = tabMots[i].name;
            i = tabMots.length;
        }
    }

    essai = 0;
    for (let i = 0; i < clavier.children.length; i++) { //reinitialisation du clavier
        clavier.children[i].classList.remove("bg-danger");
    }
    affichageMot(motADeviner);
}

function affichageMot(mot) {
    motADeviner = mot.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); //normalisation du texte
    motADeviner = motADeviner.toUpperCase();

    let emplacement = document.getElementById("mot");
    let clavier = document.getElementById("clavier");
    let lettres = document.createElement("div");
    let categorie = document.getElementById("categorie").blur();

    suppr(); //suppression du mot precedent

    lettres.classList.add("fs-1", "text-white", "me-3", "border-bottom", "border-4", "border-black", "user-select-none");

    for (let i = 0; i < motADeviner.length; i++) {
        let cloneLettres = lettres.cloneNode();

        cloneLettres.textContent = "...";
        emplacement.appendChild(cloneLettres);
    }

    for (let i = 0; i < clavier.children.length; i++) { //reactivation des touches du clavier
        clavier.addEventListener("click", choixLettre);
    }
    document.addEventListener("keydown", choixLettre);
}

async function suppr() {
    let emplacement = document.getElementById("mot");
    let nbEnfant = emplacement.childElementCount;

    if (nbEnfant !== 0) {
        for (let i = 0; i <= nbEnfant; i++) {
            emplacement.firstChild.remove();
        }
    }
}

function choixLettre(event) {
    let appuiTouche;
    let tentative = 0;

    let emplacement = document.getElementById("mot");

    if (event.type === "click") { //Si on clique sur une lettre
        appuiTouche = event.target.innerText;
        event.target.classList.add("bg-danger");
        event.target.setAttribute("disabled", "");
    }
    if (event.type === "keydown") { //Si on saisie une lettre au clavier
        appuiTouche = event.key.toUpperCase();

        for (let i = 0; i < clavier.children.length; i++) { //Rend la touche saisie inutilisable

            if (appuiTouche === clavier.children[i].textContent && clavier.children[i].getAttribute("disabled") === "") {
                appuiTouche = "";
                tentative = 1;
            }

            if (appuiTouche === clavier.children[i].textContent) {
                clavier.children[i].classList.add("bg-danger");
                clavier.children[i].setAttribute("disabled", "");
            }
        }
    }

    for (let i = 0; i < motADeviner.length; i++) { //Affiche la lettre si OK
        if (motADeviner[i] === appuiTouche) {
            emplacement.children[i].textContent = motADeviner[i];
            emplacement.children[i].classList.remove("text-white", "border-bottom");
            discover += 1;
            tentative = 1;
        }
    }
    let listeCategorie = document.getElementById("categorie");
    listeCategorie.setAttribute("disabled", "");

    if (discover === motADeviner.length) { //si le mot a été decouvert
        rechargementPage(1);
    }
    if (tentative === 0) { //incrémentation des tentatives loupés
        calculEssai(1);
    }
}

function calculEssai(tentatives) {
    let essais = document.getElementById("essai");

    let clavier = document.getElementById("clavier");

    if (essai <= 8) {
        essai += tentatives;
    }

    essais.textContent = `Erreur ${essai} / 8`;

    manipImage(essai);

    if (essai === 9) {
        for (let i = 0; i <= clavier.childElementCount; i++) {
            clavier.children[i].setAttribute("disabled", "");
            clavier.removeEventListener("click", choixLettre);
            return rechargementPage(2);
        };
    }
}

function rechargementPage(state) {
    let essais = document.getElementById("essai");
    let emplacement = document.getElementById("mot");

    for (let i = 0; i < motADeviner.length; i++) {
        emplacement.children[i].textContent = motADeviner[i];
        emplacement.children[i].classList.remove("text-white", "border-bottom");
    };

    if (state === 1) {
        essais.classList.add('btn', 'btn-outline-success');
    }
    if (state === 2) {
        essais.classList.add('btn', 'btn-outline-danger');
    }
    essais.classList.remove("bg-secondary");
    essais.textContent = "Recommencer";

    essais.addEventListener("click", () => { location.reload() });
    document.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            location.reload();

        }
    })
    return
}

async function manipImage(essai) {
    let svg = document.getElementById("dessin");
    let imgPendu = svg.contentDocument; //Récupére le contenue du SVG

    if (essai > 0) {
        svg.contentDocument.getElementById(essai).setAttribute("display", "block");
    }
};