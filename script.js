document.addEventListener('DOMContentLoaded', function () {

    // ==========================================
    // 1. BASE DE DATOS Y RENDERIZADO DE CIUDADES
    // ==========================================
    const CITIES_DATA = [
        { id: 'barranquilla', name: 'Barranquilla', dept: 'Atl.' },
        { id: 'bogota', name: 'Bogotá D.C.', dept: 'Bogotá D.C.' },
        { id: 'bucaramanga', name: 'Bucaramanga', dept: 'Sant.' },
        { id: 'cali', name: 'Cali', dept: 'Valle' },
        { id: 'cartagena', name: 'Cartagena', dept: 'Bol.' },
        { id: 'cucuta', name: 'Cúcuta', dept: 'N.S.' },
        { id: 'ibague', name: 'Ibagué', dept: 'Tol.' },
        { id: 'manizales', name: 'Manizales', dept: 'Cal.' },
        { id: 'medellin', name: 'Medellín', dept: 'Ant.' },
        { id: 'monteria', name: 'Montería', dept: 'Cór.' },
        { id: 'pasto', name: 'Pasto', dept: 'Nar.' },
        { id: 'pereira', name: 'Pereira', dept: 'Ris.' },
        { id: 'santamarta', name: 'Santa Marta', dept: 'Mag.' },
        { id: 'valledupar', name: 'Valledupar', dept: 'Ces.' },
        { id: 'villavicencio', name: 'Villavicencio', dept: 'Met.' }
    ];

    function renderCitiesMenu() {
        const menus = document.querySelectorAll('.cities-menu');

        // Garantizar el ordenamiento alfabético considerando tildes
        const sortedCities = [...CITIES_DATA].sort((a, b) => 
            a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
        );

        menus.forEach(menu => {
            const category = menu.dataset.category;
            const showDept = menu.dataset.showDept === 'true';

            const linksHTML = sortedCities.map(city => {
                const label = showDept && city.dept !== 'Bogotá D.C.' 
                    ? `${city.name} / ${city.dept}` 
                    : city.name;
                return `<a href="ciudad.html?cat=${category}&city=${city.id}">${label}</a>`;
            }).join(' | ');

            menu.innerHTML = `Selecciona tu ubicación: <br>${linksHTML}`;
        });
    }

    // Generar dinámicamente los enlaces antes de ejecutar la lógica de búsqueda y verificación
    renderCitiesMenu();


    // ==========================================
    // 2. ELEMENTOS Y CONFIGURACIÓN INICIAL
    // ==========================================
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


    // ==========================================
    // 3. VERIFICADOR DE ESTADO Y SEGURIDAD DE ENLACES
    // ==========================================
    function checkLinksHealthAndSecurity() {
        const allLinks = document.querySelectorAll('.national-links a, .cities-menu a');

        allLinks.forEach(link => {
            const url = link.getAttribute('href');
            if (!url || url.startsWith('ciudad.html')) return; // Omitir enlaces internos simulados

            // Verificación de Seguridad (HTTPS)
            const isSecure = url.startsWith('https://');
            
            let statusSpan = link.parentNode.querySelector('.link-status-badge');
            if (!statusSpan) {
                statusSpan = document.createElement('span');
                statusSpan.className = 'link-status-badge';
                statusSpan.style.fontSize = '11px';
                statusSpan.style.marginLeft = '6px';
                statusSpan.style.padding = '1px 5px';
                statusSpan.style.borderRadius = '4px';
                link.parentNode.insertBefore(statusSpan, link.nextSibling);
            }

            if (!isSecure) {
                statusSpan.innerHTML = '⚠️ <span title="Conexión no segura (HTTP)">Inseguro</span>';
                statusSpan.style.backgroundColor = '#ffebee';
                statusSpan.style.color = '#c62828';
                return;
            }

            // Verificación de Estado (Activo / Caído)
            try {
                const domain = new URL(url).origin;
                const img = new Image();
                let finished = false;

                const timer = setTimeout(() => {
                    if (!finished) {
                        finished = true;
                        setStatusOffline(statusSpan);
                    }
                }, 4000);

                img.onload = function() {
                    if (!finished) {
                        finished = true;
                        clearTimeout(timer);
                        setStatusOnline(statusSpan);
                    }
                };

                img.onerror = function() {
                    if (!finished) {
                        finished = true;
                        clearTimeout(timer);
                        setStatusOnline(statusSpan);
                    }
                };

                img.src = `${domain}/favicon.ico?t=${new Date().getTime()}`;

            } catch (e) {
                setStatusOffline(statusSpan);
            }
        });
    }

    function setStatusOnline(element) {
        element.innerHTML = '🟢 <span title="Enlace activo y seguro HTTPS">OK</span>';
        element.style.backgroundColor = '#e8f5e9';
        element.style.color = '#2e7d32';
    }

    function setStatusOffline(element) {
        element.innerHTML = '🔴 <span title="El servidor no responde o podría estar caído">Caído</span>';
        element.style.backgroundColor = '#ffebee';
        element.style.color = '#c62828';
    }

    // Ejecutar verificación al cargar la página
    checkLinksHealthAndSecurity();


    // ==========================================
    // 4. SISTEMA DE BÚSQUEDA Y FILTRADO LIMPIO
    // ==========================================
    if (searchInput) {
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

            // 2. Filtrado de categorías y enlaces regionales
            categoryItems.forEach(item => {
                const details = item.querySelector('details');
                const summary = item.querySelector('summary');
                const cityLinks = item.querySelectorAll('.cities-menu a');

                const summaryText = summary ? summary.textContent : '';
                const isCategoryMatch = isMatch(summaryText);

                if (query === '') {
                    item.style.display = '';
                    if (details) details.open = false;
                    cityLinks.forEach(link => {
                        link.style.display = '';
                    });
                    regionalVisibleCount++;
                } else {
                    let matchingLinksInCategory = 0;

                    cityLinks.forEach(link => {
                        const linkText = link.textContent;
                        const linkUrl = link.getAttribute('href') || '';
                        
                        const isDirectLinkMatch = isMatch(linkText) || isMatch(linkUrl);

                        if (isDirectLinkMatch || isCategoryMatch) {
                            link.style.display = '';
                            matchingLinksInCategory++;
                        } else {
                            link.style.display = 'none';
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

            // 3. Manejo de títulos
            if (query !== '') {
                if (nationalTitle) nationalTitle.style.display = 'none';
                if (regionalTitle) regionalTitle.style.display = 'none';
            } else {
                if (nationalTitle) nationalTitle.style.display = (nationalVisibleCount > 0) ? '' : 'none';
                if (regionalTitle) regionalTitle.style.display = (regionalVisibleCount > 0) ? '' : 'none';
            }

            if (noResultsMsg) {
                noResultsMsg.style.display = (nationalVisibleCount === 0 && regionalVisibleCount === 0) ? 'block' : 'none';
            }
        });
    }
});
