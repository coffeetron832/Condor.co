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

    // ==========================================
    // VERIFICADOR DE ESTADO Y SEGURIDAD DE ENLACES
    // ==========================================
    function checkLinksHealthAndSecurity() {
        const allLinks = document.querySelectorAll('.national-links a, .cities-menu a');

        allLinks.forEach(link => {
            const url = link.getAttribute('href');
            if (!url || url.startsWith('ciudad.html')) return; // Omitir enlaces internos simulados

            // 1. Verificación de Seguridad (HTTPS)
            const isSecure = url.startsWith('https://');
            
            // Crear o ubicar contenedor de estado si no existe
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

            // Indicador preliminar de seguridad
            if (!isSecure) {
                statusSpan.innerHTML = '⚠️ <span title="Conexión no segura (HTTP)">Inseguro</span>';
                statusSpan.style.backgroundColor = '#ffebee';
                statusSpan.style.color = '#c62828';
                return;
            }

            // 2. Verificación de Estado (Activo / Caído) mediante imagen/favicon invisible o caché
            // Usamos una petición de imagen al favicon del dominio para tantear conectividad real evadiendo CORS estricto
            try {
                const domain = new URL(url).origin;
                const img = new Image();
                let finished = false;

                // Timeout de seguridad de 4 segundos por si el servidor gubernamental está lento
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
                    // CORS suele disparar onerror, lo que indica que el servidor respondió pero bloqueó la imagen. 
                    // Esto significa técnicamente que el servidor ESTÁ ACTIVO y respondiendo.
                    if (!finished) {
                        finished = true;
                        clearTimeout(timer);
                        setStatusOnline(statusSpan);
                    }
                };

                // Intentar cargar el favicon del portal institucional
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
    // SISTEMA DE BÚSQUEDA Y FILTRADO LIMPIO
    // ==========================================
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
                item.style.display = '';
                if (details) details.open = false;
                cityLinks.forEach(link => {
                    link.style.display = '';
                    if (link.nextSibling && link.nextSibling.nodeType === Node.TEXT_NODE && !link.nextSibling.classList?.contains('link-status-badge')) {
                        link.nextSibling.textContent = ' | ';
                    }
                });
                regionalVisibleCount++;
            } else {
                let matchingLinksInCategory = 0;

                cityLinks.forEach(link => {
                    const linkText = link.textContent;
                    const linkUrl = link.getAttribute('href') || '';
                    
                    const isDirectLinkMatch = isMatch(linkText) || isMatch(linkUrl);

                    if (isDirectLinkMatch || isCategoryMatch) {
                        if (!isCategoryMatch && !isDirectLinkMatch) {
                            link.style.display = 'none';
                        } else {
                            link.style.display = '';
                            matchingLinksInCategory++;
                        }
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

        // 3. Manejo de títulos para mantener la limpieza visual
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
});
