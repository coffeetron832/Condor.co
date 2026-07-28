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

        nationalItems.forEach(item => {
            const text = normalizeText(item.textContent);
            if (query === '' || text.includes(query)) {
                item.style.display = '';
                nationalVisibleCount++;
            } else {
                item.style.display = 'none';
            }
        });

        categoryItems.forEach(item => {
            const details = item.querySelector('details');
            const text = normalizeText(item.textContent);

            if (query === '') {
                item.style.display = '';
                if (details) details.open = false;
                regionalVisibleCount++;
            } else if (text.includes(query)) {
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
