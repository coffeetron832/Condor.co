document.addEventListener('DOMContentLoaded', function() {
    
    // Inicializar iconos de Lucide
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // --- Subtítulo Dinámico de Bienvenida ---
    function updateGreeting() {
        const subtitleEl = document.querySelector('.hero-subtitle');
        if (!subtitleEl) return;

        const hour = new Date().getHours();
        let greeting = '';

        if (hour >= 5 && hour < 12) {
            greeting = '¡Buenos días! Te damos la bienvenida a 24col.';
        } else if (hour >= 12 && hour < 19) {
            greeting = '¡Buenas tardes! Te damos la bienvenida a 24col.';
        } else {
            greeting = '¡Buenas noches! Te damos la bienvenida a 24col.';
        }

        subtitleEl.textContent = greeting;
    }

    updateGreeting();

    // --- Fondo Dinámico y Créditos según Hora del Día ---
    function updateTimeTheme() {
        const hour = new Date().getHours();
        const creditEl = document.getElementById('imageCredit');
        let timeTheme = 'day';
        let creditHTML = '';

        if (hour >= 6 && hour < 12) {
            timeTheme = 'morning';
            creditHTML = 'Foto: <a href="https://unsplash.com/es/fotos/vista-superior-de-sombreros-para-el-sol-marrones-y-blancos-QkOy8LbWtdg?utm_source=unsplash&utm_medium=referral&utm_content=creditShareLink" target="_blank" rel="noopener noreferrer">Ricardo Gomez Angel (Unsplash)</a>';
        } else if (hour >= 12 && hour < 18) {
            timeTheme = 'afternoon';
            creditHTML = 'Foto: <a href="https://unsplash.com/es/fotos/loro-rojo-verde-y-azul-en-la-rama-marron-del-arbol-durante-el-dia-57SHaZUAOtQ?utm_source=unsplash&utm_medium=referral&utm_content=creditShareLink" target="_blank" rel="noopener noreferrer">Juan Camilo Guarin P (Unsplash)</a>';
        } else {
            timeTheme = 'night';
            creditHTML = 'Foto: <a href="https://unsplash.com/es/fotos/rascador-de-la-ciudad-por-la-noche-03gVOLHq9ec?utm_source=unsplash&utm_medium=referral&utm_content=creditShareLink" target="_blank" rel="noopener noreferrer">Juan Saravia (Unsplash)</a>';
        }

        document.body.setAttribute('data-time', timeTheme);
        if (creditEl) {
            creditEl.innerHTML = creditHTML;
        }
    }

    updateTimeTheme();
    setInterval(() => {
        updateTimeTheme();
        updateGreeting();
    }, 15 * 60 * 1000);

    // --- Cargar y Mejorar TRM Dólar a COP ---
    async function fetchTRM() {
        const trmRateEl = document.getElementById('trmRate');
        const trmUpdateEl = document.getElementById('trmUpdate');
        const trmTrendEl = document.getElementById('trmTrend');
        const usdInput = document.getElementById('trmUsdInput');
        const copInput = document.getElementById('trmCopInput');

        let currentRate = null;

        const copFormatter = new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 2
        });

        // 1. Fuente Primaria: Datos Abiertos Colombia (Superintendencia Financiera)
        async function getTRMOficial() {
            const response = await fetch('https://www.datos.gov.co/resource/32sa-823r.json?$order=vigenciadesde%20DESC&$limit=2');
            if (!response.ok) throw new Error('Error Datos Gov');
            const data = await response.json();
            
            if (data && data.length > 0) {
                const todayRate = parseFloat(data[0].valor);
                const yesterdayRate = data[1] ? parseFloat(data[1].valor) : todayRate;
                
                return {
                    rate: todayRate,
                    date: data[0].vigenciadesde ? data[0].vigenciadesde.split('T')[0] : 'Hoy',
                    change: todayRate - yesterdayRate,
                    source: 'Superintendencia Financiera de Colombia'
                };
            }
            throw new Error('Sin datos en API Oficial');
        }

        // 2. Fuente Secundaria: ExchangeRate-API (Fallback)
        async function getTRMFallback() {
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
            if (!response.ok) throw new Error('Error ExchangeRate API');
            const data = await response.json();
            
            if (data && data.rates && data.rates.COP) {
                return {
                    rate: data.rates.COP,
                    date: data.date || 'Hoy',
                    change: 0,
                    source: 'ExchangeRate-API (Mercado)'
                };
            }
            throw new Error('Sin datos en API Fallback');
        }

        try {
            let trmData;
            try {
                trmData = await getTRMOficial();
            } catch (e) {
                console.warn('24col: Falló API oficial TRM, intentando respaldo...', e);
                trmData = await getTRMFallback();
            }

            currentRate = trmData.rate;

            if (trmRateEl) {
                trmRateEl.textContent = `${copFormatter.format(currentRate)} COP`;
            }

            if (trmUpdateEl) {
                trmUpdateEl.textContent = `Vigencia: ${trmData.date}`;
            }

            if (trmTrendEl && trmData.change !== undefined) {
                if (trmData.change > 0) {
                    trmTrendEl.innerHTML = `<span style="color: #2e7d32; font-weight: bold;">▲ +$${trmData.change.toFixed(2)}</span>`;
                } else if (trmData.change < 0) {
                    trmTrendEl.innerHTML = `<span style="color: #c62828; font-weight: bold;">▼ -$${Math.abs(trmData.change).toFixed(2)}</span>`;
                } else {
                    trmTrendEl.innerHTML = `<span style="color: #616161;">= Sin cambios</span>`;
                }
            }

            let disclaimerEl = document.getElementById('trmDisclaimer');
            if (!disclaimerEl && trmRateEl) {
                disclaimerEl = document.createElement('small');
                disclaimerEl.id = 'trmDisclaimer';
                disclaimerEl.style.cssText = 'display:block; margin-top:6px; font-size:10px; color:#777;';
                if (trmRateEl.parentNode) {
                    trmRateEl.parentNode.appendChild(disclaimerEl);
                }
            }
            if (disclaimerEl) {
                disclaimerEl.textContent = `Fuente: ${trmData.source}`;
            }

            if (usdInput && copInput) {
                usdInput.addEventListener('input', () => {
                    const val = parseFloat(usdInput.value);
                    if (!isNaN(val) && currentRate) {
                        copInput.value = Math.round(val * currentRate);
                    } else {
                        copInput.value = '';
                    }
                });

                copInput.addEventListener('input', () => {
                    const val = parseFloat(copInput.value);
                    if (!isNaN(val) && currentRate) {
                        usdInput.value = (val / currentRate).toFixed(2);
                    } else {
                        usdInput.value = '';
                    }
                });
            }

        } catch (error) {
            console.error('24col Error TRM:', error);
            if (trmRateEl) trmRateEl.textContent = 'No disponible';
        }
    }

    fetchTRM();

    // --- Theme Switcher ---
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themeToggleText = document.getElementById('themeToggleText');
    const iconSun = document.getElementById('themeIconSun');
    const iconMoon = document.getElementById('themeIconMoon');

    function updateThemeUI(theme) {
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            if (themeToggleText) themeToggleText.textContent = 'Modo Claro';
            if (iconSun) iconSun.style.display = 'inline-block';
            if (iconMoon) iconMoon.style.display = 'none';
        } else {
            document.documentElement.removeAttribute('data-theme');
            if (themeToggleText) themeToggleText.textContent = 'Modo Oscuro';
            if (iconSun) iconSun.style.display = 'none';
            if (iconMoon) iconMoon.style.display = 'inline-block';
        }
    }

    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const currentTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    updateThemeUI(currentTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            const newTheme = isDark ? 'light' : 'dark';
            localStorage.setItem('theme', newTheme);
            updateThemeUI(newTheme);
        });
    }

    // --- MÓDULO DE CLIMA Y BÚSQUEDA DINÁMICA ---
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
                    admin1: item.admin1 || '',
                    lat: item.latitude,
                    lon: item.longitude
                }));
            }
        } catch (err) {
            console.warn('24col: Error consultando Geocoding API:', err);
        }
        return [];
    }

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

            localStorage.setItem('24col_last_city', JSON.stringify({ name: cityName, lat: validLat, lon: validLon }));
        } catch (err) {
            tempEl.textContent = '⚠️ Error';
            cityEl.textContent = `${cityName} (Sin datos)`;
        }
    }

    function setupWeatherSearch() {
        const weatherSearchInput = document.getElementById('weatherSearchInput');
        const weatherResultsContainer = document.getElementById('weatherSearchResults');

        if (!weatherSearchInput || !weatherResultsContainer) return;

        let weatherDebounceTimer = null;

        weatherSearchInput.addEventListener('input', function () {
            const query = this.value.trim();
            clearTimeout(weatherDebounceTimer);

            if (query.length < 2) {
                weatherResultsContainer.style.display = 'none';
                weatherResultsContainer.innerHTML = '';
                return;
            }

            weatherDebounceTimer = setTimeout(async () => {
                const cities = await searchCitiesApi(query);
                weatherResultsContainer.innerHTML = '';

                if (cities.length === 0) {
                    const li = document.createElement('li');
                    li.textContent = 'No se encontraron resultados';
                    li.style.padding = '6px 10px';
                    li.style.fontSize = '11px';
                    li.style.color = '#888';
                    weatherResultsContainer.appendChild(li);
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
                            weatherSearchInput.value = '';
                            weatherResultsContainer.style.display = 'none';
                            updateWeatherUI(label, city.lat, city.lon);
                        });

                        weatherResultsContainer.appendChild(li);
                    });
                }
                weatherResultsContainer.style.display = 'block';
            }, 350);
        });

        document.addEventListener('click', function (e) {
            if (!weatherSearchInput.contains(e.target) && !weatherResultsContainer.contains(e.target)) {
                weatherResultsContainer.style.display = 'none';
            }
        });
    }

    function initMainWeatherCard() {
        setupWeatherSearch();

        const tempEl = document.getElementById('weatherTemp');
        const cityEl = document.getElementById('weatherCity');

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

        if (tempEl && cityEl) {
            tempEl.textContent = '--°C';
            cityEl.textContent = 'Selecciona una ciudad';
        }
    }

    initMainWeatherCard();

});
