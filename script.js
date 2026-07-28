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

    // Mapa de términos clave para enriquecer búsquedas por palabras asociadas (ej. Hacienda -> Impuestos)
    const keywordSynonyms = {
        'hacienda': ['impuestos', 'predial', 'vehiculos', 'retencion', 'ica', 'dian'],
        'predial': ['impuestos', 'hacienda', 'casa'],
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

        // Obtener posibles sinónimos/relacionados de la búsqueda
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

        // 1. Filtrado de enlaces nacionales
        nationalItems.forEach(item => {
            const text = item.textContent;
            if (isMatch(text)) {
                item.style.display = '';
                nationalVisibleCount++;
            } else {
                item.style.display = 'none';
            }
        });

        // 2. Filtrado de categorías regionales y enlaces de ciudades
        categoryItems.forEach(item => {
            const details = item.querySelector('details');
            const summary = item.querySelector('summary');
            const cityLinks = item.querySelectorAll('.cities-menu a');

            const summaryText = summary ? summary.textContent : '';
            const isCategoryMatch = isMatch(summaryText);

            if (query === '') {
                // Estado inicial
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
                let visibleLinksInCategory = 0;

                cityLinks.forEach(link => {
                    const linkText = link.textContent;
                    const linkUrl = link.getAttribute('href') || '';
                    const isLinkMatch = isMatch(linkText) || isMatch(linkUrl);

                    // Muestra el enlace si coincide la ciudad O si la categoría completa coincide (ej: "hacienda" -> "Impuestos")
                    if (isLinkMatch || isCategoryMatch) {
                        link.style.display = '';
                        visibleLinksInCategory++;
                    } else {
                        link.style.display = 'none';
                    }

                    // Ajuste de separadores "|"
                    if (link.nextSibling && link.nextSibling.nodeType === Node.TEXT_NODE) {
                        link.nextSibling.textContent = (isLinkMatch || isCategoryMatch) ? ' | ' : '';
                    }
                });

                if (visibleLinksInCategory > 0 || isCategoryMatch) {
                    item.style.display = '';
                    if (details) details.open = true;
                    regionalVisibleCount++;
                } else {
                    item.style.display = 'none';
                    if (details) details.open = false;
                }
            }
        });

        // 3. Control de visibilidad de secciones y mensaje
        if (nationalTitle) nationalTitle.style.display = (nationalVisibleCount > 0) ? '' : 'none';
        if (regionalTitle) regionalTitle.style.display = (regionalVisibleCount > 0) ? '' : 'none';

        if (noResultsMsg) {
            noResultsMsg.style.display = (nationalVisibleCount === 0 && regionalVisibleCount === 0) ? 'block' : 'none';
        }
    });
});
