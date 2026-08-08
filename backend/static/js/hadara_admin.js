/* ================================================================
   HADARA ADMIN — Interactive Card Selection JS
   ================================================================ */

document.addEventListener('DOMContentLoaded', function() {
    // Écouter les clics sur les cartes/lignes du tableau
    document.addEventListener('click', function(e) {
        // Trouver la ligne de tableau (tr) ou la carte
        const tr = e.target.closest('.table tbody tr');
        if (!tr) return;

        // Si l'utilisateur clique sur un lien <a> ou un bouton <button> ou directement sur le checkbox, ne pas interférer
        if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' || e.target.closest('a') || e.target.closest('button')) {
            return;
        }

        // Trouver la checkbox dans la ligne
        const checkbox = tr.querySelector('.action-select, input[type="checkbox"]');
        if (checkbox) {
            checkbox.checked = !checkbox.checked;
            // Déclencher l'événement change pour que Jazzmin / Django mette à jour le compteur d'actions
            checkbox.dispatchEvent(new Event('change', { bubbles: true }));
            
            // Appliquer l'effet visuel de sélection
            updateRowHighlight(tr, checkbox.checked);
        }
    });

    // Écouter les changements sur toutes les checkboxes
    document.addEventListener('change', function(e) {
        if (e.target.matches('.action-select, input[type="checkbox"]')) {
            const tr = e.target.closest('.table tbody tr');
            if (tr) {
                updateRowHighlight(tr, e.target.checked);
            }
        }
    });

    function updateRowHighlight(tr, isChecked) {
        if (isChecked) {
            tr.classList.add('selected-card');
            tr.style.border = '2px solid #f59e0b';
            tr.style.background = 'rgba(245, 158, 11, 0.12)';
        } else {
            tr.classList.remove('selected-card');
            tr.style.border = '';
            tr.style.background = '';
        }
    // Forcer tous les liens des Outils et du site public à s'ouvrir dans un NOUVEL ONGLET (_blank)
    // afin de ne JAMAIS quitter la session de l'Admin Django
    function fixExternalLinks() {
        const links = document.querySelectorAll('a[href*="/outils"], a[href*="hadara-design.com"], .nav-sidebar a[href^="http"]');
        links.forEach(function(link) {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        });
    }

    fixExternalLinks();
    // Exécuter également si le DOM change dynamiquement
    setTimeout(fixExternalLinks, 500);
});
