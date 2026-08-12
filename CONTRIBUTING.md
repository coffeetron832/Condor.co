# Guía de Contribución a 24col

¡Gracias por tu interés en colaborar con **24col**! Este es un proyecto de software libre colombiano 🇨🇴 que busca facilitar el acceso a trámites y servicios públicos de forma transparente, rápida y sin rastreos.

Toda contribución es bienvenida, ya sea reportando un enlace caído, agregando un municipio, registrando una nueva entidad o mejorando el código.

---

## Principios Fundamentales

Antes de enviar cualquier aportación, ten en cuenta nuestros pilares:

1. **GPLv3**: Al contribuir, aceptas que tu código y contenido se distribuirán bajo la licencia **GNU General Public License v3.0**.
2. **Privacy-First (Cero Rastreo)**: No aceptamos scripts de telemetría, cookies de analíticas ni herramientas de terceros que envíen datos del usuario a servidores externos.
3. **Enlaces Oficiales Únicamente**: Solo se permiten enlaces a portales gubernamentales (`.gov.co`), empresas públicas de servicios o sitios oficiales autorizados. No se aceptan acortadores de URL ni enlaces de afiliados.

---

## ¿Cómo Contribuir?

### 1. Añadir o Actualizar Servicios Locales

Si deseas agregar una nueva ciudad o registrar/actualizar una entidad en una existente, edita el archivo `data.js`:

* **Agregar una ciudad**: Añade el objeto correspondiente en `CITIES_DATA` y sus metadatos en `CITY_META_DATA`.
* **Agregar servicios públicos o de movilidad**: Incluye las palabras clave en `LOCAL_SERVICES_INDEX` para habilitar el buscador por sinónimos.
* **Agregar URLs oficiales**: Registra el nombre, la URL y la descripción corta en `LINKS_DATA`.

> **Nota sobre imágenes**: Si aportas una imagen panorámica para una ciudad en `CITY_META_DATA`, asegúrate de que sea de dominio público o CC BY / CC BY-SA (Wikimedia Commons) e incluye los créditos correspondientes.

---

### 2. Mejorar el Código Fuente

El proyecto sigue una arquitectura ligera y modular:

* **`data.js`**: Únicamente información y estructura de datos.
* **`script.js`**: Lógica de renderizado del menú, motor de búsqueda con sinónimos y verificador de salud/HTTPS de enlaces.
* **`ciudad.js`**: Lógica de la vista detallada por municipio.

Para colaborar en la parte técnica:
1. Haz un **Fork** del repositorio.
2. Crea una rama dedicada para tu cambio (`git checkout -b feature/nueva-ciudad` o `git checkout -b fix/enlace-caido`).
3. Realiza tus cambios asegurándote de no romper la modularidad.
4. Realiza un **Pull Request** detallando los cambios realizados.

---

### 3. Reportar Enlaces Caídos o Errores

Si encuentras una URL institucional cambiada, fuera de servicio o un error visual:
* Abre un **Issue** en GitHub.
* Indica la ciudad, la categoría y la URL con problemas.
* Si tienes la nueva URL oficial, agrégala en el reporte.

---
