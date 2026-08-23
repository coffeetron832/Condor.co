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
    // AUXILIAR: Escape de HTML para evitar XSS
    // ==========================================
    function escapeHtml(text) {
        if (!text) return '';
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
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
    // 3. BUSCADOR FILTRADO ESTRICTO
    // ==========================================
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    const nationalTitle = document.getElementById('nationalSectionTitle');
    const regionalTitle = document.getElementById('regionalSectionTitle');
    const noResultsMsg = document.getElementById('noResultsMsg');
    const resultsContainer = document.getElementById('webSearchResults');

    if (searchForm) {
        searchForm.addEventListener('submit', (e) => e.preventDefault());
    }

    function normalizeText(text) {
        if (!text) return '';
        return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    const keywordSynonyms = {
        'hacienda': ['impuestos', 'predial', 'retencion', 'ica', 'dian'],
        'impuestos': ['hacienda', 'predial', 'vehiculos', 'ica', 'dian'],
        'predial': ['impuestos', 'hacienda', 'alcaldia'],
        'vehiculos': ['vehiculo', 'movilidad', 'tránsito', 'transito', 'patios', 'runt', 'simit'],
        'tránsito': ['transito', 'movilidad', 'vehiculos', 'simit', 'runt', 'fotomulta', 'patios'],
        'agua': ['acueducto', 'veolia', 'eaab', 'epm', 'emcali', 'triple a', 'acuacar', 'empopasto', 'ibal', 'essmar'],
        'luz': ['energia', 'electricidad', 'afinia', 'air-e', 'enel', 'epm', 'essa', 'celsia', 'chec', 'cens', 'cedenar', 'emsa'],
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
            const matchesSynonym = normSynonyms.some(s => s.includes(normQuery) || (normQuery.length >= 3 && s.includes(normQuery)));

            if (matchesKey || matchesSynonym) {
                terms.add(normKey);
                normSynonyms.forEach(s => terms.add(s));
            }
        });

        return Array.from(terms);
    }

    let searchDebounceTimer = null;

    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const rawQuery = this.value.trim();
            const query = normalizeText(rawQuery);
            const citiesList = getCitiesList();

            clearTimeout(searchDebounceTimer);

            let nationalVisibleCount = 0;
            let regionalVisibleCount = 0;

            const searchTerms = getExpandedSearchTerms(query);

            const isMatch = (textToTest) => {
                if (!textToTest || searchTerms.length === 0) return false;
                const normalizedTarget = normalizeText(textToTest);
                return searchTerms.some(term => normalizedTarget.includes(term));
            };

            // 1. FILTRADO INDIVIDUAL EN TARJETAS NACIONALES
            const allNationalCards = document.querySelectorAll('.card-item');

            allNationalCards.forEach(card => {
                const items = card.querySelectorAll('li, .searchable-item');
                let cardHasMatches = false;

                if (query === '') {
                    card.style.display = '';
                    items.forEach(item => item.style.display = '');
                    nationalVisibleCount++;
                } else {
                    items.forEach(item => {
                        const itemText = item.textContent || '';
                        
                        if (isMatch(itemText)) {
                            item.style.display = '';
                            cardHasMatches = true;
                        } else {
                            item.style.display = 'none';
                        }
                    });

                    if (cardHasMatches) {
                        card.style.display = '';
                        nationalVisibleCount++;
                    } else {
                        card.style.display = 'none';
                    }
                }
            });

            // 2. FILTRADO INDIVIDUAL EN MENÚS REGIONALES POR CIUDAD
            const categoryItems = document.querySelectorAll('.searchable-category');

            categoryItems.forEach(item => {
                const details = item.querySelector('details');
                const cityWrappers = item.querySelectorAll('.city-link-wrapper');

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

                        if (isCityMatch || matchedServiceName !== '') {
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

            // 3. LLAMADA AL MÓDULO EXTERNO DE WIKIPEDIA (MODIFICADO)
            if (window.WikiSearchModule) {
                searchDebounceTimer = setTimeout(() => {
                    window.WikiSearchModule.searchOfficialLinks(rawQuery, resultsContainer, escapeHtml, { isDropdown: true });
                }, 400);
            }
        });
    }

});
