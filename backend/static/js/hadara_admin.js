/* ================================================================
   HADARA ADMIN — Hadara UI Grammar & Form Enhancements JS
   ================================================================ */

document.addEventListener('DOMContentLoaded', function() {
    // ── 1. Interactivité des cartes/lignes sur mobile & desktop ───────
    document.addEventListener('click', function(e) {
        const tr = e.target.closest('.table tbody tr');
        if (!tr) return;

        // Ignore clicks on links, buttons, or text inputs
        if (e.target.closest('a') || e.target.closest('button') || (e.target.tagName === 'INPUT' && e.target.type !== 'checkbox')) {
            return;
        }

        const checkbox = tr.querySelector('.action-select, input[type="checkbox"]');
        if (!checkbox) return;

        // If clicking on row body (not on checkbox directly), toggle checkbox
        if (e.target !== checkbox && !e.target.closest('.action-select')) {
            checkbox.checked = !checkbox.checked;
            checkbox.dispatchEvent(new Event('change', { bubbles: true }));
        }

        updateRowHighlight(tr, checkbox.checked);
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
            tr.style.border = '2px solid #D0A21C';
            tr.style.background = 'rgba(208, 162, 28, 0.12)';
        } else {
            tr.classList.remove('selected-card');
            tr.style.border = '';
            tr.style.background = '';
        }
    }

    // ── 2. Placeholder explicite pour la barre de recherche ─────────
    const searchInput = document.querySelector('#toolbar input[name="q"], #changelist-search input[name="q"], .search-container input');
    if (searchInput) {
        searchInput.placeholder = "🔎 Rechercher un projet, client, produit ou modèle...";
    }

    // ── 3. Custom Empty State quand 0 élément présent ────────────────
    const emptyRows = document.querySelectorAll('.table tbody tr');
    if (emptyRows.length === 1) {
        const firstTd = emptyRows[0].querySelector('td');
        if (firstTd && (firstTd.textContent.includes('0 ') || firstTd.textContent.includes('Aucun') || firstTd.textContent.includes('No ') || firstTd.getAttribute('colspan'))) {
            firstTd.innerHTML = `
                <div style="padding: 2.5rem 1rem; text-align: center;">
                    <div style="font-size: 2.5rem; margin-bottom: 0.5rem; opacity: 0.85;">📂</div>
                    <h4 style="color: #D0A21C; font-size: 1.1rem; font-weight: 700; margin-bottom: 0.35rem;">Aucun élément pour le moment</h4>
                    <p style="color: #A8B0BD; font-size: 0.88rem; margin: 0;">Les nouvelles entrées enregistrées apparaîtront automatiquement dans Hadara Manager.</p>
                </div>
            `;
        }
    }

    // ── 4. HADARA IMAGE & FILE UPLOADER (Dual-Mode: Appareil + URL) ───────────
    const imageFields = document.querySelectorAll('input[name="image_url"], input[name="image"], input[name="previewUrl"], input[name="fileUrl"], textarea[name="image_url"], textarea[name="image"], textarea[name="attachments"], input[name="attachments"]');
    imageFields.forEach(function(field) {
        if (field.dataset.hadaraUploaderInit) return;
        field.dataset.hadaraUploaderInit = "true";

        field.style.cssText = "display: none !important;";

        const container = document.createElement('div');
        container.className = "hadara-uploader-wrapper my-2";
        container.style.cssText = "background: #111827; border: 2px dashed rgba(208, 162, 28, 0.4); border-radius: 14px; padding: 1.25rem; text-align: center;";

        function setFieldValue(url) {
            if (field.name === 'attachments' || field.name === 'deliverable_versions') {
                field.value = JSON.stringify(url ? [url] : []);
            } else {
                field.value = url || '';
            }
        }

        let initialSrc = field.value || '';
        if (field.name === 'attachments' || field.name === 'deliverable_versions') {
            try {
                let parsed = JSON.parse(field.value || '[]');
                if (Array.isArray(parsed) && parsed.length > 0) {
                    initialSrc = typeof parsed[0] === 'string' ? parsed[0] : (parsed[0].previewUrl || parsed[0].fileUrl || '');
                }
            } catch(e) {}
        }

        const previewDiv = document.createElement('div');
        previewDiv.className = "mb-3";
        previewDiv.style.display = initialSrc ? "block" : "none";
        previewDiv.innerHTML = `
            <img src="${initialSrc}" style="max-width: 100%; max-height: 200px; object-fit: contain; border-radius: 10px; border: 1px solid rgba(208,162,28,0.3); margin-bottom: 0.5rem;" />
            <div>
                <span class="badge" style="background: rgba(0,201,167,0.2); color: #00C9A7; border: 1px solid #00C9A7;">✓ Image prête & optimisée</span>
            </div>
        `;

        const btnGroup = document.createElement('div');
        btnGroup.className = "d-flex flex-wrap justify-content-center gap-2";

        // Mode 1: Fichier / Appareil Photo / Mobile
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';

        const deviceBtn = document.createElement('button');
        deviceBtn.type = 'button';
        deviceBtn.className = 'btn btn-outline-warning btn-sm font-weight-bold px-3 py-2 mr-2 my-1';
        deviceBtn.innerHTML = `<i class="fas fa-camera mr-2"></i> 📱 Choisir depuis l'appareil`;
        deviceBtn.addEventListener('click', function(e) { e.preventDefault(); fileInput.click(); });

        // Mode 2: Saisie Lien URL
        const urlBtn = document.createElement('button');
        urlBtn.type = 'button';
        urlBtn.className = 'btn btn-outline-info btn-sm font-weight-bold px-3 py-2 my-1';
        urlBtn.innerHTML = `<i class="fas fa-link mr-2"></i> 🔗 Utiliser un lien d'image`;

        const urlInputBox = document.createElement('div');
        urlInputBox.style.cssText = "display: none; margin-top: 0.75rem; background: #070B18; padding: 0.75rem; border-radius: 10px; border: 1px solid #335A79;";
        urlInputBox.innerHTML = `
            <div class="input-group input-group-sm">
                <input type="text" class="form-control" placeholder="https://exemple.com/image.jpg" value="${initialSrc && initialSrc.startsWith('http') ? initialSrc : ''}" style="background:#111827; color:#F4F1EA; border-color:#335A79;">
                <div class="input-group-append">
                    <button class="btn btn-primary font-weight-bold" type="button" style="background:#D0A21C; border-color:#D0A21C; color:#070B18;">✓ Valider Lien</button>
                </div>
            </div>
        `;

        const urlInput = urlInputBox.querySelector('input');

        // Mode 3: Supprimer l'image
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'btn btn-outline-danger btn-sm font-weight-bold px-3 py-2 my-1 mr-2';
        deleteBtn.innerHTML = `<i class="fas fa-trash mr-2"></i> 🗑️ Supprimer l'image`;
        deleteBtn.addEventListener('click', function(e) {
            e.preventDefault();
            setFieldValue('');
            fileInput.value = '';
            urlInput.value = '';
            const imgEl = previewDiv.querySelector('img');
            if (imgEl) imgEl.src = '';
            previewDiv.style.display = "none";
        });

        urlBtn.addEventListener('click', function() {
            urlInputBox.style.display = urlInputBox.style.display === 'none' ? 'block' : 'none';
        });

        const urlInput = urlInputBox.querySelector('input');
        const urlConfirmBtn = urlInputBox.querySelector('button');

        urlConfirmBtn.addEventListener('click', function() {
            const val = urlInput.value.trim();
            if (val) {
                setFieldValue(val);
                const imgEl = previewDiv.querySelector('img');
                imgEl.src = val;
                previewDiv.style.display = "block";
                urlInputBox.style.display = "none";
            }
        });

        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;

            deviceBtn.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i> Compression WebP...`;

            const reader = new FileReader();
            reader.onload = function(event) {
                const img = new Image();
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    const maxDim = 1600;

                    if (width > maxDim || height > maxDim) {
                        if (width > height) {
                            height = Math.round((height * maxDim) / width);
                            width = maxDim;
                        } else {
                            width = Math.round((width * maxDim) / height);
                            height = maxDim;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    const webpDataUrl = canvas.toDataURL('image/webp', 0.82);
                    setFieldValue(webpDataUrl);

                    const imgEl = previewDiv.querySelector('img');
                    imgEl.src = webpDataUrl;
                    previewDiv.style.display = "block";
                    deviceBtn.innerHTML = `<i class="fas fa-camera mr-2"></i> 📱 Choisir depuis l'appareil`;
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });

        btnGroup.appendChild(deviceBtn);
        btnGroup.appendChild(urlBtn);
        btnGroup.appendChild(deleteBtn);

        container.appendChild(previewDiv);
        container.appendChild(btnGroup);
        container.appendChild(urlInputBox);
        container.appendChild(fileInput);
        field.parentNode.insertBefore(container, field.nextSibling);
    });

    // ── 5. HADARA COLOR PICKER WIDGET ────────────────────────────────
    const colorFields = document.querySelectorAll('input[name="accent_hex"], input[name="preferred_colors"], input[name="avoid_colors"]');
    colorFields.forEach(function(field) {
        if (field.dataset.hadaraColorInit) return;
        field.dataset.hadaraColorInit = "true";

        const wrapper = document.createElement('div');
        wrapper.className = "d-flex align-items-center mt-1";

        const picker = document.createElement('input');
        picker.type = "color";
        picker.value = field.value && field.value.startsWith('#') ? field.value : "#D0A21C";
        picker.style.cssText = "width: 42px; height: 38px; border: none; border-radius: 8px; cursor: pointer; background: transparent; margin-right: 10px;";

        picker.addEventListener('input', function() {
            field.value = picker.value.toUpperCase();
        });

        field.parentNode.insertBefore(wrapper, field);
        wrapper.appendChild(picker);
        wrapper.appendChild(field);
    });

    // ── 6. HADARA CHIPS WIDGET (Livrables & Tags sous forme de Badges) ──
    const jsonFields = document.querySelectorAll('textarea[name="features"], textarea[name="style_preferences"], textarea[name="target_audience_chips"]');
    jsonFields.forEach(function(textarea) {
        if (textarea.dataset.hadaraChipsInit) return;
        textarea.dataset.hadaraChipsInit = "true";

        textarea.style.display = "none";

        let tags = [];
        try {
            const parsed = JSON.parse(textarea.value);
            if (Array.isArray(parsed)) tags = parsed;
        } catch(err) {
            tags = textarea.value ? textarea.value.split(',').map(s => s.trim()).filter(Boolean) : [];
        }

        const wrapper = document.createElement('div');
        wrapper.className = "hadara-chips-wrapper p-3 rounded my-2";
        wrapper.style.cssText = "background: #111827; border: 1px solid rgba(208, 162, 28, 0.25); border-radius: 12px;";

        const chipsContainer = document.createElement('div');
        chipsContainer.className = "d-flex flex-wrap align-items-center gap-2 mb-2";

        function renderChips() {
            chipsContainer.innerHTML = '';
            tags.forEach(function(tag, index) {
                const chip = document.createElement('span');
                chip.className = "badge mr-2 mb-2 px-3 py-2";
                chip.style.cssText = "background: rgba(208,162,28,0.15); color: #D0A21C; border: 1px solid rgba(208,162,28,0.4); font-size: 0.88rem; border-radius: 20px;";
                chip.innerHTML = `✓ ${tag} <i class="fas fa-times ml-2" style="cursor:pointer;" data-index="${index}"></i>`;
                chipsContainer.appendChild(chip);
            });
            textarea.value = JSON.stringify(tags);
        }

        chipsContainer.addEventListener('click', function(e) {
            if (e.target.matches('.fa-times')) {
                const idx = parseInt(e.target.dataset.index);
                tags.splice(idx, 1);
                renderChips();
            }
        });

        const inputRow = document.createElement('div');
        inputRow.className = "input-group input-group-sm mt-2";
        inputRow.innerHTML = `
            <input type="text" class="form-control" placeholder="+ Ajouter un livrable / tag..." style="background:#070B18; color:#F4F1EA; border-color:rgba(208,162,28,0.3); border-radius:8px 0 0 8px;" />
            <div class="input-group-append">
                <button type="button" class="btn btn-warning font-weight-bold" style="background:#D0A21C; color:#070B18; border-radius:0 8px 8px 0;">+ Ajouter</button>
            </div>
        `;

        const addBtn = inputRow.querySelector('button');
        const tagInput = inputRow.querySelector('input');

        function addTag() {
            const val = tagInput.value.trim();
            if (val && !tags.includes(val)) {
                tags.push(val);
                tagInput.value = '';
                renderChips();
            }
        }

        addBtn.addEventListener('click', addTag);
        tagInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
            }
        });

        wrapper.appendChild(chipsContainer);
        wrapper.appendChild(inputRow);
        textarea.parentNode.insertBefore(wrapper, textarea.nextSibling);
        renderChips();
    });

    // ── 7. HADARA LINK LIST WIDGET (Liens de Référence Clean) ───────────
    const referenceFields = document.querySelectorAll('textarea[name="reference_links"], input[name="reference_links"]');
    referenceFields.forEach(function(field) {
        if (field.dataset.hadaraLinksInit) return;
        field.dataset.hadaraLinksInit = "true";

        field.style.cssText = "display: none !important;";

        let links = [];
        try {
            const parsed = JSON.parse(field.value);
            if (Array.isArray(parsed)) links = parsed;
        } catch(err) {
            links = field.value ? field.value.split('\n').map(s => s.trim()).filter(Boolean) : [];
        }

        const container = document.createElement('div');
        container.className = "hadara-links-wrapper p-3 rounded my-2";
        container.style.cssText = "background: #111827; border: 1px solid rgba(100, 181, 246, 0.3); border-radius: 12px;";

        const linksList = document.createElement('div');
        linksList.className = "mb-2 space-y-2";

        function renderLinks() {
            linksList.innerHTML = '';
            if (links.length === 0) {
                linksList.innerHTML = '<span style="color:#A8B0BD; font-size:0.85rem; display:block; padding:0.25rem 0;">Aucun lien de référence pour le moment.</span>';
            } else {
                links.forEach(function(url, idx) {
                    const item = document.createElement('div');
                    item.style.cssText = "background:#070B18; border:1px solid #335A79; border-radius:8px; padding:0.5rem 0.75rem; margin-bottom:0.4rem; display:flex; align-items:center; justify-content:space-between;";
                    item.innerHTML = `
                        <a href="${url}" target="_blank" rel="noreferrer" style="color:#64B5F6; font-size:0.85rem; font-weight:600; text-decoration:underline; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:80%;">🔗 ${url}</a>
                        <button type="button" class="btn btn-sm btn-outline-danger" data-index="${idx}" style="padding:2px 8px; font-size:0.75rem;">× Supprimer</button>
                    `;
                    linksList.appendChild(item);
                });
            }
            field.value = links.join('\n');
        }

        linksList.addEventListener('click', function(e) {
            if (e.target.matches('button[data-index]')) {
                e.preventDefault();
                const idx = parseInt(e.target.dataset.index);
                links.splice(idx, 1);
                renderLinks();
            }
        });

        const inputGroup = document.createElement('div');
        inputGroup.className = "input-group input-group-sm mt-2";
        inputGroup.innerHTML = `
            <input type="text" class="form-control" placeholder="https://pinterest.com/pin/... ou https://instagram.com/..." style="background:#070B18; color:#F4F1EA; border-color:#335A79; border-radius:8px 0 0 8px;" />
            <div class="input-group-append">
                <button type="button" class="btn btn-info font-weight-bold" style="background:#335A79; border-color:#335A79; color:#F4F1EA; border-radius:0 8px 8px 0;">+ Ajouter Lien</button>
            </div>
        `;

        const addBtn = inputGroup.querySelector('button');
        const linkInput = inputGroup.querySelector('input');

        function addLink() {
            const val = linkInput.value.trim();
            if (val && !links.includes(val)) {
                links.push(val);
                linkInput.value = '';
                renderLinks();
            }
        }

        addBtn.addEventListener('click', function(e) { e.preventDefault(); addLink(); });
        linkInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addLink();
            }
        });

        container.appendChild(linksList);
        container.appendChild(inputGroup);
        field.parentNode.insertBefore(container, field.nextSibling);
        renderLinks();
    });

    // ── 8. Lien Externe Navbar ───────────────────────────────────────
    function fixExternalLinks() {
        const publicSiteLink = document.querySelector('.navbar-nav a[href*="hadara-design.com"]');
        if (publicSiteLink) {
            publicSiteLink.setAttribute('target', '_blank');
            publicSiteLink.setAttribute('rel', 'noopener noreferrer');
        }
    }

    fixExternalLinks();
});
