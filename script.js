document.addEventListener('DOMContentLoaded', function () {

    // ==========================================
    // 1. BASE DE DATOS UNIFICADA (INTEROPERABLE)
    // ==========================================
    const CITIES_DATA = [
        { id: 'barranquilla', name: 'Barranquilla', dept: 'Atl.' },
        { id: 'bogota', name: 'Bogotá D.C.', dept: 'Bogotá D.C.' },
        { id: 'bucaramanga', name: 'Bucaramanga', dept: 'Sant.' },
        { id: 'cali', name: 'Cali', dept: 'Valle' },
        { id: 'cartagena', name: 'Cartagena', dept: 'Bol.' },
        { id: 'cucuta', name: 'Cúcuta', dept: 'N.S.' },
        { id: 'ibague', name: 'Ibagué', dept: 'Tol.' },
        { id: 'manizales', name: 'Manizales', dept: 'Cal.' },
        { id: 'medellin', name: 'Medellín', dept: 'Ant.' },
        { id: 'monteria', name: 'Montería', dept: 'Cór.' },
        { id: 'pasto', name: 'Pasto', dept: 'Nar.' },
        { id: 'pereira', name: 'Pereira', dept: 'Ris.' },
        { id: 'santamarta', name: 'Santa Marta', dept: 'Mag.' },
        { id: 'sincelejo', name: 'Sincelejo', dept: 'Suc.' },
        { id: 'valledupar', name: 'Valledupar', dept: 'Ces.' },
        { id: 'villavicencio', name: 'Villavicencio', dept: 'Met.' }
    ];

    // Mapeo interoperable de servicios locales para el buscador principal
    const LOCAL_SERVICES_INDEX = {
        'bogota': {
            'impuestos': ['Secretaría de Hacienda (DIB)', 'impuesto predial y vehículos'],
            'hogar': ['Alcaldía Mayor de Bogotá', 'EAAB - Acueducto de Bogotá', 'Enel Colombia', 'Vanti (Gas Natural)'],
            'movilidad': ['Secretaría de Movilidad de Bogotá', 'pico y placa', 'comparendos']
        },
        'medellin': {
            'impuestos': ['Hacienda Medellín', 'Gobernación de Antioquia', 'impuesto vehicular'],
            'hogar': ['Alcaldía de Medellín', 'EPM - Empresas Públicas de Medellín', 'agua', 'luz', 'gas'],
            'movilidad': ['Secretaría de Movilidad de Medellín', 'pico y placa']
        },
        'cali': {
            'impuestos': ['Hacienda Municipal de Cali', 'Gobernación del Valle del Cauca'],
            'hogar': ['Alcaldía de Santiago de Cali', 'EMCALI', 'Gases del Occidente'],
            'movilidad': ['Secretaría de Movilidad de Cali', 'pico y placa']
        },
        'barranquilla': {
            'impuestos': ['Gerencia de Ingresos - Barranquilla', 'Gobernación del Atlántico', 'predial'],
            'hogar': ['Alcaldía de Barranquilla', 'Triple A', 'Air-e', 'Gases del Caribe'],
            'movilidad': ['Secretaría de Tránsito de Barranquilla']
        },
        'monteria': {
            'impuestos': ['Alcaldía de Montería - Impuesto Predial', 'Gobernación de Córdoba - Impuesto Vehicular'],
            'hogar': ['Alcaldía de Montería', 'Veolia Montería', 'Afinia (Grupo EPM)', 'Surtigas'],
            'movilidad': ['Secretaría de Tránsito de Montería', 'pico y placa', 'acuerdos de pago']
        },
        'cartagena': {
            'impuestos': ['Alcaldía de Cartagena - Hacienda', 'Gobernación de Bolívar'],
            'hogar': ['Alcaldía de Cartagena', 'Acuacar (Aguas de Cartagena)', 'Afinia', 'Surtigas'],
            'movilidad': ['DATT Cartagena', 'transitocartagena']
        },
        'bucaramanga': {
            'impuestos': ['Alcaldía de Bucaramanga', 'Gobernación de Santander'],
            'hogar': ['amb (Acueducto)', 'ESSA', 'Gasoriente'],
            'movilidad': ['Tránsito Bucaramanga', 'fotomultas']
        },
        'pereira': {
            'impuestos': ['Alcaldía de Pereira', 'Gobernación de Risaralda'],
            'hogar': ['Aguas y Aguas de Pereira', 'Energía de Pereira', 'Efigas'],
            'movilidad': ['Instituto de Tránsito de Pereira']
        },
        'manizales': {
            'impuestos': ['Alcaldía de Manizales', 'Gobernación de Caldas'],
            'hogar': ['Aguas de Manizales', 'CHEC', 'Efigas'],
            'movilidad': ['STT Manizales']
        },
        'cucuta': {
            'impuestos': ['Alcaldía de Cúcuta', 'Gobernación de Norte de Santander'],
            'hogar': ['EIS Cúcuta / Veolia', 'CENS', 'Gases del Oriente'],
            'movilidad': ['Secretaría de Tránsito de Cúcuta']
        },
        'ibague': {
            'impuestos': ['Alcaldía de Ibagué', 'Gobernación del Tolima'],
            'hogar': ['IBAL', 'CELSIA', 'Alcanos de Colombia'],
            'movilidad': ['Secretaría de Movilidad de Ibagué']
        },
        'santamarta': {
            'impuestos': ['Alcaldía de Santa Marta', 'Gobernación del Magdalena'],
            'hogar': ['ESSMAR E.S.P.', 'Air-e', 'Gases del Caribe'],
            'movilidad': ['STTM Santa Marta']
        },
        'pasto': {
            'impuestos': ['Alcaldía de Pasto', 'Gobernación de Nariño'],
            'hogar': ['EMPOPASTO', 'CEDENAR', 'Alcanos de Colombia'],
            'movilidad': ['Subsecretaría de Tránsito de Pasto']
        },
        'sincelejo': {
            'impuestos': ['Alcaldía de Sincelejo', 'Gobernación de Sucre'],
            'hogar': ['VeaA (Veolia)', 'Afinia', 'Surtigas'],
            'movilidad': ['Secretaría de Tránsito y Transporte de Sincelejo']
        },
        'villavicencio': {
            'impuestos': ['Alcaldía de Villavicencio', 'Gobernación del Meta'],
            'hogar': ['EAAV', 'EMSA', 'Llanogas'],
            'movilidad': ['Secretaría de Movilidad Villavicencio']
        },
        'valledupar': {
            'impuestos': ['Alcaldía de Valledupar', 'Gobernación del Cesar'],
            'hogar': ['EMDUPAR', 'Afinia', 'Gases del Caribe'],
            'movilidad': ['Tránsito Valledupar']
        }
    };

    function renderCitiesMenu() {
        const menus = document.querySelectorAll('.cities-menu');
        const sortedCities = [...CITIES_DATA].sort((a, b) => 
            a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
        );

        menus.forEach(menu => {
            const category = menu.dataset.category;
            const showDept = menu.dataset.showDept === 'true';

            const linksHTML = sortedCities.map((city, index) => {
                const label = showDept && city.dept !== 'Bogotá D.C.' 
                    ? `${city.name} / ${city.dept}` 
                    : city.name;
                
                const separator = index < sortedCities.length - 1 ? '<span class="city-sep"> | </span>' : '';
                
                // Extraer servicios para indexación contextual en el HTML
                const cityServices = (LOCAL_SERVICES_INDEX[city.id] && LOCAL_SERVICES_INDEX[city.id][category]) 
                    ? LOCAL_SERVICES_INDEX[city.id][category].join(', ') 
                    : '';

                return `
                    <span class="city-link-wrapper" data-city-id="${city.id}" data-category="${category}" data-services="${cityServices}">
                        <a href="ciudad.html?cat=${category}&city=${city.id}">${label}</a>
                        <span class="matched-service-tag" style="display:none; font-size:11px; color:#1976d2; font-weight:bold; margin-left:4px;"></span>
                        ${separator}
                    </span>`;
            }).join('');

            menu.innerHTML = `<span class="cities-label">Selecciona tu ubicación:</span><br><div class="cities-list">${linksHTML}</div>`;
        });
    }

    renderCitiesMenu();


    // ==========================================
    // 2. CONFIGURACIÓN DEL BUSCADOR Y SINÓNIMOS
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
        'predial': ['impuestos', 'hacienda', 'alcaldia'],
        'vehiculo': ['vehiculos', 'impuestos', 'movilidad', 'tránsito', 'transito', 'patios', 'runt', 'simit', 'afinia'],
        'agua': ['acueducto', 'veolia', 'eaab', 'epm', 'emcali', 'triple a', 'acuacar', 'empopasto', 'ibal', 'essmar'],
        'luz': ['energia', 'afinia', 'air-e', 'enel', 'epm', 'essa', 'celsia', 'chec', 'cens', 'cedenar', 'emsa'],
        'gas': ['surtigas', 'vanti', 'gases', 'efigas', 'alcanos', 'llanogas', 'gasoriente'],
        'soat': ['runt', 'simit', 'movilidad', 'tránsito', 'transito'],
        'fotomulta': ['simit', 'runt', 'movilidad', 'tránsito', 'transito', 'datt'],
        'cedula': ['registraduria', 'duplicado', 'identificacion']
    };


    // ==========================================
    // 3. BUSCADOR INTEROPERABLE DE ALTA PRECISIÓN
    // ==========================================
    if (searchInput) {
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
                if (!textToTest) return false;
                const normalizedTarget = normalizeText(textToTest);
                return searchTerms.some(term => normalizedTarget.includes(term));
            };

            // A. Filtrado de trámites nacionales
            nationalItems.forEach(item => {
                if (query === '' || isMatch(item.textContent)) {
                    item.style.display = '';
                    nationalVisibleCount++;
                } else {
                    item.style.display = 'none';
                }
            });

            // B. Filtrado de trámites regionales y categorías
            categoryItems.forEach(item => {
                const details = item.querySelector('details');
                const summary = item.querySelector('summary');
                const cityWrappers = item.querySelectorAll('.city-link-wrapper');

                const summaryText = summary ? summary.textContent : '';
                const isCategoryMatch = (query !== '') && isMatch(summaryText);

                if (query === '') {
                    item.style.display = '';
                    if (details) details.open = false;
                    
                    cityWrappers.forEach(wrapper => {
                        wrapper.style.display = '';
                        const tag = wrapper.querySelector('.matched-service-tag');
                        if (tag) tag.style.display = 'none';
                        const sep = wrapper.querySelector('.city-sep');
                        if (sep) sep.style.display = '';
                    });
                    regionalVisibleCount++;
                } else {
                    let visibleWrappers = [];

                    cityWrappers.forEach(wrapper => {
                        const link = wrapper.querySelector('a');
                        const linkText = link ? link.textContent : '';
                        const cityId = wrapper.dataset.cityId;
                        const cityServices = wrapper.dataset.services || '';
                        const cityObj = CITIES_DATA.find(c => c.id === cityId);
                        const tag = wrapper.querySelector('.matched-service-tag');

                        let matchedServiceName = '';

                        // 1. Coincidencia por nombre de ciudad o departamento
                        let isCityMatch = isMatch(linkText) || (cityObj && (isMatch(cityObj.name) || isMatch(cityObj.dept)));

                        // 2. Coincidencia por trámite específico (ej: "Veolia", "Surtigas", "Afinia")
                        if (cityServices) {
                            const servicesList = cityServices.split(', ');
                            const found = servicesList.find(service => isMatch(service));
                            if (found) {
                                matchedServiceName = found;
                            }
                        }

                        if (isCityMatch || matchedServiceName !== '' || isCategoryMatch) {
                            wrapper.style.display = '';
                            visibleWrappers.push(wrapper);

                            // Mostrar etiqueta contextual si coincide con una empresa o trámite
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

                    // Limpieza dinámica de separadores (|) entre resultados visibles
                    visibleWrappers.forEach((wrapper, idx) => {
                        const sep = wrapper.querySelector('.city-sep');
                        if (sep) {
                            sep.style.display = (idx === visibleWrappers.length - 1) ? 'none' : '';
                        }
                    });

                    if (visibleWrappers.length > 0) {
                        item.style.display = '';
                        if (details) details.open = true; // Abre automáticamente la categoría
                        regionalVisibleCount++;
                    } else {
                        item.style.display = 'none';
                        if (details) details.open = false;
                    }
                }
            });

            // C. Control de títulos y avisos
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
});
