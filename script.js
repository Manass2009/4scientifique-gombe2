let currentUser = "";
let isAdmin = false;

const listeCours = [
    "Algèbre", "Analyse", "Géométrie", "Physique", 
    "Chimie", "Français", "Anglais", "Religion / ECM", 
    "Dessin Scientifique", "EPS", "Géographie", "Histoire"
];

document.addEventListener("DOMContentLoaded", () => {
    let savedUser = localStorage.getItem("user_classe");
    let savedAdmin = localStorage.getItem("is_admin_classe");
    
    if (savedAdmin === "true") isAdmin = true;

    if (savedUser) {
        currentUser = savedUser;
        afficherSite();
    }

    remplirSelectCours();
    initialiserCarrésCours();
    chargerDonnees();
});

function validerInscriptionSimple() {
    let name = document.getElementById("user-fullname").value.trim();
    let phone = document.getElementById("user-phone").value.trim();

    if (!name || !phone) {
        alert("S'il te plaît, entre ton Nom/Prénom et ton numéro de téléphone.");
        return;
    }

    currentUser = name;
    localStorage.setItem("user_classe", name);
    enregistrerMembre({ name, phone, mode: "Formulaire" });
    afficherSite();
}

function inscrireGoogleRapide() {
    let name = prompt("Entre ton Nom complet pour le compte Google :");
    if (name) {
        currentUser = name + " (Google)";
        localStorage.setItem("user_classe", currentUser);
        enregistrerMembre({ name: currentUser, phone: "Compte Google", mode: "Google" });
        afficherSite();
    }
}

function demanderAccèsAdmin() {
    let code = prompt("Mot de passe Administrateur (Manassé) :");
    if (code === "1234") {
        isAdmin = true;
        currentUser = "MANASSÉ NTAMBWA (Admin)";
        localStorage.setItem("user_classe", currentUser);
        localStorage.setItem("is_admin_classe", "true");
        afficherSite();
        alert("Accès Administrateur accordé !");
    } else {
        alert("Mot de passe incorrect !");
    }
}

function afficherSite() {
    document.getElementById("auth-screen").style.display = "none";
    document.getElementById("main-site").style.display = "block";
    document.getElementById("display-user").innerText = "👤 " + currentUser;

    if (isAdmin) {
        document.getElementById("admin-indicator").style.display = "inline-block";
        document.getElementById("tab-admin-btn").style.display = "inline-block";
        document.getElementById("admin-panel-news").style.display = "block";
        document.getElementById("admin-panel-docs").style.display = "block";
        document.getElementById("admin-panel-photo").style.display = "block";
    }
}

function changerOnglet(ongletId) {
    document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
    document.querySelectorAll(".tab-btn").forEach(el => el.classList.remove("active"));

    document.getElementById(`tab-${ongletId}`).classList.add("active");
    event.currentTarget.classList.add("active");
}

function deconnexion() {
    localStorage.removeItem("user_classe");
    localStorage.removeItem("is_admin_classe");
    location.reload();
}

function enregistrerMembre(membreObj) {
    let membres = JSON.parse(localStorage.getItem("membres_classe_v2") || "[]");
    membres.push(membreObj);
    localStorage.setItem("membres_classe_v2", JSON.stringify(membres));
}

function remplirSelectCours() {
    let select = document.getElementById("course-select");
    select.innerHTML = listeCours.map(c => `<option value="${c}">${c}</option>`).join("");
}

function initialiserCarrésCours() {
    let grid = document.getElementById("courses-grid");
    grid.innerHTML = listeCours.map(cours => `
        <div class="course-square">
            <h3>📖 ${cours}</h3>
            <div id="list-${cours.replace(/[^a-zA-Z]/g, "")}" style="font-size:10px; margin-top:5px; color:#94a3b8;">
                Aucun document
            </div>
        </div>
    `).join("");
}

function publierActualite() {
    if (!isAdmin) return;
    let title = document.getElementById("news-title").value.trim();
    let body = document.getElementById("news-body").value.trim();
    if (!title || !body) return;

    let news = JSON.parse(localStorage.getItem("actualites_classe") || "[]");
    news.unshift({ title, body, date: new Date().toLocaleDateString('fr-FR') });
    localStorage.setItem("actualites_classe", JSON.stringify(news));

    document.getElementById("news-title").value = "";
    document.getElementById("news-body").value = "";
    chargerDonnees();
}

function ajouterDocument() {
    if (!isAdmin) return;
    let cours = document.getElementById("course-select").value;
    let title = document.getElementById("doc-title").value.trim();
    let link = document.getElementById("doc-link").value.trim();
    if (!title) return;

    let docs = JSON.parse(localStorage.getItem("docs_classe") || "[]");
    docs.push({ cours, title, link: link || "#" });
    localStorage.setItem("docs_classe", JSON.stringify(docs));

    document.getElementById("doc-title").value = "";
    document.getElementById("doc-link").value = "";
    chargerDonnees();
}

function ajouterPhoto() {
    if (!isAdmin) return;
    let title = document.getElementById("img-title").value.trim();
    let url = document.getElementById("img-url").value.trim();
    if (!url) return;

    let photos = JSON.parse(localStorage.getItem("photos_classe") || "[]");
    photos.unshift({ title: title || "Photo de classe", url });
    localStorage.setItem("photos_classe", JSON.stringify(photos));

    document.getElementById("img-title").value = "";
    document.getElementById("img-url").value = "";
    chargerDonnees();
}

function chargerDonnees() {
    // Communiqués
    let news = JSON.parse(localStorage.getItem("actualites_classe") || "[]");
    let feed = document.getElementById("news-feed");
    feed.innerHTML = news.length === 0 ? `<p style="color:#64748b; font-size:12px;">Aucun communiqué actuellement.</p>` :
        news.map(n => `<div class="feed-item"><h4>📌 ${n.title}</h4><p>${n.body}</p><span style="font-size:10px; color:#94a3b8;">${n.date}</span></div>`).join("");

    // Galerie
    let photos = JSON.parse(localStorage.getItem("photos_classe") || "[]");
    let gallery = document.getElementById("gallery-grid");
    gallery.innerHTML = photos.length === 0 ? `<p style="color:#64748b; font-size:12px;">Aucune photo dans la galerie.</p>` :
        photos.map(p => `<div class="gallery-card"><img src="${p.url}" onerror="this.src='mon_profil.jpg'"><p>${p.title}</p></div>`).join("");

    // Cours
    let docs = JSON.parse(localStorage.getItem("docs_classe") || "[]");
    listeCours.forEach(cours => {
        let cleanId = cours.replace(/[^a-zA-Z]/g, "");
        let container = document.getElementById(`list-${cleanId}`);
        let filtered = docs.filter(d => d.cours === cours);
        if (container && filtered.length > 0) {
            container.innerHTML = filtered.map(d => `
                <p style="margin-top:2px;"><a href="${d.link}" target="_blank" style="color:#0284c7; font-weight:bold; text-decoration:none;">📄 ${d.title}</a></p>
            `).join("");
        }
    });

    // Tableau Membres pour l'Admin
    let membres = JSON.parse(localStorage.getItem("membres_classe_v2") || "[]");
    let table = document.getElementById("admin-members-table");
    table.innerHTML = membres.length === 0 ? `<tr><td colspan="3">Aucun élève inscrit pour l'instant.</td></tr>` :
        membres.map(m => `<tr><td>${m.name}</td><td>${m.phone}</td><td>${m.mode}</td></tr>`).join("");
}

