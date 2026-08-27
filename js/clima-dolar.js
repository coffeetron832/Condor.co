document.addEventListener('DOMContentLoaded', function() {
    
    // Inicializar iconos de Lucide
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // --- LÓGICA DE RELOJ AL HACER DOBLE CLIC EN EL TÍTULO ---
    function setupHeaderClock() {
        const brandTitle = document.querySelector('.hero-brand-title');
        if (!brandTitle) return;

        const titleText = brandTitle.querySelector('.hero-title-text');
        if (!titleText) return;

        const originalText = titleText.textContent;
        let clockInterval = null;

        brandTitle.style.cursor = 'pointer';
        brandTitle.style.userSelect = 'none';
        brandTitle.style.webkitUserSelect = 'none';

        brandTitle.addEventListener('dblclick', () => {
            if (clockInterval) {
                // Si el reloj está activo, lo detenemos y restauramos el título original
                clearInterval(clockInterval);
                clockInterval = null;
                titleText.textContent = originalText;
            } else {
                // Si está apagado, iniciamos el reloj
                const updateClock = () => {
                    const now = new Date();
                    const hours = String(now.getHours()).padStart(2, '0');
                    const minutes = String(now.getMinutes()).padStart(2, '0');
                    const seconds = String(now.getSeconds()).padStart(2, '0');
                    
                    titleText.textContent = `${hours}:${minutes}:${seconds}`;
                };

                updateClock();
                clockInterval = setInterval(updateClock, 1000);
            }
        });
    }

    setupHeaderClock();

    // --- Fondo Dinámico y Créditos según Hora del Día ---
    function updateTimeTheme() {
        const hour = new Date().getHours();
        const creditEl = document.getElementById('imageCredit');
        let timeTheme = 'day';
        let creditHTML = '';

        if (hour >= 6 && hour < 12) {
            timeTheme = 'morning';
            creditHTML = 'Foto: <a href="https://unsplash.com/es/fotos/una-vista-de-una-cadena-montanosa-con-un-cielo-nublado-en-el-fondo-ZcxWesjyigQ?utm_source=unsplash&utm_medium=referral&utm_content=creditShareLink" target="_blank" rel="noopener noreferrer">Jair Medina Nossa (Unsplash)</a>';
        } else if (hour >= 12 && hour < 18) {
            timeTheme = 'afternoon';
            creditHTML = 'Foto: <a href="https://unsplash.com/es/fotos/campo-rodeado-de-hierba-durante-el-dia-BeggL3fA_ww?utm_source=unsplash&utm_medium=referral&utm_content=creditShareLink" target="_blank" rel="noopener noreferrer">Michael Barón (Unsplash)</a>';
        } else {
            timeTheme = 'night';
            creditHTML = 'Foto: <a href="https://unsplash.com/es/fotos/casa-marron-y-negra-bajo-la-noche-estrellada-Gnyx762dqQM?utm_source=unsplash&utm_medium=referral&utm_content=creditShareLink" target="_blank" rel="noopener noreferrer">Linn Karen Hoyos Ortiz (Unsplash)</a>';
        }

        document.body.setAttribute('data-time', timeTheme);
        if (creditEl) {
            creditEl.innerHTML = creditHTML;
        }
    }

    updateTimeTheme();
    setInterval(() => {
        updateTimeTheme();
    }, 15 * 60 * 1000);

    // --- LÓGICA DE CONTROL PARA ELEMENTOS <dialog> (MODALES) ---
    function setupModals() {
        // 1. Abrir modales desde botones del directorio con data-modal-target
        const triggerBtns = document.querySelectorAll('[data-modal-target]');
        triggerBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = btn.getAttribute('data-modal-target');
                const modal = document.getElementById(targetId);
                if (modal && typeof modal.showModal === 'function') {
                    modal.showModal();
                }
            });
        });

        // 2. Abrir modal de la TRM y del Clima desde el Hero Bar
        const heroTrmItem = document.getElementById('heroTrmItem');
        const heroWeatherItem = document.getElementById('heroWeatherItem');
        
        if (heroTrmItem) {
            heroTrmItem.style.cursor = 'pointer';
            heroTrmItem.addEventListener('click', () => {
                const modal = document.getElementById('modal-trm');
                if (modal) modal.showModal();
            });
        }

        if (heroWeatherItem) {
            heroWeatherItem.style.cursor = 'pointer';
            heroWeatherItem.addEventListener('click', () => {
                const modal = document.getElementById('modal-weather');
                if (modal) modal.showModal();
            });
        }

        // 3. Abrir Modal de Bienvenida ("¿Cómo funciona?")
        const openWelcomeBtn = document.getElementById('openWelcomeModal');
        const welcomeModal = document.getElementById('welcomeModal');
        if (openWelcomeBtn && welcomeModal) {
            openWelcomeBtn.addEventListener('click', () => welcomeModal.showModal());
        }

        // 4. Cerrar modales con los botones 'x' o botones de acción
        const closeBtns = document.querySelectorAll('.modal-close-btn, #closeWelcomeModalBtn, #closeWelcomeModalCross');
        closeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const modal = btn.closest('dialog');
                if (modal) modal.close();
            });
        });

        // 5. Cerrar haciendo clic en el fondo oscuro del <dialog>
        const allDialogs = document.querySelectorAll('dialog');
        allDialogs.forEach(dialog => {
            dialog.addEventListener('click', (e) => {
                const rect = dialog.getBoundingClientRect();
                const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
                  rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
                if (!isInDialog) {
                    dialog.close();
                }
            });
        });
    }

    setupModals();

    // --- Cargar TRM Dólar a COP (API Antigua) ---
    async function fetchTRM() {
        const trmRateEl = document.getElementById('trmRate');
        const trmUpdateEl = document.getElementById('trmUpdate');
        const heroTrmText = document.getElementById('heroTrmText');
        
        try {
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
            const data = await response.json();
            
            if (data && data.rates && data.rates.COP) {
                const rateFormatted = new Intl.NumberFormat('es-CO', {
                    style: 'currency',
                    currency: 'COP',
                    maximumFractionDigits: 2
                }).format(data.rates.COP);

                if (trmRateEl) trmRateEl.textContent = `${rateFormatted} COP`;
                if (trmUpdateEl) trmUpdateEl.textContent = `Actualizado: ${data.date || 'Hoy'}`;
                if (heroTrmText) heroTrmText.textContent = `TRM: ${rateFormatted}`;
            } else {
                throw new Error('Formato inválido');
            }
        } catch (err) {
            if (trmRateEl) trmRateEl.textContent = 'No disponible';
            if (trmUpdateEl) trmUpdateEl.textContent = 'Intenta nuevamente más tarde';
            if (heroTrmText) heroTrmText.textContent = 'TRM: No disponible';
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
        const heroWeatherEmoji = document.getElementById('heroWeatherEmoji');
        const heroWeatherText = document.getElementById('heroWeatherText');

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

            if (heroWeatherEmoji) heroWeatherEmoji.textContent = info.icon;
            if (heroWeatherText) heroWeatherText.textContent = `${cityName.split(',')[0]}: ${Math.round(weather.temperature)}°C`;

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
