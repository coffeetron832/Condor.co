document.addEventListener('DOMContentLoaded', function() {
    
    // --- 1. Inicializar Iconos Lucide ---
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // --- 2. Subtítulo Dinámico de Bienvenida ---
    function updateGreeting() {
        const subtitleEl = document.getElementById('dynamicGreeting') || document.querySelector('.hero-subtitle');
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

    // --- 3. Fondo Dinámico y Créditos por Hora ---
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
        if (creditEl) creditEl.innerHTML = creditHTML;
    }

    updateTimeTheme();
    setInterval(() => {
        updateTimeTheme();
        updateGreeting();
    }, 15 * 60 * 1000);

    // --- 4. Cargar TRM y Calculadora Dólar / COP ---
    async function fetchTRM() {
        const trmRateEl = document.getElementById('trmRate');
        const trmUpdateEl = document.getElementById('trmUpdate');
        const trmTrendEl = document.getElementById('trmTrend');
        const heroTrmText = document.getElementById('heroTrmText');
        const usdInput = document.getElementById('trmUsdInput');
        const copInput = document.getElementById('trmCopInput');

        let currentRate = null;

        const copFormatter = new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 2
        });

        const copHeroFormatter = new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0
        });

        // Fuente Primaria: Datos Abiertos Colombia
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

        // Fuente Secundaria: ExchangeRate API (Fallback)
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

            // Actualizar Widget de la Tarjeta TRM
            if (trmRateEl) trmRateEl.textContent = `${copFormatter.format(currentRate)} COP`;
            if (trmUpdateEl) trmUpdateEl.textContent = `Vigencia: ${trmData.date}`;

            // Actualizar Texto Hero
            if (heroTrmText) {
                const diff = trmData.change;
                const trendIcon = diff > 0 ? '▲' : diff < 0 ? '▼' : '=';
                heroTrmText.textContent = `TRM: ${copHeroFormatter.format(currentRate)} ${trendIcon}`;
            }

            // Actualizar Tendencia de Cambio
            if (trmTrendEl && trmData.change !== undefined) {
                if (trmData.change > 0) {
                    trmTrendEl.innerHTML = `<span style="color: #2e7d32; font-weight: bold;">▲ +$${trmData.change.toFixed(2)}</span>`;
                } else if (trmData.change < 0) {
                    trmTrendEl.innerHTML = `<span style="color: #c62828; font-weight: bold;">▼ -$${Math.abs(trmData.change).toFixed(2)}</span>`;
                } else {
                    trmTrendEl.innerHTML = `<span style="color: #616161;">= Sin cambios</span>`;
                }
            }

            // Disclaimer Informativo
            let disclaimerEl = document.getElementById('trmDisclaimer');
            if (!disclaimerEl && trmRateEl) {
                disclaimerEl = document.createElement('small');
                disclaimerEl.id = 'trmDisclaimer';
                disclaimerEl.style.cssText = 'display: block; font-size: 10px; color: #757575; margin-top: 6px; line-height: 1.2;';
                
                const parentContainer = trmRateEl.closest('.card-item') || trmRateEl.parentElement;
                if (parentContainer) parentContainer.appendChild(disclaimerEl);
            }

            if (disclaimerEl) {
                disclaimerEl.textContent = `* Datos oficiales vía ${trmData.source}. Se actualiza de lunes a viernes en días hábiles.`;
            }

            // Calculadora bidireccional
            if (usdInput && copInput) {
                usdInput.value = 1;
                copInput.value = Math.round(currentRate);

                usdInput.addEventListener('input', () => {
                    const usdVal = parseFloat(usdInput.value) || 0;
                    copInput.value = Math.round(usdVal * currentRate);
                });

                copInput.addEventListener('input', () => {
                    const copVal = parseFloat(copInput.value) || 0;
                    usdInput.value = (copVal / currentRate).toFixed(2);
                });
            }

        } catch (err) {
            console.error('24col: Error al consultar TRM:', err);
            if (trmRateEl) trmRateEl.textContent = 'No disponible';
            if (trmUpdateEl) trmUpdateEl.textContent = 'Intenta nuevamente más tarde';
            if (heroTrmText) heroTrmText.textContent = 'TRM: --';
        }
    }
    fetchTRM();

    // --- 5. Cargar Clima (Open-Meteo) ---
    function getWeatherEmoji(code) {
        if (code === 0) return '☀️';
        if (code >= 1 && code <= 3) return '⛅';
        if (code >= 45 && code <= 48) return '🌫️';
        if (code >= 51 && code <= 67) return '🌧️';
        if (code >= 80 && code <= 82) return '🌦️';
        if (code >= 95) return '🌩️';
        return '🌡️';
    }

    async function fetchHeroWeather(lat = 4.6097, lon = -74.0817, cityName = 'Bogotá') {
        const weatherText = document.getElementById('heroWeatherText');
        const weatherEmoji = document.getElementById('heroWeatherEmoji');
        if (!weatherText) return;

        try {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
            const response = await fetch(url);
            const data = await response.json();

            if (data?.current_weather) {
                const temp = Math.round(data.current_weather.temperature);
                const code = data.current_weather.weathercode;

                if (weatherEmoji) weatherEmoji.textContent = getWeatherEmoji(code);
                weatherText.textContent = `${cityName} ${temp}°C`;
            }
        } catch (err) {
            weatherText.textContent = 'Clima: --°C';
        }
    }

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => fetchHeroWeather(pos.coords.latitude, pos.coords.longitude, 'Tu ubicación'),
            () => fetchHeroWeather()
        );
    } else {
        fetchHeroWeather();
    }

    // --- 6. Theme Switcher (Modo Claro / Oscuro) ---
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

    // --- 7. Modales de Categoría ---
    const triggerBtns = document.querySelectorAll('.category-trigger-btn');
    const categoryModals = document.querySelectorAll('.category-modal');

    triggerBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-modal-target');
            const targetModal = document.getElementById(targetId);
            if (targetModal && typeof targetModal.showModal === 'function') {
                targetModal.showModal();
            }
        });
    });

    categoryModals.forEach(modal => {
        const closeBtn = modal.querySelector('.modal-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => modal.close());
        }
        modal.addEventListener('click', (e) => {
            const rect = modal.getBoundingClientRect();
            if (
                e.clientX < rect.left ||
                e.clientX > rect.right ||
                e.clientY < rect.top ||
                e.clientY > rect.bottom
            ) {
                modal.close();
            }
        });
    });

    // --- 8. Modales Informativos (Bienvenida y Reporte) ---
    const welcomeModal = document.getElementById('welcomeModal');
    const openWelcomeBtn = document.getElementById('openWelcomeModal');
    const closeWelcomeBtn = document.getElementById('closeWelcomeModalBtn');
    const closeWelcomeCross = document.getElementById('closeWelcomeModalCross');
    
    const reportModal = document.getElementById('reportModal');
    const openReportBtn = document.getElementById('openReportModal');
    const closeReportBtn = document.getElementById('closeReportModal');

    // Apertura automática de Bienvenida la primera vez
    if (!localStorage.getItem('welcomeShown')) {
        setTimeout(() => {
            if (welcomeModal && typeof welcomeModal.showModal === 'function') {
                welcomeModal.showModal();
            }
        }, 400);
    }

    function closeWelcome() {
        if (welcomeModal) {
            welcomeModal.close();
            localStorage.setItem('welcomeShown', 'true');
        }
    }

    if (closeWelcomeBtn) closeWelcomeBtn.addEventListener('click', closeWelcome);
    if (closeWelcomeCross) closeWelcomeCross.addEventListener('click', closeWelcome);

    if (openWelcomeBtn) {
        openWelcomeBtn.addEventListener('click', () => {
            if (welcomeModal && typeof welcomeModal.showModal === 'function') {
                welcomeModal.showModal();
            }
        });
    }

    if (openReportBtn) {
        openReportBtn.addEventListener('click', () => {
            if (reportModal && typeof reportModal.showModal === 'function') {
                reportModal.showModal();
            }
        });
    }

    if (closeReportBtn) {
        closeReportBtn.addEventListener('click', () => {
            if (reportModal) reportModal.close();
        });
    }

    // Cierre al hacer clic fuera del contenido en modales de bienvenida y reporte
    [welcomeModal, reportModal].forEach(modal => {
        if (modal) {
            modal.addEventListener('click', (e) => {
                const rect = modal.getBoundingClientRect();
                if (
                    e.clientX < rect.left ||
                    e.clientX > rect.right ||
                    e.clientY < rect.top ||
                    e.clientY > rect.bottom
                ) {
                    if (modal === welcomeModal) {
                        closeWelcome();
                    } else {
                        modal.close();
                    }
                }
            });
        }
    });
});
