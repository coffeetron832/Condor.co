/*
 * 24col - Módulo de Búsqueda Externa, Servicios y Autocompletado
 * Versión optimizada con control silencioso de 404 en la API REST de Wikipedia
 */

window.WikiSearchModule = (function () {

    let debounceTimer = null;

    function renderNoResults(container) {
        if (!container) return;
        container.innerHTML = `
            <li style="padding: 12px; text-align: center; font-size: 12px; color: var(--text-secondary, #666);">
                No se encontraron resultados para esta búsqueda.
            </li>
        `;
    }

    // 1. Sugerencias rápidas para el autocompletado (action=opensearch)
    async function fetchAutocompleteSuggestions(query) {
        const cleanQuery = query.trim().replace(/[^\w\sÁÉÍÓÚáéíóúÑñ]/gi, '');
        if (!cleanQuery || cleanQuery.length < 2) return [];

        try {
            const endpoint = `https://es.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(cleanQuery)}&limit=6&namespace=0&format=json&origin=*`;
            const res = await fetch(endpoint);
            if (!res.ok) return [];
            const data = await res.json();
            return data[1] || [];
        } catch (e) {
            return [];
        }
    }

    // 2. Renderizado del menú desplegable de autocompletado
    function renderSuggestions(suggestions, dropdownContainer, inputElement, onSelectCallback, escapeHtml) {
        if (!dropdownContainer) return;

        if (suggestions.length === 0) {
            dropdownContainer.style.display = 'none';
            dropdownContainer.innerHTML = '';
            return;
        }

        const html = suggestions.map((term, index) => `
            <li class="wiki-autocomplete-item" data-index="${index}" style="padding: 8px 12px; font-size: 13px; cursor: pointer; color: var(--text-color, #1e293b); border-bottom: 1px solid var(--border-color, #f1f5f9); transition: background 0.15s ease;">
                <span style="color: var(--text-secondary, #94a3b8); margin-right: 6px;">🔍</span> ${escapeHtml(term)}
            </li>
        `).join('');

        dropdownContainer.innerHTML = html;
        dropdownContainer.style.display = 'block';

        dropdownContainer.querySelectorAll('.wiki-autocomplete-item').forEach((item, idx) => {
            item.addEventListener('mouseenter', () => item.style.background = 'var(--bg-hover, #f8fafc)');
            item.addEventListener('mouseleave', () => item.style.background = 'transparent');
            item.addEventListener('click', () => {
                const selectedText = suggestions[idx];
                inputElement.value = selectedText;
                dropdownContainer.style.display = 'none';
                if (typeof onSelectCallback === 'function') {
                    onSelectCallback(selectedText);
                }
            });
        });
    }

    // 3. Método para adjuntar la lógica de autocompletado a un Input
    function attachAutocomplete(inputElement, dropdownContainer, onSelectCallback, escapeHtml) {
        if (!inputElement || !dropdownContainer) return;

        inputElement.addEventListener('input', (e) => {
            const query = e.target.value;

            clearTimeout(debounceTimer);

            if (query.trim().length < 2) {
                dropdownContainer.style.display = 'none';
                dropdownContainer.innerHTML = '';
                return;
            }

            debounceTimer = setTimeout(async () => {
                const suggestions = await fetchAutocompleteSuggestions(query);
                renderSuggestions(suggestions, dropdownContainer, inputElement, onSelectCallback, escapeHtml);
            }, 250);
        });

        document.addEventListener('click', (e) => {
            if (!inputElement.contains(e.target) && !dropdownContainer.contains(e.target)) {
                dropdownContainer.style.display = 'none';
            }
        });

        inputElement.addEventListener('focus', () => {
            if (dropdownContainer.children.length > 0) {
                dropdownContainer.style.display = 'block';
            }
        });
    }

    // Clasificación dinámica de badges
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

    async function fetchOfficialUrlFromWikidata(wikiItemId) {
        if (!wikiItemId) return null;
        try {
            const wikidataUrl = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${wikiItemId}&props=claims&format=json&origin=*`;
            const res = await fetch(wikidataUrl);
            if (!res.ok) return null;
            const data = await res.json();
            
            const claims = data.entities?.[wikiItemId]?.claims;
            const officialWebsiteClaim = claims?.P856;

            if (officialWebsiteClaim && officialWebsiteClaim.length > 0) {
                const rawUrl = officialWebsiteClaim[0].mainsnak?.datavalue?.value;
                if (rawUrl) return rawUrl;
            }
        } catch (e) {
            // Silencioso en caso de error
        }
        return null;
    }

    async function searchOfficialLinks(rawQuery, resultsContainer, escapeHtml) {
        if (!resultsContainer) return;

        // Sanitización previa del término a buscar
        const cleanQuery = rawQuery.trim().replace(/[^\w\sÁÉÍÓÚáéíóúÑñ]/gi, '');

        if (cleanQuery.length < 2) {
            resultsContainer.style.display = 'none';
            resultsContainer.innerHTML = '';
            return;
        }

        resultsContainer.innerHTML = `
            <li style="padding: 12px; text-align: center; font-size: 12px; color: var(--text-secondary, #666);">
                Buscando información y enlaces...
            </li>
        `;
        resultsContainer.style.display = 'block';

        try {
            let conceptCardHtml = '';
            const validResults = [];

            // 1. Intentar obtener el resumen principal (Manejo seguro de 404)
            try {
                const summaryEndpoint = `https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanQuery)}?redirect=true`;
                const summaryRes = await fetch(summaryEndpoint);

                // Solo procesamos si responde 200 OK (evita lanzar excepciones en 404)
                if (summaryRes.ok) {
                    const summaryData = await summaryRes.json();
                    if (summaryData.type === 'standard' && summaryData.extract) {
                        const wikiUrl = summaryData.content_urls?.desktop?.page || `https://es.wikipedia.org/wiki/${encodeURIComponent(summaryData.title)}`;
                        const thumbnail = summaryData.thumbnail?.source 
                            ? `<img src="${summaryData.thumbnail.source}" alt="${escapeHtml(summaryData.title)}" style="width: 48px; height: 48px; object-fit: cover; border-radius: 6px; margin-right: 10px; flex-shrink: 0;" />` 
                            : '';

                        conceptCardHtml = `
                            <li style="border-bottom: 2px solid var(--border-color, #e2e8f0); background: var(--bg-hover, #f8fafc); padding: 12px 14px;">
                                <div style="display: flex; align-items: flex-start;">
                                    ${thumbnail}
                                    <div style="flex-grow: 1;">
                                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                                            <span style="font-size: 13px; font-weight: 700; color: var(--text-color, #1e293b);">${escapeHtml(summaryData.title)}</span>
                                            <span style="font-size: 9px; font-weight: 600; background: #e0e7ff; color: #3730a3; padding: 2px 6px; border-radius: 4px;">Concepto / Definición</span>
                                        </div>
                                        <div style="font-size: 11px; color: var(--text-secondary, #475569); line-height: 1.4; margin-bottom: 6px;">
                                            ${escapeHtml(summaryData.extract)}
                                        </div>
                                        <a href="${wikiUrl}" target="_blank" rel="noopener noreferrer" style="font-size: 10px; color: var(--link-color, #2563eb); font-weight: 600; text-decoration: none;">
                                            Ver más detalles en Wikipedia &rarr;
                                        </a>
                                    </div>
                                </div>
                            </li>
                        `;
                    }
                }
            } catch (err) {
                // Silenciamos fallos de red puntuales
            }

            // 2. Búsqueda profunda vía API de Query
            const searchEndpoint = `https://es.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cleanQuery)}&format=json&origin=*`;
            const searchRes = await fetch(searchEndpoint);
            
            if (searchRes.ok) {
                const searchData = await searchRes.json();
                const candidates = searchData.query?.search || [];

                for (const candidate of candidates.slice(0, 5)) {
                    const pageEndpoint = `https://es.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(candidate.title)}&prop=pageprops|extlinks&elexpandurl=1&redirects=1&format=json&origin=*`;
                    const pageRes = await fetch(pageEndpoint);
                    
                    if (!pageRes.ok) continue;
                    
                    const pageData = await pageRes.json();
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
                                'bbc.com', 'nytimes.com', 'google.com', 'github.com', 'issuu.com'
                            ];

                            const cleanLink = links.find(url => !ignoredDomains.some(domain => url.toLowerCase().includes(domain)));
                            if (cleanLink) {
                                externalUrl = cleanLink;
                                isFallback = true;
                            }
                        }
                    }

                    const cleanSnippet = candidate.snippet.replace(/<\/?[^>]+(>|$)/g, "");

                    if (externalUrl) {
                        if (!validResults.some(r => r.url === externalUrl)) {
                            validResults.push({ title: candidate.title, snippet: cleanSnippet, url: externalUrl, isWikiPage: false, isFallback });
                        }
                    } else {
                        const wikiArticleUrl = `https://es.wikipedia.org/wiki/${encodeURIComponent(candidate.title)}`;
                        if (!validResults.some(r => r.url === wikiArticleUrl)) {
                            validResults.push({ title: candidate.title, snippet: cleanSnippet, url: wikiArticleUrl, isWikiPage: true, isFallback: false });
                        }
                    }
                }
            }

            // 3. Renderizado final
            if (validResults.length > 0) {
                const listHtml = validResults.map(item => {
                    const badge = getBadgeConfig(item.url, item.isWikiPage, item.isFallback);
                    return `
                        <li style="border-bottom: 1px solid var(--border-color, #eee);">
                            <a href="${item.url}" target="_blank" rel="noopener noreferrer" style="display: block; padding: 10px 14px; text-decoration: none; color: var(--text-color, #333);">
                                <div style="font-size: 13px; color: var(--link-color, #2563eb); font-weight: 600; margin-bottom: 3px; display: flex; justify-content: space-between; align-items: center;">
                                    <span>${escapeHtml(item.title)}</span>
                                    <span style="font-size: 9px; font-weight: 600; background: ${badge.bg}; color: ${badge.color}; padding: 2px 6px; border-radius: 3px;">${badge.text}</span>
                                </div>
                                <div style="font-size: 11px; color: var(--text-secondary, #666); line-height: 1.3; margin-bottom: 4px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                                    ${escapeHtml(item.snippet)}...
                                </div>
                                <div style="font-size: 10px; color: ${item.isWikiPage ? '#475569' : '#16a34a'}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                    ${escapeHtml(item.url)}
                                </div>
                            </a>
                        </li>
                    `;
                }).join('');

                resultsContainer.innerHTML = conceptCardHtml + listHtml;
            } else if (conceptCardHtml) {
                resultsContainer.innerHTML = conceptCardHtml;
            } else {
                renderNoResults(resultsContainer);
            }

        } catch (error) {
            renderNoResults(resultsContainer);
        }
    }

    return {
        attachAutocomplete,
        searchOfficialLinks
    };

})();
