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
        { id: 'sincelejo', name: 'Sincelejo', dept: 'Suc.' },
        { id: 'valledupar', name: 'Valledupar', dept: 'Ces.' },
        { id: 'villavicencio', name: 'Villavicencio', dept: 'Met.' }
    ];

    function renderCitiesMenu() {
        const menus = document.querySelectorAll('.cities-menu');

        const sortedCities = [...CITIES_DATA].sort((a, b) => 
            a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
        );

        menus.forEach(menu => {
            const category = menu.dataset.category;
            const showDept = menu.dataset.showDept === 'true';

            // Envolver cada enlace en un span envoltorio con la barra separadora
            const linksHTML = sortedCities.map((city, index) => {
                const label = showDept && city.dept !== 'Bogotá D.C.' 
                    ? `${city.name} / ${city.dept}` 
                    : city.name;
                const separator = index < sortedCities.length - 1 ? '<span class="city-sep"> | </span>' : '';
                return `<span class="city-link-wrapper" data-city-id="${city.id}"><a href="ciudad.html?cat=${category}&city=${city.id}">${label}</a>${separator}</span>`;
            }).join('');

            menu.innerHTML = `<span class="cities-label">Selecciona tu ubicación:</span><br><div class="cities-list">${linksHTML}</div>`;
        });
    }

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
    // 3. VERIFICADOR DE ESTADO, FAVICONS Y SEGURIDAD DE ENLACES
    // ==========================================
    function checkLinksHealthAndSecurity() {
        const allLinks = document.querySelectorAll('.national-links a, .cities-menu a');

        allLinks.forEach(async (link) => {
            const url = link.getAttribute('href');
            if (!url || url.startsWith('ciudad.html')) return; // Omitir enlaces internos

            // --- A. INSERTAR FAVICON ---
            try {
                const domain = new URL(url).hostname;
                if (!link.querySelector('.link-favicon')) {
                    const faviconImg = document.createElement('img');
                    faviconImg.className = 'link-favicon';
                    faviconImg.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
                    faviconImg.alt = '';
                    faviconImg.style.width = '16px';
                    faviconImg.style.height = '16px';
                    faviconImg.style.verticalAlign = 'middle';
                    faviconImg.style.marginRight = '5px';
                    faviconImg.style.display = 'inline-block';

                    // Insertar al inicio del enlace
                    link.insertBefore(faviconImg, link.firstChild);
                }
            } catch (e) {
                // Si la URL no es válida, continuar
            }

            // --- B. PREPARAR BADGE DE ESTADO ---
            let statusSpan = link.parentNode.querySelector(`.link-status-badge[data-for="${encodeURIComponent(url)}"]`);
            if (!statusSpan) {
                statusSpan = document.createElement('span');
                statusSpan.className = 'link-status-badge';
                statusSpan.setAttribute('data-for', encodeURIComponent(url));
                statusSpan.style.fontSize = '11px';
                statusSpan.style.marginLeft = '6px';
                statusSpan.style.padding = '1px 5px';
                statusSpan.style.borderRadius = '4px';
                statusSpan.style.display = 'inline-block';
                
                // Insertar justo después del enlace
                link.after(statusSpan);
            }

            // 1. Verificación de HTTPS
            const isSecure = url.startsWith('https://');
            if (!isSecure) {
                statusSpan.innerHTML = '⚠️ <span title="Conexión no segura (HTTP)">Inseguro</span>';
                statusSpan.style.backgroundColor = '#ffebee';
                statusSpan.style.color = '#c62828';
                return;
            }

            // Estado de carga inicial
            statusSpan.innerHTML = '⏳ <span title="Verificando disponibilidad...">...</span>';
            statusSpan.style.backgroundColor = '#f5f5f5';
            statusSpan.style.color = '#616161';

            // 2. Verificación de disponibilidad del sitio
            const isAlive = await checkGovSiteStatus(url);

            if (isAlive) {
                setStatusOnline(statusSpan);
            } else {
                setStatusOffline(statusSpan);
            }
        });
    }

    async function checkGovSiteStatus(targetUrl) {
        return new Promise((resolve) => {
            let resolved = false;

            // Timeout preventivo de 4.5 segundos
            const timer = setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    resolve(false);
                }
            }, 4500);

            try {
                const domain = new URL(targetUrl).hostname;
                const testImg = new Image();

                testImg.onload = function () {
                    if (!resolved) {
                        resolved = true;
                        clearTimeout(timer);
                        resolve(true);
                    }
                };

                testImg.onerror = function () {
                    if (!resolved) {
                        resolved = true;
                        clearTimeout(timer);
                        
                        fetch(targetUrl, { method: 'HEAD', mode: 'no-cors', cache: 'no-cache' })
                            .then(() => resolve(true))
                            .catch(() => resolve(false));
                    }
                };

                testImg.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=32&t=${Date.now()}`;
            } catch (e) {
                if (!resolved) {
                    resolved = true;
                    clearTimeout(timer);
                    resolve(false);
                }
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
                const cityWrappers = item.querySelectorAll('.city-link-wrapper');

                const summaryText = summary ? summary.textContent : '';
                const isCategoryMatch = isMatch(summaryText);

                if (query === '') {
                    item.style.display = '';
                    if (details) details.open = false;
                    
                    // Restaurar visibilidad de envoltorios y separadores
                    cityWrappers.forEach(wrapper => {
                        wrapper.style.display = '';
                        const sep = wrapper.querySelector('.city-sep');
                        if (sep) sep.style.display = '';
                    });
                    regionalVisibleCount++;
                } else {
                    let visibleWrappers = [];

                    cityWrappers.forEach(wrapper => {
                        const link = wrapper.querySelector('a');
                        const linkText = link ? link.textContent : '';
                        const linkUrl = link ? link.getAttribute('href') : '';
                        const cityId = wrapper.dataset.cityId;
                        const cityObj = CITIES_DATA.find(c => c.id === cityId);

                        let isDirectMatch = isMatch(linkText) || isMatch(linkUrl);

                        if (!isDirectMatch && cityObj) {
                            if (isMatch(cityObj.name) || isMatch(cityObj.dept) || isMatch(cityObj.id)) {
                                isDirectMatch = true;
                            }
                        }

                        if (isDirectMatch || isCategoryMatch) {
                            wrapper.style.display = '';
                            visibleWrappers.push(wrapper);
                        } else {
                            wrapper.style.display = 'none';
                        }
                    });

                    // Limpieza dinámica de separadores (|) entre resultados visibles
                    visibleWrappers.forEach((wrapper, idx) => {
                        const sep = wrapper.querySelector('.city-sep');
                        if (sep) {
                            // Ocultar la barra en el último elemento visible de la lista
                            sep.style.display = (idx === visibleWrappers.length - 1) ? 'none' : '';
                        }
                    });

                    if (visibleWrappers.length > 0 || isCategoryMatch) {
                        item.style.display = '';
                        if (details) details.open = true;
                        regionalVisibleCount++;
                    } else {
                        item.style.display = 'none';
                        if (details) details.open = false;
                    }
                }
            });

            // 3. Manejo de títulos y mensaje sin resultados
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
