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
    // 4. MÓDULO DE CLIMA ROBUSTO (OPEN-METEO + FALLBACK)
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

    async function fetchWeatherData(lat, lon) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        try {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}&current_weather=true`;
            
            const response = await fetch(url, {
                signal: controller.signal,
                headers: { 'Accept': 'application/json' }
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Error en servidor Open-Meteo`);
            }

            const data = await response.json();
            
            if (!data.current_weather) {
                throw new Error('Estructura de respuesta inválida');
            }

            return data.current_weather;
        } catch (err) {
            clearTimeout(timeoutId);
            throw err;
        }
    }

    async function fetchBackupWeatherData(cityName) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        try {
            const cleanCity = encodeURIComponent(cityName.split('/')[0].trim());
            const url = `https://wttr.in/${cleanCity}?format=j1`;

            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!response.ok) throw new Error('wttr.in no disponible');

            const data = await response.json();
            const current = data.current_condition[0];

            return {
                temperature: parseFloat(current.temp_C),
                weathercode: 1,
                customDesc: current.lang_es && current.lang_es[0] ? current.lang_es[0].value : current.weatherDesc[0].value
            };
        } catch (err) {
            clearTimeout(timeoutId);
            throw err;
        }
    }

    async function initMainWeatherCard() {
        const tempEl = document.getElementById('weatherTemp');
        const cityEl = document.getElementById('weatherCity');

        if (!tempEl || !cityEl) return;

        const urlParams = new URLSearchParams(window.location.search);
        const cityIdFromUrl = urlParams.get('city');
        const citiesList = getCitiesList();

        let targetCity = null;

        if (cityIdFromUrl) {
            targetCity = citiesList.find(c => c.id === cityIdFromUrl);
        }

        if (!targetCity) {
            targetCity = citiesList.find(c => c.id === 'bogota') || {
                name: 'Bogotá D.C.',
                lat: 4.6097,
                lon: -74.0817
            };
        }

        // Intento 1: Open-Meteo
        try {
            const weather = await fetchWeatherData(targetCity.lat, targetCity.lon);
            const info = getWeatherInterpretation(weather.weathercode);

            tempEl.textContent = `${info.icon} ${Math.round(weather.temperature)}°C`;
            cityEl.textContent = `${targetCity.name} • ${info.desc}`;
            return;
        } catch (primaryErr) {
            console.warn('24col: Open-Meteo no respondió, intentando servicio de respaldo...', primaryErr);
        }

        // Intento 2: Respaldo (wttr.in)
        try {
            const backupWeather = await fetchBackupWeatherData(targetCity.name);
            tempEl.textContent = `🌡️ ${Math.round(backupWeather.temperature)}°C`;
            cityEl.textContent = `${targetCity.name} • ${backupWeather.customDesc}`;
        } catch (backupErr) {
            console.warn('24col: No se pudo conectar a ningún servicio meteorológico:', backupErr);
            tempEl.textContent = 'Clima local';
            cityEl.textContent = `${targetCity.name}`;
        }
    }

    initMainWeatherCard();

});
