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
        return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    }

    searchInput.addEventListener('input', function () {
        const rawQuery = this.value.trim();
        const query = normalizeText(rawQuery);
        let nationalVisibleCount = 0;
        let regionalVisibleCount = 0;

        // Separar la consulta en palabras individuales para una búsqueda más fina
        const queryWords = query ? query.split(/\s+/) : [];

        nationalItems.forEach(item => {
            const text = normalizeText(item.textContent);
            
            // Comprobamos si el elemento contiene todas las palabras ingresadas en el buscador
            const matches = queryWords.length === 0 || queryWords.every(word => text.includes(word));

            if (matches) {
                item.style.display = '';
                nationalVisibleCount++;
            } else {
                item.style.display = 'none';
            }
        });

        categoryItems.forEach(item => {
            const details = item.querySelector('details');
            const text = normalizeText(item.textContent);
            
            const matches = queryWords.length === 0 || queryWords.every(word => text.includes(word));

            if (query === '') {
                item.style.display = '';
                if (details) details.open = false;
                regionalVisibleCount++;
            } else if (matches) {
                item.style.display = '';
                if (details) details.open = true;
                regionalVisibleCount++;
            } else {
                item.style.display = 'none';
                if (details) details.open = false;
            }
        });

        nationalTitle.style.display = (nationalVisibleCount > 0) ? '' : 'none';
        regionalTitle.style.display = (regionalVisibleCount > 0) ? '' : 'none';

        if (nationalVisibleCount === 0 && regionalVisibleCount === 0) {
            noResultsMsg.style.display = 'block';
        } else {
            noResultsMsg.style.display = 'none';
        }
    });
});
