/*
 * 24col - Directorio Ciudadano Colombiano
 * Copyright (C) 2026 jahp
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

document.addEventListener('DOMContentLoaded', function () {

    // ==========================================
    // AUXILIAR: Obtención unificada de ciudades
    // ==========================================
    function getCitiesList() {
        if (Array.isArray(window.CITIES_DATA)) {
            return window.CITIES_DATA;
        }

        if (window.CITY_META_DATA && typeof window.CITY_META_DATA === 'object') {
            return Object.keys(window.CITY_META_DATA).map(key => {
                const item = window.CITY_META_DATA[key];
                let name = item.name || item.fullName || key;
                let dept = item.dept || item.department || '';

                if (!item.dept && item.fullName && item.fullName.includes('/')) {
                    const parts = item.fullName.split('/');
                    name = parts[0].trim();
                    dept = parts[1].trim();
                }

                return {
                    id: key,
                    name: name,
                    dept: dept,
                    lat: item.lat || item.latitude,
                    lon: item.lon || item.lng || item.longitude
                };
            });
        }

        return [];
    }

    // ==========================================
    // 1. RENDERIZADO DEL MENÚ DE CIUDADES
    // ==========================================
    function renderCitiesMenu() {
        const menus = document.querySelectorAll('.cities-menu');
        const rawCities = getCitiesList();

        if (rawCities.length === 0) {
            console.warn('24col: No se encontraron datos de ciudades disponibles.');
            return;
        }

        const sortedCities = [...rawCities].sort((a, b) => 
            a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
        );

        const localServices = window.LOCAL_SERVICES_INDEX || {};

        menus.forEach(menu => {
            const category = menu.dataset.category || '';
            const showDept = menu.dataset.showDept === 'true';

            const linksHTML = sortedCities.map((city) => {
                const label = showDept && city.dept && city.dept !== 'Bogotá D.C.' 
                    ? `${city.name} / ${city.dept}` 
                    : city.name;

                const cityServices = (localServices[city.id] && localServices[city.id][category]) 
                    ? localServices[city.id][category].join(', ') 
                    : '';

                const href = category 
                    ? `ciudad.html?cat=${category}&city=${city.id}`
                    : `ciudad.html?city=${city.id}`;

                return `
                    <li class="city-link-wrapper" data-city-id="${city.id}" data-category="${category}" data-services="${cityServices}" style="margin-bottom: 6px;">
                        <a href="${href}">${label}</a>
                        <span class="matched-service-tag" style="display:none; font-size:11px; color:#1976d2; font-weight:bold; margin-left:4px;"></span>
                    </li>`;
            }).join('');

            menu.innerHTML = `
                <span class="cities-label" style="font-weight: bold; display: block; margin-bottom: 6px;">Selecciona tu ubicación:</span>
                <ul class="cities-list" style="list-style: none; padding-left: 0; margin: 0;">
                    ${linksHTML}
                </ul>`;
        });
    }

    renderCitiesMenu();


    // ==========================================
    // 2. VERIFICADOR DE ESTADO, FAVICONS Y SEGURIDAD
    // ==========================================
    function checkLinksHealthAndSecurity() {
        const allLinks = document.querySelectorAll('.searchable-item a, .national-links a, .cities-menu a');

        allLinks.forEach(async (link) => {
            const url = link.getAttribute('href');

            if (!url || url.startsWith('ciudad.html') || url.startsWith('#') || (!url.startsWith('http://') && !url.startsWith('https://'))) {
                return;
            }

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
        return new Promise((resolve) => {
            let resolved = false;

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
    // 3. BUSCADOR CON SINÓNIMOS BIDIRECCIONALES
    // ==========================================
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    const nationalItems = document.querySelectorAll('.searchable-item');
    const categoryItems = document.querySelectorAll('.searchable-category');
    const nationalTitle = document.getElementById('nationalSectionTitle');
    const regionalTitle = document.getElementById('regionalSectionTitle');
    const noResultsMsg = document.getElementById('noResultsMsg');

    if (searchForm) {
        searchForm.addEventListener('submit', (e) => e.preventDefault());
    }

    function normalizeText(text) {
        if (!text) return '';
        return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    const keywordSynonyms = {
        'hacienda': ['impuestos', 'predial', 'vehiculos', 'retencion', 'ica', 'dian'],
        'impuesto': ['impuestos', 'predial', 'vehiculos', 'hacienda', 'dian'],
        'impuestos': ['predial', 'vehiculos', 'hacienda', 'dian', 'ica'],
        'predial': ['impuestos', 'hacienda', 'alcaldia'],
        'vehiculo': ['vehiculos', 'impuestos', 'movilidad', 'tránsito', 'transito', 'patios', 'runt', 'simit', 'afinia'],
        'vehiculos': ['vehiculo', 'impuestos', 'movilidad', 'tránsito', 'transito', 'patios', 'runt', 'simit', 'afinia'],
        'agua': ['acueducto', 'veolia', 'eaab', 'epm', 'emcali', 'triple a', 'acuacar', 'empopasto', 'ibal', 'essmar'],
        'luz': ['energia', 'afinia', 'air-e', 'enel', 'epm', 'essa', 'celsia', 'chec', 'cens', 'cedenar', 'emsa'],
        'gas': ['surtigas', 'vanti', 'gases', 'efigas', 'alcanos', 'llanogas', 'gasoriente'],
        'soat': ['runt', 'simit', 'movilidad', 'tránsito', 'transito'],
        'fotomulta': ['simit', 'runt', 'movilidad', 'tránsito', 'transito', 'datt'],
        'fosyga': ['adres', 'bdua', 'eps', 'salud'],
        'cedula': ['registraduria', 'duplicado', 'identificacion']
    };

    function getExpandedSearchTerms(query) {
        const normQuery = normalizeText(query);
        if (!normQuery) return [];

        const terms = new Set([normQuery]);

        Object.entries(keywordSynonyms).forEach(([key, synonyms]) => {
            const normKey = normalizeText(key);
            const normSynonyms = synonyms.map(s => normalizeText(s));

            const matchesKey = normKey.includes(normQuery) || normQuery.includes(normKey);
            const matchesSynonym = normSynonyms.some(s => s.includes(normQuery) || normQuery.includes(s));

            if (matchesKey || matchesSynonym) {
                terms.add(normKey);
                normSynonyms.forEach(s => terms.add(s));
            }
        });

        return Array.from(terms);
    }

    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const rawQuery = this.value.trim();
            const query = normalizeText(rawQuery);
            const citiesList = getCitiesList();

            let nationalVisibleCount = 0;
            let regionalVisibleCount = 0;

            const searchTerms = getExpandedSearchTerms(query);

            const isMatch = (textToTest) => {
                if (!textToTest || searchTerms.length === 0) return false;
                const normalizedTarget = normalizeText(textToTest);
                return searchTerms.some(term => normalizedTarget.includes(term));
            };

            nationalItems.forEach(item => {
                if (query === '') {
                    item.style.display = '';
                    nationalVisibleCount++;
                } else {
                    const itemText = item.textContent || '';
                    if (isMatch(itemText)) {
                        item.style.display = '';
                        nationalVisibleCount++;
                    } else {
                        item.style.display = 'none';
                    }
                }
            });

            categoryItems.forEach(item => {
                const details = item.querySelector('details');
                const summary = item.querySelector('summary');
                const cityWrappers = item.querySelectorAll('.city-link-wrapper');

                const summaryText = summary ? summary.textContent : '';
                const categoryAttr = item.dataset.category || '';
                const isCategoryMatch = (query !== '') && (isMatch(summaryText) || isMatch(categoryAttr));

                if (query === '') {
                    item.style.display = '';
                    if (details) details.open = false;

                    cityWrappers.forEach(wrapper => {
                        wrapper.style.display = '';
                        const tag = wrapper.querySelector('.matched-service-tag');
                        if (tag) tag.style.display = 'none';
                    });
                    regionalVisibleCount++;
                } else {
                    let visibleWrappersCount = 0;

                    cityWrappers.forEach(wrapper => {
                        const link = wrapper.querySelector('a');
                        const linkText = link ? link.textContent : '';
                        const cityId = wrapper.dataset.cityId || '';
                        const cityServices = wrapper.dataset.services || '';
                        const cityObj = citiesList.find(c => c.id === cityId);
                        const tag = wrapper.querySelector('.matched-service-tag');

                        let matchedServiceName = '';

                        const isCityMatch = isMatch(linkText) || (cityObj && (isMatch(cityObj.name) || isMatch(cityObj.dept)));

                        if (cityServices) {
                            const servicesList = cityServices.split(',').map(s => s.trim());
                            const found = servicesList.find(service => isMatch(service));
                            if (found) {
                                matchedServiceName = found;
                            }
                        }

                        if (isCityMatch || matchedServiceName !== '' || isCategoryMatch) {
                            wrapper.style.display = '';
                            visibleWrappersCount++;

                            if (tag && matchedServiceName !== '') {
                                tag.textContent = `(${matchedServiceName})`;
                                tag.style.display = 'inline';
                            } else if (tag) {
                                tag.style.display = 'none';
                            }
                        } else {
                            wrapper.style.display = 'none';
                            if (tag) tag.style.display = 'none';
                        }
                    });

                    if (visibleWrappersCount > 0) {
                        item.style.display = '';
                        if (details) details.open = true;
                        regionalVisibleCount++;
                    } else {
                        item.style.display = 'none';
                        if (details) details.open = false;
                    }
                }
            });

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


    // ==========================================
    // 4. MÓDULO DE CLIMA Y BÚSQUEDA DINÁMICA
    // ==========================================
    function getWeatherInterpretation(code) {
        const codes = {
            0: { desc: 'Despejado', icon: '☀️' },
            1: { desc: 'Mayormente despejado', icon: '🌤️' },
            2: { desc: 'Parcialmente nublado', icon: '⛅' },
            3: { desc: 'Nublado', icon: '☁️' },
            45: { desc: 'Niebla', icon: '🌫️' },
            48: { desc: 'Niebla con escarcha', icon: '🌫️' },
            51: { desc: 'Llovizna ligera', icon: '🌦️' },
            53: { desc: 'Llovizna moderada', icon: '🌦️' },
            55: { desc: 'Llovizna densa', icon: '🌧️' },
            61: { desc: 'Lluvia ligera', icon: '🌧️' },
            63: { desc: 'Lluvia moderada', icon: '🌧️' },
            65: { desc: 'Lluvia fuerte', icon: '🌧️' },
            80: { desc: 'Chubascos ligeros', icon: '🌦️' },
            81: { desc: 'Chubascos moderados', icon: '🌧️' },
            82: { desc: 'Chubascos violentos', icon: '⛈️' },
            95: { desc: 'Tormenta eléctrica', icon: '⛈️' },
            96: { desc: 'Tormenta con granizo ligero', icon: '⛈️' },
            99: { desc: 'Tormenta con granizo fuerte', icon: '⛈️' }
        };
        return codes[code] || { desc: 'Clima variable', icon: '🌡️' };
    }

    // 1. Consultar clima por coordenadas exactas
    async function fetchWeatherData(lat, lon) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        try {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`;
            const response = await fetch(url, {
                signal: controller.signal,
                headers: { 'Accept': 'application/json' }
            });

            clearTimeout(timeoutId);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            return {
                temperature: data.current.temperature_2m,
                weathercode: data.current.weather_code
            };
        } catch (err) {
            clearTimeout(timeoutId);
            throw err;
        }
    }

    // 2. Búsqueda dinámica directa en la API de Open-Meteo
    async function searchCitiesApi(query) {
        if (!query || query.trim().length < 2) return [];

        try {
            const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=es&format=json&country_code=CO`;
            const response = await fetch(url, {
                headers: { 'Accept': 'application/json' }
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            if (data && Array.isArray(data.results)) {
                return data.results.map(item => ({
                    name: item.name,
                    admin1: item.admin1 || '', // Departamento/Estado
                    lat: item.latitude,
                    lon: item.longitude
                }));
            }
        } catch (err) {
            console.warn('24col: Error consultando Geocoding API:', err);
        }
        return [];
    }

    // 3. Actualizar la interfaz de usuario con los datos de la API
    async function updateWeatherUI(cityName, lat, lon) {
        const tempEl = document.getElementById('weatherTemp');
        const cityEl = document.getElementById('weatherCity');

        if (!tempEl || !cityEl) return;

        const validLat = parseFloat(lat);
        const validLon = parseFloat(lon);

        if (isNaN(validLat) || isNaN(validLon)) {
            tempEl.textContent = '⚠️ Sin coords';
            cityEl.textContent = `${cityName} (Sin ubicación)`;
            return;
        }

        tempEl.textContent = '...';
        cityEl.textContent = cityName;

        try {
            const weather = await fetchWeatherData(validLat, validLon);
            const info = getWeatherInterpretation(weather.weathercode);

            tempEl.textContent = `${info.icon} ${Math.round(weather.temperature)}°C`;
            cityEl.textContent = `${cityName} • ${info.desc}`;

            // Persistencia opcional en localStorage para mantener la elección del usuario
            localStorage.setItem('24col_last_city', JSON.stringify({ name: cityName, lat: validLat, lon: validLon }));
        } catch (err) {
            tempEl.textContent = '⚠️ Error';
            cityEl.textContent = `${cityName} (Sin datos)`;
        }
    }

    // 4. Búsqueda con retardo (Debounce)
    function setupWeatherSearch() {
        const searchInput = document.getElementById('weatherSearchInput');
        const resultsContainer = document.getElementById('weatherSearchResults');

        if (!searchInput || !resultsContainer) return;

        let debounceTimer = null;

        searchInput.addEventListener('input', function () {
            const query = this.value.trim();
            clearTimeout(debounceTimer);

            if (query.length < 2) {
                resultsContainer.style.display = 'none';
                resultsContainer.innerHTML = '';
                return;
            }

            debounceTimer = setTimeout(async () => {
                const cities = await searchCitiesApi(query);
                resultsContainer.innerHTML = '';

                if (cities.length === 0) {
                    const li = document.createElement('li');
                    li.textContent = 'No se encontraron resultados';
                    li.style.padding = '6px 10px';
                    li.style.fontSize = '11px';
                    li.style.color = '#888';
                    resultsContainer.appendChild(li);
                } else {
                    cities.forEach(city => {
                        const li = document.createElement('li');
                        const label = city.admin1 ? `${city.name}, ${city.admin1}` : city.name;

                        li.textContent = label;
                        li.style.padding = '6px 10px';
                        li.style.fontSize = '12px';
                        li.style.cursor = 'pointer';
                        li.style.borderBottom = '1px solid #eee';
                        li.style.color = '#333';

                        li.addEventListener('mouseenter', () => li.style.backgroundColor = '#f4f4f4');
                        li.addEventListener('mouseleave', () => li.style.backgroundColor = '#fff');

                        li.addEventListener('click', () => {
                            searchInput.value = '';
                            resultsContainer.style.display = 'none';
                            updateWeatherUI(label, city.lat, city.lon);
                        });

                        resultsContainer.appendChild(li);
                    });
                }
                resultsContainer.style.display = 'block';
            }, 350);
        });

        document.addEventListener('click', function (e) {
            if (!searchInput.contains(e.target) && !resultsContainer.contains(e.target)) {
                resultsContainer.style.display = 'none';
            }
        });
    }

    // 5. Inicialización sin ciudad por defecto
    function initMainWeatherCard() {
        setupWeatherSearch();

        const tempEl = document.getElementById('weatherTemp');
        const cityEl = document.getElementById('weatherCity');

        // Solo carga datos si el usuario ya tenía una ciudad guardada previamente en su navegador
        const savedCity = localStorage.getItem('24col_last_city');
        if (savedCity) {
            try {
                const parsed = JSON.parse(savedCity);
                if (parsed.name && parsed.lat && parsed.lon) {
                    updateWeatherUI(parsed.name, parsed.lat, parsed.lon);
                    return;
                }
            } catch (e) {}
        }

        // Estado inicial neutro (Sin ciudad precargada)
        if (tempEl && cityEl) {
            tempEl.textContent = '--°C';
            cityEl.textContent = 'Selecciona una ciudad';
        }
    }

    initMainWeatherCard();


    // ==========================================
    // 5. REORDENAMIENTO DE TARJETAS (DRAG & DROP)
    // ==========================================
    function setupCardsDragAndDrop() {
        const grid = document.querySelector('.cards-grid');
        if (!grid) return;

        let draggedItem = null;

        function restoreCardOrder() {
            const savedOrder = JSON.parse(localStorage.getItem('cardsOrder'));
            if (!savedOrder) return;

            const cardMap = new Map();
            grid.querySelectorAll('.card-item').forEach(card => {
                const title = card.querySelector('h3')?.textContent.trim();
                if (title) cardMap.set(title, card);
            });

            savedOrder.forEach(title => {
                const card = cardMap.get(title);
                if (card) grid.appendChild(card);
            });
        }

        function saveCardOrder() {
            const order = Array.from(grid.querySelectorAll('.card-item'))
                .map(card => card.querySelector('h3')?.textContent.trim())
                .filter(Boolean);
            localStorage.setItem('cardsOrder', JSON.stringify(order));
        }

        grid.addEventListener('dragstart', (e) => {
            const card = e.target.closest('.card-item');
            if (!card) return;

            draggedItem = card;
            setTimeout(() => card.classList.add('dragging'), 0);
        });

        grid.addEventListener('dragend', (e) => {
            const card = e.target.closest('.card-item');
            if (card) card.classList.remove('dragging');

            grid.querySelectorAll('.card-item').forEach(c => c.classList.remove('drag-over'));
            draggedItem = null;
            saveCardOrder();
        });

        grid.addEventListener('dragover', (e) => {
            e.preventDefault();
            const targetCard = e.target.closest('.card-item');

            if (!targetCard || targetCard === draggedItem) return;

            const rect = targetCard.getBoundingClientRect();
            const next = (e.clientY - rect.top) / (rect.bottom - rect.top) > 0.5;

            grid.insertBefore(draggedItem, next ? targetCard.nextSibling : targetCard);
        });

        restoreCardOrder();
    }

    setupCardsDragAndDrop();

});
