/*
 * 24col - Módulo de Búsqueda Externa, Servicios y Conceptos
 * Extrae de forma 100% dinámica el sitio web oficial vía Wikidata (Propiedad P856)
 * con filtrado estricto de enlaces secundarios y manejo de redirecciones.
 */

window.WikiSearchModule = (function () {

    // Variable para rastrear la última búsqueda y descartar respuestas obsoletas
    let currentSearchId = 0;

    function renderNoResults(container) {
        if (!container) return;
        container.innerHTML = `
            <li style="padding: 16px; text-align: center; font-size: 13px; color: var(--text-secondary, #64748b); font-family: Arial, Helvetica, sans-serif;">
                No se encontraron resultados para esta búsqueda.
            </li>
        `;
    }

    // Helper para obtener la URL del favicon según el dominio o si es Wikipedia
    function getFaviconUrl(url, isWikiPage = false) {
        if (isWikiPage || url.includes('wikipedia.org')) {
            return 'https://en.wikipedia.org/static/favicon/wikipedia.ico';
        }
        try {
            const domain = new URL(url).hostname;
            return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
        } catch (e) {
            return 'https://en.wikipedia.org/static/favicon/wikipedia.ico';
        }
    }

    // Clasificación dinámica de badges según la URL o dominio devuelto
    function getBadgeConfig(url, isWikiPage = false, isExternalFallback = false) {
        if (isWikiPage || url.includes('wikipedia.org')) {
            return { text: 'Artículo Enciclopedia', bg: '#e2e8f0', color: '#334155' };
        }
        
        const lowerUrl = url.toLowerCase();
        
        if (lowerUrl.includes('.gov.co') || lowerUrl.includes('.gov') || lowerUrl.includes('.mil.co')) {
            return { text: 'Sitio Oficial Gub.', bg: '#dcfce7', color: '#15803d' };
        }

        if (lowerUrl.includes('.edu.co') || lowerUrl.includes('.edu')) {
            return { text: 'Portal Educativo', bg: '#feefc3', color: '#b45309' };
        }

        if (lowerUrl.includes('.org')) {
            return { text: 'Organización', bg: '#e0f2fe', color: '#0369a1' };
        }

        if (isExternalFallback) {
            return { text: 'Enlace Relacionado', bg: '#f1f5f9', color: '#475569' };
        }
        
        return { text: 'Sitio Web Oficial', bg: '#dbeafe', color: '#1e40af' };
    }

    // Consulta la propiedad P856 (Sitio web oficial) en Wikidata
    async function fetchOfficialUrlFromWikidata(wikiItemId) {
        if (!wikiItemId) return null;
        try {
            const wikidataUrl = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${wikiItemId}&props=claims&format=json&origin=*`;
            const res = await fetch(wikidataUrl);
            const data = await res.json();
            
            const claims = data.entities?.[wikiItemId]?.claims;
            const officialWebsiteClaim = claims?.P856;

            if (officialWebsiteClaim && officialWebsiteClaim.length > 0) {
                const rawUrl = officialWebsiteClaim[0].mainsnak?.datavalue?.value;
                if (rawUrl) return rawUrl;
            }
        } catch (e) {
            console.warn('Error al consultar Wikidata (P856):', e);
        }
        return null;
    }

    /**
     * Búsqueda de enlaces y conceptos.
     * @param {string} rawQuery - Término a buscar
     * @param {HTMLElement} resultsContainer - Elemento contenedor UL o DIV
     * @param {Function} escapeHtml - Función escapadora de caracteres HTML
     * @param {Object} options - Opciones: { limit: 12, isDropdown: false }
     */
    async function searchOfficialLinks(rawQuery, resultsContainer, escapeHtml = (text => text), options = {}) {
        if (!resultsContainer) return;

        const searchId = ++currentSearchId; // Identificador único para esta ejecución
        const isDropdown = options.isDropdown || false;
        const targetLimit = isDropdown ? 1 : (options.limit || 12);
        const trimmedQuery = rawQuery.trim();

        if (trimmedQuery.length < 2) {
            resultsContainer.style.display = 'none';
            resultsContainer.innerHTML = '';
            return;
        }

        resultsContainer.innerHTML = `
            <li style="padding: 12px; text-align: center; font-size: 13px; color: var(--text-secondary, #64748b); font-family: Arial, Helvetica, sans-serif;">
                Buscando "${escapeHtml(trimmedQuery)}"...
            </li>
        `;
        resultsContainer.style.display = 'block';

        try {
            let conceptCardHtml = '';
            const validResults = [];

            // 1. Obtener Tarjeta de Concepto (Solo si NO es dropdown)
            if (!isDropdown) {
                try {
                    const summaryEndpoint = `https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(trimmedQuery)}?redirect=true`;
                    const summaryRes = await fetch(summaryEndpoint);

                    if (summaryRes.ok) {
                        const summaryData = await summaryRes.json();
                        if (summaryData.type === 'standard' && summaryData.extract) {
                            const wikiUrl = summaryData.content_urls?.desktop?.page || `https://es.wikipedia.org/wiki/${encodeURIComponent(summaryData.title)}`;
                            const thumbnail = summaryData.thumbnail?.source 
                                ? `<img src="${summaryData.thumbnail.source}" alt="${escapeHtml(summaryData.title)}" style="width: 54px; height: 54px; object-fit: cover; border-radius: 6px; margin-right: 14px; flex-shrink: 0;" />` 
                                : '';

                            conceptCardHtml = `
                                <li style="border-bottom: 2px solid var(--border-color, #e2e8f0); background: var(--bg-hover, #f8fafc); padding: 16px; margin-bottom: 12px; border-radius: 8px; font-family: Arial, Helvetica, sans-serif;">
                                    <div style="display: flex; align-items: flex-start;">
                                        ${thumbnail}
                                        <div style="flex-grow: 1;">
                                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                                                <span style="font-size: 14px; font-weight: bold; color: var(--text-color, #1e293b);">${escapeHtml(summaryData.title)}</span>
                                                <span style="font-size: 10px; font-weight: bold; background: #e0e7ff; color: #3730a3; padding: 3px 8px; border-radius: 4px;">Concepto / Definición</span>
                                            </div>
                                            <div style="font-size: 12px; color: var(--text-secondary, #475569); line-height: 1.4; margin-bottom: 8px;">
                                                ${escapeHtml(summaryData.extract)}
                                            </div>
                                            <a href="${wikiUrl}" target="_blank" rel="noopener noreferrer" style="font-size: 11px; color: var(--link-color, #2563eb); font-weight: bold; text-decoration: none;">
                                                Ver artículo completo en Wikipedia &rarr;
                                            </a>
                                        </div>
                                    </div>
                                </li>
                            `;
                        }
                    }
                } catch (err) {
                    console.warn('No se pudo obtener el resumen de concepto:', err);
                }
            }

            // 2. Búsqueda de páginas en Wikipedia
            // En modo dropdown consultamos hasta 3 candidatos para encontrar rápidamente el 1er enlace válido sin hacer fetch innecesario
            const fetchLimit = isDropdown ? 3 : targetLimit;
            const searchEndpoint = `https://es.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(trimmedQuery)}&format=json&origin=*`;
            const searchRes = await fetch(searchEndpoint);
            const searchData = await searchRes.json();
            const candidates = searchData.query?.search || [];

            const topCandidates = candidates.slice(0, fetchLimit);

            for (const candidate of topCandidates) {
                // Verificar si hay una nueva búsqueda en curso o si ya se alcanzó el límite requerido
                if (searchId !== currentSearchId) return;
                if (validResults.length >= targetLimit) break;

                const pageEndpoint = `https://es.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(candidate.title)}&prop=pageprops|extlinks&elexpandurl=1&redirects=1&format=json&origin=*`;
                const pageRes = await fetch(pageEndpoint);
                const pageData = await pageRes.json();

                if (searchId !== currentSearchId) return;

                const pages = pageData.query?.pages || {};
                const pageKey = Object.keys(pages)[0];

                let externalUrl = null;
                let isFallback = false;

                if (pageKey !== "-1") {
                    const pageObj = pages[pageKey];
                    const wikibaseItemId = pageObj.pageprops?.wikibase_item;

                    if (wikibaseItemId) {
                        externalUrl = await fetchOfficialUrlFromWikidata(wikibaseItemId);
                    }

                    if (!externalUrl && pageObj.extlinks) {
                        const links = pageObj.extlinks.map(l => l['*']);
                        
                        const ignoredDomains = [
                            'archive.org', 'wikimedia.org', 'wikipedia.org', 'doi.org', 'w3.org',
                            'facebook.com', 'twitter.com', 'instagram.com', 'youtube.com', 'linkedin.com',
                            'eltiempo.com', 'elespectador.com', 'semana.com', 'caracol.com.co', 'rcnradio.com',
                            'bbc.com', 'nytimes.com', 'google.com', 'github.com', 'issuu.com', 'dialnet.unirioja.es'
                        ];

                        const cleanLink = links.find(url => {
                            const lower = url.toLowerCase();
                            return !ignoredDomains.some(domain => lower.includes(domain));
                        });

                        if (cleanLink) {
                            externalUrl = cleanLink;
                            isFallback = true;
                        }
                    }
                }

                const cleanSnippet = candidate.snippet.replace(/<\/?[^>]+(>|$)/g, "");

                if (externalUrl) {
                    if (!validResults.some(r => r.url === externalUrl)) {
                        validResults.push({
                            title: candidate.title,
                            snippet: cleanSnippet,
                            url: externalUrl,
                            isWikiPage: false,
                            isFallback: isFallback
                        });
                    }
                } else {
                    const wikiArticleUrl = `https://es.wikipedia.org/wiki/${encodeURIComponent(candidate.title)}`;
                    if (!validResults.some(r => r.url === wikiArticleUrl)) {
                        validResults.push({
                            title: candidate.title,
                            snippet: cleanSnippet,
                            url: wikiArticleUrl,
                            isWikiPage: true,
                            isFallback: false
                        });
                    }
                }

                // Evaluar la interrupción inmediata para prevenir la adición de más resultados
                if (validResults.length >= targetLimit) break;
            }

            // Si se inició otra búsqueda mientras terminaba esta, descartamos renderizar
            if (searchId !== currentSearchId) return;

            // 3. Renderizado estrictamente limitado según targetLimit
            const displayResults = validResults.slice(0, targetLimit);

            if (displayResults.length > 0) {
                let listHtml = displayResults.map(item => {
                    const badge = getBadgeConfig(item.url, item.isWikiPage, item.isFallback);
                    const faviconUrl = getFaviconUrl(item.url, item.isWikiPage);

                    return `
                        <li style="border-bottom: 1px solid var(--border-color, #e2e8f0); margin-bottom: 4px; font-family: Arial, Helvetica, sans-serif;">
                            <a href="${item.url}" target="_blank" rel="noopener noreferrer" style="display: block; padding: 10px 12px; text-decoration: none; color: var(--text-color, #1e293b);">
                                <div style="font-size: 13px; color: var(--link-color, #2563eb); font-weight: bold; margin-bottom: 2px; display: flex; justify-content: space-between; align-items: center;">
                                    <span style="display: inline-flex; align-items: center; gap: 8px;">
                                        <img src="${faviconUrl}" alt="" style="width: 16px; height: 16px; border-radius: 2px; flex-shrink: 0;" onError="this.style.display='none';" />
                                        ${escapeHtml(item.title)}
                                    </span>
                                    <span style="font-size: 9px; font-weight: bold; background: ${badge.bg}; color: ${badge.color}; padding: 2px 6px; border-radius: 4px;">${badge.text}</span>
                                </div>
                                <div style="font-size: 11px; color: var(--text-secondary, #64748b); line-height: 1.3; margin-bottom: 4px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                                    ${escapeHtml(item.snippet)}...
                                </div>
                                <div style="font-size: 10px; color: ${item.isWikiPage ? '#475569' : '#16a34a'}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                    ${escapeHtml(item.url)}
                                </div>
                            </a>
                        </li>
                    `;
                }).join('');

                if (isDropdown) {
                    listHtml += `
                        <li style="text-align: center; background: var(--bg-hover, #f8fafc); border-top: 1px solid var(--border-color, #e2e8f0); font-family: Arial, Helvetica, sans-serif;">
                            <a href="resultados.html?q=${encodeURIComponent(trimmedQuery)}" style="display: block; padding: 10px; font-size: 12px; font-weight: bold; color: var(--link-color, #2563eb); text-decoration: none;">
                                Ver todos los resultados para "${escapeHtml(trimmedQuery)}" &rarr;
                            </a>
                        </li>
                    `;
                }

                resultsContainer.innerHTML = conceptCardHtml + listHtml;
            } else if (conceptCardHtml) {
                resultsContainer.innerHTML = conceptCardHtml;
            } else {
                renderNoResults(resultsContainer);
            }

        } catch (error) {
            if (searchId !== currentSearchId) return;
            console.error('Error buscando información:', error);
            resultsContainer.innerHTML = `
                <li style="padding: 12px; text-align: center; font-size: 12px; color: #dc2626; font-family: Arial, Helvetica, sans-serif;">
                    No se pudo realizar la búsqueda web.
                </li>
            `;
        }
    }

    function initSearchFormListener() {
        const searchForm = document.getElementById('searchForm');
        const searchInput = document.getElementById('searchInput');
        const webSearchResults = document.getElementById('webSearchResults');

        if (searchInput && webSearchResults) {
            let debounceTimer = null;

            searchInput.addEventListener('input', (e) => {
                clearTimeout(debounceTimer);
                const query = e.target.value.trim();

                if (query.length < 2) {
                    webSearchResults.style.display = 'none';
                    webSearchResults.innerHTML = '';
                    return;
                }

                debounceTimer = setTimeout(() => {
                    searchOfficialLinks(query, webSearchResults, (text => text), { isDropdown: true });
                }, 350);
            });
        }

        if (searchForm && searchInput) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const query = searchInput.value.trim();

                if (query.length >= 2) {
                    window.location.href = `resultados.html?q=${encodeURIComponent(query)}`;
                }
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSearchFormListener);
    } else {
        initSearchFormListener();
    }

    return {
        searchOfficialLinks
    };

})();
