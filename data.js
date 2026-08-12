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

/* ==========================================
   24COL - BASE DE DATOS LOCAL
   ========================================== */

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

const CITY_META_DATA = {
    'bogota': {
        fullName: 'Bogotá D.C.',
        image: 'img/BOGOTA.jpeg',
        credit: 'Foto: <a href="https://commons.wikimedia.org/wiki/File:BOGOTA_CITY.jpg" target="_blank">KEVIN CASTAÑEDA VILLAMIL</a>, <a href="https://creativecommons.org/licenses/by-sa/4.0" target="_blank">CC BY-SA 4.0</a>, vía Wikimedia Commons'
    },
    'medellin': {
        fullName: 'Medellín / Antioquia',
        image: 'img/MEDELLIN.jpeg',
        credit: 'Foto: <a href="https://commons.wikimedia.org/wiki/File:Medell%C3%ADn-1.jpg" target="_blank">Michu2709</a>, <a href="https://creativecommons.org/licenses/by-sa/4.0" target="_blank">CC BY-SA 4.0</a>, vía Wikimedia Commons'
    },
    'cali': {
        fullName: 'Cali / Valle del Cauca',
        image: 'img/CALIVALLE.jpeg',
        credit: 'Foto: <a href="https://commons.wikimedia.org/wiki/File:Panor%C3%A1mica_-_Cali_-_Valle_del_Cauca_-_Colombia.jpg" target="_blank">Neoredacturus</a>, <a href="https://creativecommons.org/licenses/by-sa/4.0" target="_blank">CC BY-SA 4.0</a>, vía Wikimedia Commons'
    },
    'barranquilla': {
        fullName: 'Barranquilla / Atlántico',
        image: 'img/BARRANQUILLA.jpeg',
        credit: 'Foto: <a href="https://commons.wikimedia.org/wiki/File:Barranquilla_panoramica.jpg" target="_blank">Hsolp</a>, CC0, vía Wikimedia Commons'
    },
    'cartagena': {
        fullName: 'Cartagena / Bolívar',
        image: 'img/CARTAGENA.jpeg',
        credit: 'Foto: <a href="https://commons.wikimedia.org/wiki/File:Sunset-cartagena-tower-dewired.jpg" target="_blank">Igvir Ramirez</a>, <a href="https://creativecommons.org/licenses/by-sa/2.0" target="_blank">CC BY-SA 2.0</a>, via Wikimedia Commons'
    },
    'bucaramanga': {
        fullName: 'Bucaramanga / Santander',
        image: 'img/BUCARAMANGA.jpeg',
        credit: 'Foto: <a href="https://commons.wikimedia.org/wiki/File:Bucaramanga_Wiki.jpg" target="_blank">Marketing digital Bucaramanga</a>, <a href="https://creativecommons.org/licenses/by-sa/4.0" target="_blank">CC BY-SA 4.0</a>, via Wikimedia Commons'
    },
    'pereira': {
        fullName: 'Pereira / Risaralda',
        image: 'img/PEREIRA.jpeg',
        credit: 'Foto: <a href="https://commons.wikimedia.org/wiki/File:Alto_del_Nudo_-_Pereira.jpg" target="_blank">KeilaA</a>, <a href="https://creativecommons.org/licenses/by-sa/3.0" target="_blank">CC BY-SA 3.0</a>, via Wikimedia Commons'
    },
    'manizales': {
        fullName: 'Manizales / Caldas',
        image: 'img/MANIZALES.jpeg',
        credit: 'Foto: <a href="https://commons.wikimedia.org/wiki/File:20250825_Manizales_Lanzamiento_de_la_licitaci%C3%B3n_de_Aerocaf%C3%A9-Ovidio_Gonz%C3%A1lez0119.jpg" target="_blank">Fotografía oficial de la Presidencia de Colombia</a>, Public domain, via Wikimedia Commons'
    },
    'cucuta': {
        fullName: 'Cúcuta / Norte de Santander',
        image: 'img/CUCUTA.jpeg',
        credit: 'Foto: <a href="https://commons.wikimedia.org/wiki/File:C%C3%BAcuta_desde_Torcoroma,_C%C3%BAcuta.jpeg" target="_blank">EEIM</a>, <a href="https://creativecommons.org/licenses/by-sa/3.0" target="_blank">CC BY-SA 3.0</a>, via Wikimedia Commons'
    },
    'ibague': {
        fullName: 'Ibagué / Tolima',
        image: 'img/IBAGUE.jpeg',
        credit: 'Foto: <a href="https://commons.wikimedia.org/wiki/File:Ibagu%C3%A9,_Colombia.jpg" target="_blank">Ridiculopathy</a>, CC0, via Wikimedia Commons'
    },
    'santamarta': {
        fullName: 'Santa Marta / Magdalena',
        image: 'img/SMARTA.jpeg',
        credit: 'Foto: <a href="https://commons.wikimedia.org/wiki/File:El_Rodadero,_Santa_Marta,_Colombia.jpg" target="_blank">Julieth Gómez Durán</a>, <a href="https://creativecommons.org/licenses/by/2.0" target="_blank">CC BY 2.0</a>, via Wikimedia Commons'
    },
    'monteria': {
        fullName: 'Montería / Córdoba',
        image: 'img/MONTERIA.jpeg',
        credit: 'Foto: <a href="https://commons.wikimedia.org/wiki/File:Ronda_del_Sin%C3%BA.jpg" target="_blank">Vgallego66</a>, <a href="https://creativecommons.org/licenses/by-sa/4.0" target="_blank">CC BY-SA 4.0</a>, vía Wikimedia Commons'
    },
    'pasto': {
        fullName: 'Pasto / Nariño',
        image: 'img/PASTO.jpeg',
        credit: 'Foto: <a href="https://commons.wikimedia.org/wiki/File:San_Juan_de_Pasto_de_noche.jpg" target="_blank">Jorgelrm</a>, <a href="https://creativecommons.org/licenses/by-sa/3.0" target="_blank">CC BY-SA 3.0</a>, via Wikimedia Commons'
    },
    'sincelejo': {
        fullName: 'Sincelejo / Sucre',
        image: 'img/SINCELEJO.jpeg',
        credit: 'Foto: <a href="https://commons.wikimedia.org/wiki/File:Sincelejo,_Sucre.jpg" target="_blank">Biopr eqnwer</a>, CC0, via Wikimedia Commons'
    },
    'villavicencio': {
        fullName: 'Villavicencio / Meta',
        image: 'img/VILLAVICENCIO.jpeg',
        credit: 'Foto: <a href="https://commons.wikimedia.org/wiki/File:C8v_iSQXoAAEqwr.jpg" target="_blank">Alejandro Vega</a>, <a href="https://creativecommons.org/licenses/by-sa/4.0" target="_blank">CC BY-SA 4.0</a>, via Wikimedia Commons'
    },
    'valledupar': {
        fullName: 'Valledupar / Cesar',
        image: 'img/VALLEDUPAR.jpeg',
        credit: 'Foto: <a href="https://commons.wikimedia.org/wiki/File:Plaza_Valledupar.jpg" target="_blank">Sr Lotus</a>, <a href="https://creativecommons.org/licenses/by-sa/4.0" target="_blank">CC BY-SA 4.0</a>, via Wikimedia Commons'
    }
};

const CATEGORY_NAMES = {
    'impuestos': 'Impuestos Regionales, Predial y Vehículos',
    'hogar': 'Servicios Públicos y Portal del Municipio',
    'movilidad': 'Movilidad, Tránsito Local y Comparendos'
};

const LINKS_DATA = {
    'bogota': {
        'impuestos': [
            { name: 'Secretaría de Hacienda (DIB)', url: 'https://www.haciendabogota.gov.co', desc: 'pago de impuesto predial y vehículos Bogotá' }
        ],
        'hogar': [
            { name: 'Alcaldía Mayor de Bogotá', url: 'https://bogota.gov.co', desc: 'portal único de trámites distritales' },
            { name: 'EAAB - Acueducto de Bogotá', url: 'https://www.acueducto.com.co', desc: 'duplicado y pago de factura de agua' },
            { name: 'Enel Colombia', url: 'https://www.enel.com.co', desc: 'pago de factura de energía eléctrica' },
            { name: 'Vanti (Gas Natural)', url: 'https://www.grupovanti.com', desc: 'pago de servicio de gas domiciliario' }
        ],
        'movilidad': [
            { name: 'Secretaría de Movilidad de Bogotá', url: 'https://www.movilidadbogota.gov.co', desc: 'pico y placa, agendamiento y comparendos' }
        ]
    },
    'medellin': {
        'impuestos': [
            { name: 'Hacienda Medellín', url: 'https://www.medellin.gov.co/hacienda', desc: 'impuesto predial e industria y comercio' },
            { name: 'Gobernación de Antioquia', url: 'https://www.antioquia.gov.co', desc: 'impuesto vehicular de Antioquia' }
        ],
        'hogar': [
            { name: 'Alcaldía de Medellín', url: 'https://www.medellin.gov.co', desc: 'portal oficial del municipio' },
            { name: 'EPM - Empresas Públicas de Medellín', url: 'https://www.epm.com.co', desc: 'pago unificado de agua, luz y gas' }
        ],
        'movilidad': [
            { name: 'Secretaría de Movilidad de Medellín', url: 'https://www.medellin.gov.co/movilidad', desc: 'pico y placa y trámites de tránsito' }
        ]
    },
    'cali': {
        'impuestos': [
            { name: 'Hacienda Municipal de Cali', url: 'https://www.cali.gov.co/hacienda', desc: 'impuesto predial e ICA' },
            { name: 'Gobernación del Valle del Cauca', url: 'https://www.valledelcauca.gov.co', desc: 'impuesto automotor del departamento' }
        ],
        'hogar': [
            { name: 'Alcaldía de Santiago de Cali', url: 'https://www.cali.gov.co', desc: 'ventanilla única de atención' },
            { name: 'EMCALI', url: 'https://www.emcali.com.co', desc: 'pago de energía, acueducto y alcantarillado' },
            { name: 'Gases del Occidente', url: 'https://www.gdo.com.co', desc: 'pago y duplicado de factura de gas natural' }
        ],
        'movilidad': [
            { name: 'Secretaría de Movilidad de Cali', url: 'https://www.cali.gov.co/movilidad', desc: 'servicios de tránsito y pico y placa' }
        ]
    },
    'barranquilla': {
        'impuestos': [
            { name: 'Gerencia de Ingresos - Barranquilla', url: 'https://www.barranquilla.gov.co/hacienda', desc: 'impuesto predial distrital' },
            { name: 'Gobernación del Atlántico', url: 'https://www.atlantico.gov.co', desc: 'impuesto sobre vehículos automotores' }
        ],
        'hogar': [
            { name: 'Alcaldía de Barranquilla', url: 'https://www.barranquilla.gov.co', desc: 'portales de atención distrital' },
            { name: 'Triple A', url: 'https://www.aaa.com.co', desc: 'pago de factura de acueducto, alcantarillado y aseo' },
            { name: 'Air-e', url: 'https://www.air-e.com', desc: 'pago de factura de energía eléctrica' },
            { name: 'Gases del Caribe', url: 'https://www.gascaribe.com', desc: 'pago y duplicado de factura de gas' }
        ],
        'movilidad': [
            { name: 'Secretaría de Tránsito de Barranquilla', url: 'https://www.barranquilla.gov.co/transito', desc: 'trámites y consultas de movilidad' }
        ]
    },
    'monteria': {
        'impuestos': [
            { name: 'Alcaldía de Montería - Impuesto Predial', url: 'https://www.monteria.gov.co', desc: 'descarga y pago de factura predial unificada' },
            { name: 'Gobernación de Córdoba - Impuesto Vehicular', url: 'https://www.cordoba.gov.co', desc: 'liquidación y pago de impuesto de vehículos' }
        ],
        'hogar': [
            { name: 'Alcaldía de Montería (Portal Oficial)', url: 'https://www.monteria.gov.co', desc: 'trámites, ventanilla única y boletines' },
            { name: 'Veolia Montería', url: 'https://www.veolia.com.co/monteria', desc: 'pago de factura de acueducto y alcantarillado' },
            { name: 'Afinia (Grupo EPM)', url: 'https://www.afinia.com.co', desc: 'pago de factura de energía eléctrica' },
            { name: 'Surtigas', url: 'https://www.surtigas.com.co', desc: 'pago y gestión de servicio de gas natural' }
        ],
        'movilidad': [
            { name: 'Secretaría de Tránsito de Montería', url: 'https://www.monteria.gov.co/transito', desc: 'consulta de pico y placa, trámites y acuerdos de pago' }
        ]
    },
    'cartagena': {
        'impuestos': [
            { name: 'Alcaldía de Cartagena - Hacienda', url: 'https://www.cartagena.gov.co', desc: 'impuesto predial e ICA' },
            { name: 'Gobernación de Bolívar', url: 'https://www.bolivar.gov.co', desc: 'impuesto vehicular del departamento' }
        ],
        'hogar': [
            { name: 'Alcaldía de Cartagena', url: 'https://www.cartagena.gov.co', desc: 'portal oficial distrital' }
        ]
    }
};
