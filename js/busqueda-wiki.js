/*
 * 24col - Módulo de Búsqueda Externa, Servicios y Conceptos
 * Garantiza la extracción de links directos para sitios oficiales,
 * entidades gubernamentales y plataformas masivas (Facebook, YouTube, etc.).
 */

window.WikiSearchModule = (function () {

    function renderNoResults(container) {
        if (!container) return;
        container.innerHTML = `
            <li style="padding: 12px; text-align: center; font-size: 12px; color: var(--text-secondary, #666);">
                No se encontraron resultados para esta búsqueda.
            </li>
        `;
    }

    // Mapeo directo para plataformas masivas populares (Fallback inmediato)
    const DIRECT_PLATFORMS = {
        'facebook': 'https://www.facebook.com',
        'instagram': 'https://www.instagram.com',
        'twitter': 'https://www.x.com',
        'x': 'https://www.x.com',
        'youtube': 'https://www.youtube.com',
        'linkedin': 'https://www.linkedin.com',
        'whatsapp': 'https://www.whatsapp.com',
        'tiktok': 'https://www.tiktok.com',
        'spotify': 'https://www.spotify.com',
        'netflix': 'https://www.netflix.com',
        'github': 'https://www.github.com'
    };

    // Clasificación dinámica de badges según dominio
    function getBadgeConfig(url, isWikiPage = false) {
        if (isWikiPage || url.includes('wikipedia.org')) {
            return { text: 'Artículo Enciclopedia', bg: '#e2e8f0', color: '#334155' };
        }
        
        const lowerUrl = url.toLowerCase();
        
        if (lowerUrl.includes('.gov.co') || lowerUrl.includes('.gov') || lowerUrl.includes('.mil.co')) {
            return { text: 'Sitio Oficial', bg: '#dcfce7', color: '#15803d' };
        }
        
        if (Object.values(DIRECT_PLATFORMS).some(p => lowerUrl.includes(p.replace('https://www.', '')))) {
            return { text: 'Plataforma Oficial', bg: '#dbeafe', color: '#1e40af' };
        }

        if (lowerUrl.includes('.edu.co') || lowerUrl.includes('.edu')) {
            return { text: 'Portal Educativo', bg: '#feefc3', color: '#b45309' };
        }

        if (lowerUrl.includes('.org')) {
            return { text: 'Organización', bg: '#e0f2fe', color: '#0369a1' };
        }
        
        return { text: 'Sitio Oficial', bg: '#f3e8ff', color: '#6b21a8' };
    }

    async function searchOfficialLinks(rawQuery, resultsContainer, escapeHtml) {
        if (!resultsContainer) return;

        const trimmedQuery = rawQuery.trim();

        if (trimmedQuery.length < 3) {
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

            // 1. Detección inmediata si la búsqueda coincide con una plataforma masiva
            const cleanQueryKey = trimmedQuery.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (DIRECT_PLATFORMS[cleanQueryKey]) {
                const officialUrl = DIRECT_PLATFORMS[cleanQueryKey];
                validResults.push({
                    title: trimmedQuery.charAt(0).toUpperCase() + trimmedQuery.slice(1) + " (Sitio Oficial)",
                    snippet: `Acceso directo al portal web oficial de ${trimmedQuery}.`,
                    url: officialUrl,
                    isWikiPage: false
                });
            }

            // 2. Obtención de resumen / Tarjeta principal de concepto
            try {
                const summaryEndpoint = `https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(trimmedQuery)}?redirect=true`;
                const summaryRes = await fetch(summaryEndpoint);

                if (summaryRes.ok) {
                    const summaryData = await summaryRes.json();
                    if (summaryData.type === 'standard' && summaryData.extract) {
                        const wikiUrl = summaryData.content_urls?.desktop?.page || `https://es.wikipedia.org/wiki/${encodeURIComponent(summaryData.title)}`;
                        const thumbnail = summaryData.thumbnail?.source ? `<img src="${summaryData.thumbnail.source}" alt="${escapeHtml(summaryData.title)}" style="width: 48px; height: 48px; object-fit: cover; border-radius: 6px; margin-right: 10px; flex-shrink: 0;" />` : '';

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
                console.warn('No se pudo obtener el resumen de concepto:', err);
            }

            // 3. Búsqueda de candidatos y extracción de enlaces externos
            const searchEndpoint = `https://es.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(trimmedQuery)}&format=json&origin=*`;
            const searchRes = await fetch(searchEndpoint);
            const searchData = await searchRes.json();
            const candidates = searchData.query?.search || [];

            const topCandidates = candidates.slice(0, 5);

            for (const candidate of topCandidates) {
                const pageEndpoint = `https://es.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(candidate.title)}&prop=extlinks&elexpandurl=1&redirects=1&format=json&origin=*`;
                const pageRes = await fetch(pageEndpoint);
                const pageData = await pageRes.json();

                const pages = pageData.query?.pages || {};
                const pageKey = Object.keys(pages)[0];

                let externalUrl = null;

                if (pageKey !== "-1" && pages[pageKey].extlinks) {
                    const links = pages[pageKey].extlinks.map(l => l['*']);

                    // Filtrar dominios no deseados
                    externalUrl = links.find(url =>
                        !url.includes('archive.org') &&
                        !url.includes('wikimedia.org') &&
                        !url.includes('wikipedia.org') &&
                        !url.includes('doi.org') &&
                        !url.includes('w3.org')
                    );
                }

                const cleanSnippet = candidate.snippet.replace(/<\/?[^>]+(>|$)/g, "");

                if (externalUrl) {
                    // Evitar añadir duplicados
                    if (!validResults.some(r => r.url === externalUrl)) {
                        validResults.push({
                            title: candidate.title,
                            snippet: cleanSnippet,
                            url: externalUrl,
                            isWikiPage: false
                        });
                    }
                } else {
                    const wikiArticleUrl = `https://es.wikipedia.org/wiki/${encodeURIComponent(candidate.title)}`;
                    if (!validResults.some(r => r.url === wikiArticleUrl)) {
                        validResults.push({
                            title: candidate.title,
                            snippet: cleanSnippet,
                            url: wikiArticleUrl,
                            isWikiPage: true
                        });
                    }
                }
            }

            // 4. Renderizado Final
            if (validResults.length > 0) {
                const listHtml = validResults.map(item => {
                    const badge = getBadgeConfig(item.url, item.isWikiPage);
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
            console.error('Error buscando información:', error);
            resultsContainer.innerHTML = `
                <li style="padding: 12px; text-align: center; font-size: 12px; color: #dc2626;">
                    No se pudo realizar la búsqueda web.
                </li>
            `;
        }
    }

    return {
        searchOfficialLinks
    };

})();
