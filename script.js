document.addEventListener('DOMContentLoaded', function () {
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    const nationalItems = document.querySelectorAll('.searchable-item');
    const categoryItems = document.querySelectorAll('.searchable-category');
    const nationalTitle = document.getElementById('nationalSectionTitle');
    const regionalTitle = document.getElementById('regionalSectionTitle');
    const noResultsMsg = document.getElementById('noResultsMsg');

    if (searchForm) {
        searchForm.addEventListener('submit', function (e) {
            e.preventDefault();
        });
    }

    function normalizeText(text) {
        if (!text) return '';
        return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    // Mapa de palabras clave para trámites comunes
    const keywordSynonyms = {
        'hacienda': ['impuestos', 'predial', 'vehiculos', 'retencion', 'ica', 'dian'],
        'predial': ['impuestos', 'hacienda'],
        'vehiculo': ['vehiculos', 'impuestos', 'movilidad', 'tránsito', 'transito', 'patios', 'runt', 'simit'],
        'soat': ['runt', 'simit', 'movilidad', 'tránsito', 'transito'],
        'fotomulta': ['simit', 'runt', 'movilidad', 'tránsito', 'transito'],
        'fosyga': ['adres', 'bdua', 'eps', 'salud'],
        'cedula': ['registraduria', 'duplicado', 'identificacion']
    };

    searchInput.addEventListener('input', function () {
        const query = normalizeText(this.value.trim());
        let nationalVisibleCount = 0;
        let regionalVisibleCount = 0;

        let searchTerms = [query];
        if (query !== '') {
            Object.keys(keywordSynonyms).forEach(key => {
                if (key.includes(query) || query.includes(key)) {
                    searchTerms = searchTerms.concat(keywordSynonyms[key]);
                }
            });
        }

        const isMatch = (textToTest) => {
            if (query === '') return true;
            const normalizedTarget = normalizeText(textToTest);
            return searchTerms.some(term => normalizedTarget.includes(term));
        };

        // 1. Filtrado de trámites nacionales
        nationalItems.forEach(item => {
            const text = item.textContent;
            if (query === '' || isMatch(text)) {
                item.style.display = '';
                nationalVisibleCount++;
            } else {
                item.style.display = 'none';
            }
        });

        // 2. Filtrado exacto de categorías y enlaces regionales
        categoryItems.forEach(item => {
            const details = item.querySelector('details');
            const summary = item.querySelector('summary');
            const cityLinks = item.querySelectorAll('.cities-menu a');

            const summaryText = summary ? summary.textContent : '';
            const isCategoryMatch = isMatch(summaryText);

            if (query === '') {
                // Estado inicial sin búsqueda
                item.style.display = '';
                if (details) details.open = false;
                cityLinks.forEach(link => {
                    link.style.display = '';
                    if (link.nextSibling && link.nextSibling.nodeType === Node.TEXT_NODE) {
                        link.nextSibling.textContent = ' | ';
                    }
                });
                regionalVisibleCount++;
            } else {
                let matchingLinksInCategory = 0;

                cityLinks.forEach(link => {
                    const linkText = link.textContent;
                    const linkUrl = link.getAttribute('href') || '';
                    
                    // Comprobar coincidencia directa en la ciudad / enlace
                    const isDirectLinkMatch = isMatch(linkText) || isMatch(linkUrl);

                    // Si la búsqueda coincide con la ciudad O la categoría del trámite
                    if (isDirectLinkMatch || isCategoryMatch) {
                        // Si el usuario buscó una ciudad específica, mostrar SOLO la ciudad coincidente
                        if (!isCategoryMatch && !isDirectLinkMatch) {
                            link.style.display = 'none';
                        } else {
                            link.style.display = '';
                            matchingLinksInCategory++;
                        }
                    } else {
                        link.style.display = 'none';
                    }

                    // Limpieza de separadores "|"
                    if (link.nextSibling && link.nextSibling.nodeType === Node.TEXT_NODE) {
                        link.nextSibling.textContent = (link.style.display !== 'none') ? ' | ' : '';
                    }
                });

                if (matchingLinksInCategory > 0 || isCategoryMatch) {
                    item.style.display = '';
                    if (details) details.open = true;
                    regionalVisibleCount++;
                } else {
                    item.style.display = 'none';
                    if (details) details.open = false;
                }
            }
        });

        // 3. Manejo de títulos para evitar la segmentación durante la búsqueda activa
        if (query !== '') {
            // Ocultar cabeceras divisoras si hay texto en el buscador
            if (nationalTitle) nationalTitle.style.display = 'none';
            if (regionalTitle) regionalTitle.style.display = 'none';
        } else {
            // Restaurar los títulos si la barra está vacía
            if (nationalTitle) nationalTitle.style.display = (nationalVisibleCount > 0) ? '' : 'none';
            if (regionalTitle) regionalTitle.style.display = (regionalVisibleCount > 0) ? '' : 'none';
        }

        // Mostrar u ocultar mensaje de sin resultados
        if (noResultsMsg) {
            noResultsMsg.style.display = (nationalVisibleCount === 0 && regionalVisibleCount === 0) ? 'block' : 'none';
        }
    });
});
