/*
 * 24col - Directorio Ciudadano Colombiano
 * Copyright (C) 2026 jahp
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const cityParam = urlParams.get('city') || 'bogota';
    const catParam = urlParams.get('cat') || 'impuestos';

    // Obtener metadatos de la ciudad o fallback predeterminado
    const cityInfo = CITY_META_DATA[cityParam] || CITY_META_DATA['bogota'];
    const categoryTitle = CATEGORY_NAMES[catParam] || 'Servicios y Trámites Locales';

    // Renderizado en el DOM (Asegúrate de tener los elementos con estos IDs en ciudad.html)
    const cityTitleEl = document.getElementById('cityTitle');
    const categoryTitleEl = document.getElementById('categoryTitle');
    const cityImgEl = document.getElementById('cityImage');
    const cityCreditEl = document.getElementById('cityCredit');
    const linksContainerEl = document.getElementById('cityLinksContainer');

    if (cityTitleEl) cityTitleEl.textContent = cityInfo.fullName;
    if (categoryTitleEl) categoryTitleEl.textContent = categoryTitle;
    if (cityImgEl) {
        cityImgEl.src = cityInfo.image;
        cityImgEl.alt = `Vista panorámica de ${cityInfo.fullName}`;
    }
    if (cityCreditEl) cityCreditEl.innerHTML = cityInfo.credit;

    // Renderizar lista de enlaces para la ciudad y categoría seleccionada
    if (linksContainerEl) {
        const cityCategoryLinks = (LINKS_DATA[cityParam] && LINKS_DATA[cityParam][catParam]) 
            ? LINKS_DATA[cityParam][catParam] 
            : [];

        if (cityCategoryLinks.length > 0) {
            linksContainerEl.innerHTML = cityCategoryLinks.map(link => `
                <div class="link-card">
                    <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="link-title">
                        ${link.name}
                    </a>
                    <p class="link-description">${link.desc}</p>
                </div>
            `).join('');
        } else {
            linksContainerEl.innerHTML = `<p class="no-data">No se encontraron servicios registrados para esta categoría en la ciudad seleccionada.</p>`;
        }
    }
});
