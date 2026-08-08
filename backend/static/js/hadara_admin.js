/* ================================================================
   HADARA ADMIN — Interactive Card Selection & UX Polish JS
   ================================================================ */

document.addEventListener('DOMContentLoaded', function() {
    // Écouter les clics sur les cartes/lignes du tableau
    document.addEventListener('click', function(e) {
        const tr = e.target.closest('.table tbody tr');
        if (!tr) return;

        if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' || e.target.closest('a') || e.target.closest('button')) {
            return;
        }

        const checkbox = tr.querySelector('.action-select, input[type="checkbox"]');
        if (checkbox) {
            checkbox.checked = !checkbox.checked;
            checkbox.dispatchEvent(new Event('change', { bubbles: true }));
            updateRowHighlight(tr, checkbox.checked);
        }
    });

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
    }

    // 1. Placeholder explicite pour la barre de recherche
    const searchInput = document.querySelector('#toolbar input[name="q"], #changelist-search input[name="q"], .search-container input');
    if (searchInput) {
        searchInput.placeholder = "🔎 Rechercher un projet, client, produit ou modèle...";
    }

    // 2. Custom Empty State quand 0 élément présent
    const emptyRows = document.querySelectorAll('.table tbody tr');
    if (emptyRows.length === 1) {
        const firstTd = emptyRows[0].querySelector('td');
        if (firstTd && (firstTd.textContent.includes('0 ') || firstTd.textContent.includes('Aucun') || firstTd.textContent.includes('No ') || firstTd.getAttribute('colspan'))) {
            firstTd.innerHTML = `
                <div style="padding: 2.5rem 1rem; text-align: center;">
                    <div style="font-size: 2.5rem; margin-bottom: 0.5rem; opacity: 0.85;">📂</div>
                    <h4 style="color: #f59e0b; font-size: 1.1rem; font-weight: 700; margin-bottom: 0.35rem;">Aucun élément pour le moment</h4>
                    <p style="color: #94a3b8; font-size: 0.88rem; margin: 0;">Les nouvelles entrées enregistrées apparaîtront automatiquement dans Hadara Manager.</p>
                </div>
            `;
        }
    }

    // 3. Forcer l'ouverture externe des liens du site public
    function fixExternalLinks() {
        const links = document.querySelectorAll('a[href*="/outils"], a[href*="hadara-design.com"], .nav-sidebar a[href^="http"]');
        links.forEach(function(link) {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        });
    }

    fixExternalLinks();
    setTimeout(fixExternalLinks, 500);
});
