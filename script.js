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

    searchInput.addEventListener('input', function () {
        const query = normalizeText(this.value.trim());
        let nationalVisibleCount = 0;
        let regionalVisibleCount = 0;

        // 1. Filtrado de enlaces nacionales
        nationalItems.forEach(item => {
            const text = normalizeText(item.textContent);
            if (query === '' || text.includes(query)) {
                item.style.display = '';
                nationalVisibleCount++;
            } else {
                item.style.display = 'none';
            }
        });

        // 2. Filtrado granular de categorías regionales y sus enlaces internos
        categoryItems.forEach(item => {
            const details = item.querySelector('details');
            const summary = item.querySelector('summary');
            const cityLinks = item.querySelectorAll('.cities-menu a');
            
            const summaryText = normalizeText(summary ? summary.textContent : '');

            if (query === '') {
                // Estado inicial: mostrar la categoría, ocultar/mostrar todos los enlaces e invisibilizar separadores |
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
                let matchedLinksCount = 0;

                cityLinks.forEach(link => {
                    const linkText = normalizeText(link.textContent);
                    const isLinkMatch = linkText.includes(query);

                    if (isLinkMatch) {
                        link.style.display = '';
                        matchedLinksCount++;
                    } else {
                        link.style.display = 'none';
                    }

                    // Ocultar dinámicamente los separadores "|" entre enlaces
                    if (link.nextSibling && link.nextSibling.nodeType === Node.TEXT_NODE) {
                        link.nextSibling.textContent = isLinkMatch ? ' | ' : '';
                    }
                });

                const isSummaryMatch = summaryText.includes(query);

                // Si coincide el nombre del trámite/categoría O al menos una ciudad interna
                if (isSummaryMatch || matchedLinksCount > 0) {
                    item.style.display = '';
                    if (details) details.open = true;

                    // Si la búsqueda coincide con el título de la categoría (ej: "Predial"),
                    // se muestran todas las ciudades de esa categoría
                    if (isSummaryMatch && matchedLinksCount === 0) {
                        cityLinks.forEach(link => {
                            link.style.display = '';
                            if (link.nextSibling && link.nextSibling.nodeType === Node.TEXT_NODE) {
                                link.nextSibling.textContent = ' | ';
                            }
                        });
                    }

                    regionalVisibleCount++;
                } else {
                    item.style.display = 'none';
                    if (details) details.open = false;
                }
            }
        });

        // 3. Control de títulos de sección y mensaje sin resultados
        if (nationalTitle) nationalTitle.style.display = (nationalVisibleCount > 0) ? '' : 'none';
        if (regionalTitle) regionalTitle.style.display = (regionalVisibleCount > 0) ? '' : 'none';

        if (noResultsMsg) {
            noResultsMsg.style.display = (nationalVisibleCount === 0 && regionalVisibleCount === 0) ? 'block' : 'none';
        }
    });
});
