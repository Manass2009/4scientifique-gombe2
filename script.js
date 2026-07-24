document.addEventListener("DOMContentLoaded", () => {
    fetch('actualites.json')
        .then(response => response.json())
        .then(data => {
            if (!data || data.length === 0) return;

            // La dernière actualité (la plus récente)
            const derniereActu = data[0];
            const conteneurAccueil = document.getElementById("actu-principale");

            if (conteneurAccueil) {
                let htmlContent = `<h4>${derniereActu.titre}</h4>`;
                if (derniereActu.type === "video") {
                    htmlContent += `
                        <video controls autoplay muted loop style="width: 100%; max-width: 400px; border-radius: 12px; margin-top: 10px;">
                            <source src="${derniereActu.fichier}" type="video/mp4">
                        </video>`;
                } else if (derniereActu.type === "image") {
                    htmlContent += `
                        <img src="${derniereActu.fichier}" style="width: 100%; max-width: 400px; border-radius: 12px; margin-top: 10px;">`;
                }
                conteneurAccueil.innerHTML = htmlContent;
            }
        })
        .catch(err => console.error("Erreur chargement actualités:", err));
});
