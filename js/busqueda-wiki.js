/*
 * 24col - Módulo de Búsqueda Externa en Wikipedia
 * Extrae y valida enlaces oficiales asociados a las búsquedas del usuario.
 */

window.WikiSearchModule = (function () {

    function renderNoResults(container) {
        if (!container) return;
        container.innerHTML = `
            <li style="padding: 12px; text-align: center; font-size: 12px; color: var(--text-secondary, #666);">
                No se encontraron enlaces oficiales para esta búsqueda.
            </li>
        `;
    }

    async function searchOfficialLinks(rawQuery, resultsContainer, escapeHtml) {
        if (!resultsContainer) return;

        if (rawQuery.length < 3) {
            resultsContainer.style.display = 'none';
            resultsContainer.innerHTML = '';
            return;
        }

        resultsContainer.innerHTML = `
            <li style="padding: 12px; text-align: center; font-size: 12px; color: #666;">
                Buscando enlaces oficiales...
            </li>
        `;
        resultsContainer.style.display = 'block';

        try {
            const searchEndpoint = `https://es.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(rawQuery)}&format=json&origin=*`;
            const searchRes = await fetch(searchEndpoint);
            const searchData = await searchRes.json();
            const candidates = searchData.query?.search || [];

            if (candidates.length === 0) {
                renderNoResults(resultsContainer);
                return;
            }

            const topCandidates = candidates.slice(0, 5);
            const validResults = [];

            for (const candidate of topCandidates) {
                const pageEndpoint = `https://es.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(candidate.title)}&prop=extlinks&elexpandurl=1&format=json&origin=*`;
                const pageRes = await fetch(pageEndpoint);
                const pageData = await pageRes.json();

                const pages = pageData.query?.pages || {};
                const pageKey = Object.keys(pages)[0];

                if (pageKey !== "-1" && pages[pageKey].extlinks) {
                    const links = pages[pageKey].extlinks.map(l => l['*']);

                    const officialUrl = links.find(url =>
                        !url.includes('facebook.com') &&
                        !url.includes('twitter.com') &&
                        !url.includes('instagram.com') &&
                        !url.includes('youtube.com') &&
                        !url.includes('archive.org') &&
                        !url.includes('wikimedia.org') &&
                        !url.includes('wikipedia.org') &&
                        !url.includes('doi.org')
                    );

                    if (officialUrl) {
                        validResults.push({
                            title: candidate.title,
                            snippet: candidate.snippet.replace(/<\/?[^>]+(>|$)/g, ""),
                            url: officialUrl
                        });
                    }
                }
            }

            if (validResults.length > 0) {
                resultsContainer.innerHTML = validResults.map(item => `
                    <li style="border-bottom: 1px solid var(--border-color, #eee);">
                        <a href="${item.url}" target="_blank" rel="noopener noreferrer" style="display: block; padding: 10px 14px; text-decoration: none; color: var(--text-color, #333);">
                            <div style="font-size: 13px; color: var(--link-color, #2563eb); font-weight: 600; margin-bottom: 3px; display: flex; justify-content: space-between; align-items: center;">
                                <span>${escapeHtml(item.title)}</span>
                                <span style="font-size: 9px; background: #e0f2fe; color: #0369a1; padding: 2px 5px; border-radius: 3px;">Sitio Oficial</span>
                            </div>
                            <div style="font-size: 11px; color: var(--text-secondary, #666); line-height: 1.3; margin-bottom: 4px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                                ${escapeHtml(item.snippet)}...
                            </div>
                            <div style="font-size: 10px; color: #16a34a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                ${escapeHtml(item.url)}
                            </div>
                        </a>
                    </li>
                `).join('');
            } else {
                renderNoResults(resultsContainer);
            }

        } catch (error) {
            console.error('Error buscando páginas en Wikipedia:', error);
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
