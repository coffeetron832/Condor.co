document.addEventListener('DOMContentLoaded', function () {

    // ==========================================
    // 1. BASE DE DATOS Y RENDERIZADO DE CIUDADES
    // ==========================================
    const CITIES_DATA = [
        { id: 'barranquilla', name: 'Barranquilla', dept: 'Atl.', deptFull: 'Atlantico' },
        { id: 'bogota', name: 'Bogotá D.C.', dept: 'Bogotá D.C.', deptFull: 'Bogota' },
        { id: 'bucaramanga', name: 'Bucaramanga', dept: 'Sant.', deptFull: 'Santander' },
        { id: 'cali', name: 'Cali', dept: 'Valle', deptFull: 'Valle del Cauca' },
        { id: 'cartagena', name: 'Cartagena', dept: 'Bol.', deptFull: 'Bolivar' },
        { id: 'cucuta', name: 'Cúcuta', dept: 'N.S.', deptFull: 'Norte de Santander' },
        { id: 'ibague', name: 'Ibagué', dept: 'Tol.', deptFull: 'Tolima' },
        { id: 'manizales', name: 'Manizales', dept: 'Cal.', deptFull: 'Caldas' },
        { id: 'medellin', name: 'Medellín', dept: 'Ant.', deptFull: 'Antioquia' },
        { id: 'monteria', name: 'Montería', dept: 'Cór.', deptFull: 'Cordoba' },
        { id: 'pasto', name: 'Pasto', dept: 'Nar.', deptFull: 'Narino' },
        { id: 'pereira', name: 'Pereira', dept: 'Ris.', deptFull: 'Risaralda' },
        { id: 'santamarta', name: 'Santa Marta', dept: 'Mag.', deptFull: 'Magdalena' },
        { id: 'sincelejo', name: 'Sincelejo', dept: 'Suc.', deptFull: 'Sucre' },
        { id: 'valledupar', name: 'Valledupar', dept: 'Ces.', deptFull: 'Cesar' },
        { id: 'villavicencio', name: 'Villavicencio', dept: 'Met.', deptFull: 'Meta' }
    ];

    // Mapa rápido por ID para búsquedas eficientes
    const CITIES_MAP = CITIES_DATA.reduce((acc, city) => {
        acc[city.id] = city;
        return acc;
    }, {});

    function renderCitiesMenu() {
        const menus = document.querySelectorAll('.cities-menu');

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
                return `<a href="ciudad.html?cat=${category}&city=${city.id}" data-city-id="${city.id}">${label}</a>`;
            }).join(' | ');

            menu.innerHTML = `Selecciona tu ubicación: <br>${linksHTML}`;
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
        'cedula': ['registraduria', 'duplicado', 'identificacion'],
        
        // Departamentos y alias comunes
        'antioquia': ['medellin', 'ant'],
        'atlantico': ['barranquilla', 'atl'],
        'bolivar': ['cartagena', 'bol'],
        'valle': ['cali', 'valle del cauca'],
        'santander': ['bucaramanga', 'sant'],
        'norte de santander': ['cucuta', 'n.s.', 'ns'],
        'cordoba': ['monteria', 'cor'],
        'tolima': ['ibague', 'tol'],
        'caldas': ['manizales', 'cal'],
        'narino': ['pasto', 'nar'],
        'risaralda': ['pereira', 'ris'],
        'magdalena': ['santa marta', 'mag'],
        'sucre': ['sincelejo', 'suc'],
        'cesar': ['valledupar', 'ces'],
        'meta': ['villavicencio', 'met']
    };


    // ==========================================
    // 3. VERIFICADOR DE ESTADO CON CLOUDFLARE WORKER
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

                    link.insertBefore(faviconImg, link.firstChild);
                }
            } catch (e) {}

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
                
                link.after(statusSpan);
            }

            // Verificación HTTPS
            const isSecure = url.startsWith('https://');
            if (!isSecure) {
                statusSpan.innerHTML = '⚠️ <span title="Conexión no segura (HTTP)">Inseguro</span>';
                statusSpan.style.backgroundColor = '#ffebee';
                statusSpan.style.color = '#c62828';
                return;
            }

            statusSpan.innerHTML = '⏳ <span title="Verificando disponibilidad...">...</span>';
            statusSpan.style.backgroundColor = '#f5f5f5';
            statusSpan.style.color = '#616161';

            const isAlive = await checkGovSiteStatus(url);

            if (isAlive) {
                setStatusOnline(statusSpan);
            } else {
                setStatusOffline(statusSpan);
            }
        });
    }

    async function checkGovSiteStatus(targetUrl) {
        // Reemplaza por la URL pública de tu Cloudflare Worker
        const WORKER_URL = 'https://verificador-estado.tu-usuario.workers.dev';

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 6000);

            const response = await fetch(`${WORKER_URL}?url=${encodeURIComponent(targetUrl)}`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!response.ok) return false;
            
            const data = await response.json();
            return data.isOnline;
        } catch (e) {
            return false;
        }
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
    // 4. SISTEMA DE BÚSQUEDA Y FILTRADO INTEGRADO
    // ==========================================
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const query = normalizeText(this.value.trim());
            let nationalVisibleCount = 0;
            let regionalVisibleCount = 0;

            let searchTerms = [query];
            if (query !== '') {
                Object.keys(keywordSynonyms).forEach(key => {
                    const normKey = normalizeText(key);
                    if (normKey.includes(query) || query.includes(normKey)) {
                        searchTerms = searchTerms.concat(keywordSynonyms[key].map(normalizeText));
                    }
                });
            }

            const isMatch = (textToTest) => {
                if (query === '') return true;
                const normalizedTarget = normalizeText(textToTest);
                return searchTerms.some(term => term !== '' && normalizedTarget.includes(term));
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
                        
                        // Extraer el ID de la ciudad del atributo data-city-id o de la URL
                        const cityIdMatch = linkUrl.match(/city=([^&]+)/);
                        const cityId = link.dataset.cityId || (cityIdMatch ? cityIdMatch[1] : null);
                        const cityData = CITIES_MAP[cityId];

                        // Construir texto de validación amplio (Nombre + Abreviatura + Depto Completo)
                        let fullCitySearchableText = linkText;
                        if (cityData) {
                            fullCitySearchableText += ` ${cityData.name} ${cityData.dept} ${cityData.deptFull}`;
                        }

                        const isDirectLinkMatch = isMatch(fullCitySearchableText);

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

            // 3. Manejo de visibilidad de títulos y mensajes
            if (query !== '') {
                if (nationalTitle) nationalTitle.style.display = (nationalVisibleCount > 0) ? '' : 'none';
                if (regionalTitle) regionalTitle.style.display = (regionalVisibleCount > 0) ? '' : 'none';
            } else {
                if (nationalTitle) nationalTitle.style.display = '';
                if (regionalTitle) regionalTitle.style.display = '';
            }

            if (noResultsMsg) {
                noResultsMsg.style.display = (nationalVisibleCount === 0 && regionalVisibleCount === 0) ? 'block' : 'none';
            }
        });
    }
});
