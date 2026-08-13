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
        credit: 'Foto: <a href="https://commons.wikimedia.org/wiki/File:Sunset-cartagena-tower-dewired.jpg" target="_blank">Igvir Ramirez</a>, <a href="https://creativecommons.org/licenses/by-sa/2.0" target="_blank">CC BY-SA 2.0</a>, vía Wikimedia Commons'
    },
    'bucaramanga': {
        fullName: 'Bucaramanga / Santander',
        image: 'img/BUCARAMANGA.jpeg',
        credit: 'Foto: <a href="https://commons.wikimedia.org/wiki/File:Bucaramanga_Wiki.jpg" target="_blank">Marketing digital Bucaramanga</a>, <a href="https://creativecommons.org/licenses/by-sa/4.0" target="_blank">CC BY-SA 4.0</a>, vía Wikimedia Commons'
    },
    'pereira': {
        fullName: 'Pereira / Risaralda',
        image: 'img/PEREIRA.jpeg',
        credit: 'Foto: <a href="https://commons.wikimedia.org/wiki/File:Alto_del_Nudo_-_Pereira.jpg" target="_blank">KeilaA</a>, <a href="https://creativecommons.org/licenses/by-sa/3.0" target="_blank">CC BY-SA 3.0</a>, vía Wikimedia Commons'
    },
    'manizales': {
        fullName: 'Manizales / Caldas',
        image: 'img/MANIZALES.jpeg',
        credit: 'Foto: <a href="https://commons.wikimedia.org/wiki/File:20250825_Manizales_Lanzamiento_de_la_licitaci%C3%B3n_de_Aerocaf%C3%A9-Ovidio_Gonz%C3%A1lez0119.jpg" target="_blank">Presidencia de Colombia</a>, Public domain, vía Wikimedia Commons'
    },
    'cucuta': {
        fullName: 'Cúcuta / Norte de Santander',
        image: 'img/CUCUTA.jpeg',
        credit: 'Foto: <a href="https://commons.wikimedia.org/wiki/File:C%C3%BAcuta_desde_Torcoroma,_C%C3%BAcuta.jpeg" target="_blank">EEIM</a>, <a href="https://creativecommons.org/licenses/by-sa/3.0" target="_blank">CC BY-SA 3.0</a>, vía Wikimedia Commons'
    },
    'ibague': {
        fullName: 'Ibagué / Tolima',
        image: 'img/IBAGUE.jpeg',
        credit: 'Foto: <a href="https://commons.wikimedia.org/wiki/File:Ibagu%C3%A9,_Colombia.jpg" target="_blank">Ridiculopathy</a>, CC0, vía Wikimedia Commons'
    },
    'santamarta': {
        fullName: 'Santa Marta / Magdalena',
        image: 'img/SMARTA.jpeg',
        credit: 'Foto: <a href="https://commons.wikimedia.org/wiki/File:El_Rodadero,_Santa_Marta,_Colombia.jpg" target="_blank">Julieth Gómez Durán</a>, <a href="https://creativecommons.org/licenses/by/2.0" target="_blank">CC BY 2.0</a>, vía Wikimedia Commons'
    },
    'monteria': {
        fullName: 'Montería / Córdoba',
        image: 'img/MONTERIA.jpeg',
        credit: 'Foto: <a href="https://commons.wikimedia.org/wiki/File:Ronda_del_Sin%C3%BA.jpg" target="_blank">Vgallego66</a>, <a href="https://creativecommons.org/licenses/by-sa/4.0" target="_blank">CC BY-SA 4.0</a>, vía Wikimedia Commons'
    },
    'pasto': {
        fullName: 'Pasto / Nariño',
        image: 'img/PASTO.jpeg',
        credit: 'Foto: <a href="https://commons.wikimedia.org/wiki/File:San_Juan_de_Pasto_de_noche.jpg" target="_blank">Jorgelrm</a>, <a href="https://creativecommons.org/licenses/by-sa/3.0" target="_blank">CC BY-SA 3.0</a>, vía Wikimedia Commons'
    },
    'sincelejo': {
        fullName: 'Sincelejo / Sucre',
        image: 'img/SINCELEJO.jpeg',
        credit: 'Foto: <a href="https://commons.wikimedia.org/wiki/File:Sincelejo,_Sucre.jpg" target="_blank">Biopr eqnwer</a>, CC0, vía Wikimedia Commons'
    },
    'villavicencio': {
        fullName: 'Villavicencio / Meta',
        image: 'img/VILLAVICENCIO.jpeg',
        credit: 'Foto: <a href="https://commons.wikimedia.org/wiki/File:C8v_iSQXoAAEqwr.jpg" target="_blank">Alejandro Vega</a>, <a href="https://creativecommons.org/licenses/by-sa/4.0" target="_blank">CC BY-SA 4.0</a>, vía Wikimedia Commons'
    },
    'valledupar': {
        fullName: 'Valledupar / Cesar',
        image: 'img/VALLEDUPAR.jpeg',
        credit: 'Foto: <a href="https://commons.wikimedia.org/wiki/File:Plaza_Valledupar.jpg" target="_blank">Sr Lotus</a>, <a href="https://creativecommons.org/licenses/by-sa/4.0" target="_blank">CC BY-SA 4.0</a>, vía Wikimedia Commons'
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
            { name: 'Alcaldía de Cartagena', url: 'https://www.cartagena.gov.co', desc: 'portal oficial distrital' },
            { name: 'Acuacar (Aguas de Cartagena)', url: 'https://www.acuacar.com', desc: 'pago y duplicado de factura de agua' },
            { name: 'Afinia (Grupo EPM)', url: 'https://www.afinia.com.co', desc: 'pago de factura de energía eléctrica' },
            { name: 'Surtigas', url: 'https://www.surtigas.com.co', desc: 'pago de factura de gas domiciliario' }
        ],
        'movilidad': [
            { name: 'DATT Cartagena', url: 'https://www.transitocartagena.gov.co', desc: 'trámites, comparendos y pico y placa' }
        ]
    },
    'bucaramanga': {
        'impuestos': [
            { name: 'Alcaldía de Bucaramanga - Impuestos', url: 'https://www.bucaramanga.gov.co', desc: 'pago predial e impuestos locales' },
            { name: 'Gobernación de Santander', url: 'https://www.santander.gov.co', desc: 'impuesto sobre vehículos automotores' }
        ],
        'hogar': [
            { name: 'Alcaldía de Bucaramanga', url: 'https://www.bucaramanga.gov.co', desc: 'portal oficial del municipio' },
            { name: 'amb (Acueducto Metropolitano de Bucaramanga)', url: 'https://www.amb.com.co', desc: 'pago de factura de agua' },
            { name: 'ESSA (Electrificadora de Santander)', url: 'https://www.essa.com.co', desc: 'pago de servicio de energía' },
            { name: 'Gasoriente', url: 'https://www.grupovanti.com', desc: 'pago de factura de gas domiciliario' }
        ],
        'movilidad': [
            { name: 'Tránsito Bucaramanga', url: 'https://www.transitobucaramanga.gov.co', desc: 'trámites, fotomultas y pico y placa' }
        ]
    },
    'pereira': {
        'impuestos': [
            { name: 'Alcaldía de Pereira - Hacienda', url: 'https://www.pereira.gov.co', desc: 'impuesto predial y tributos locales' },
            { name: 'Gobernación de Risaralda', url: 'https://www.risaralda.gov.co', desc: 'impuesto vehicular de Risaralda' }
        ],
        'hogar': [
            { name: 'Alcaldía de Pereira', url: 'https://www.pereira.gov.co', desc: 'portal oficial municipal' },
            { name: 'Aguas y Aguas de Pereira', url: 'https://www.aguasyaguas.com.co', desc: 'pago de factura de acueducto' },
            { name: 'Energía de Pereira', url: 'https://www.energiadepereira.com', desc: 'pago de factura de energía eléctrica' },
            { name: 'Efigas', url: 'https://www.efigas.com.co', desc: 'pago de factura de gas natural' }
        ],
        'movilidad': [
            { name: 'Instituto de Tránsito de Pereira', url: 'https://www.pereira.gov.co/transito', desc: 'trámites de movilidad y pico y placa' }
        ]
    },
    'manizales': {
        'impuestos': [
            { name: 'Alcaldía de Manizales - Hacienda', url: 'https://manizales.gov.co', desc: 'impuesto predial y consulta tributaria' },
            { name: 'Gobernación de Caldas', url: 'https://caldas.gov.co', desc: 'impuesto vehicular de Caldas' }
        ],
        'hogar': [
            { name: 'Alcaldía de Manizales', url: 'https://manizales.gov.co', desc: 'portal institucional' },
            { name: 'Aguas de Manizales', url: 'https://www.aguasdemanizales.com.co', desc: 'pago de servicio de acueducto y alcantarillado' },
            { name: 'CHEC (Grupo EPM)', url: 'https://www.chec.com.co', desc: 'pago de factura de energía eléctrica' },
            { name: 'Efigas', url: 'https://www.efigas.com.co', desc: 'pago de factura de gas natural' }
        ],
        'movilidad': [
            { name: 'STT Manizales', url: 'https://manizales.gov.co/transito', desc: 'servicios de tránsito y comparendos' }
        ]
    },
    'cucuta': {
        'impuestos': [
            { name: 'Alcaldía de Cúcuta - Impuestos', url: 'https://cucuta.gov.co', desc: 'impuesto predial e industria y comercio' },
            { name: 'Gobernación de Norte de Santander', url: 'https://www.nortedesantander.gov.co', desc: 'pago de impuesto vehicular' }
        ],
        'hogar': [
            { name: 'Alcaldía de Cúcuta', url: 'https://cucuta.gov.co', desc: 'portal municipal de atención' },
            { name: 'EIS Cúcuta / Veolia Cúcuta', url: 'https://www.veolia.com.co/cucuta', desc: 'pago de agua y aseo urbano' },
            { name: 'CENS (Grupo EPM)', url: 'https://www.cens.com.co', desc: 'pago de factura de energía eléctrica' },
            { name: 'Gases del Oriente', url: 'https://www.gaspaisas.com.co', desc: 'pago de factura de gas domiciliario' }
        ],
        'movilidad': [
            { name: 'Secretaría de Tránsito de Cúcuta', url: 'https://cucuta.gov.co/transito', desc: 'consultas, comparendos y pico y placa' }
        ]
    },
    'ibague': {
        'impuestos': [
            { name: 'Alcaldía de Ibagué - Predial', url: 'https://ibague.gov.co', desc: 'pago de impuesto predial unificado' },
            { name: 'Gobernación del Tolima', url: 'https://www.tolima.gov.co', desc: 'impuesto sobre vehículos automotores' }
        ],
        'hogar': [
            { name: 'Alcaldía de Ibagué', url: 'https://ibague.gov.co', desc: 'portal único de servicios' },
            { name: 'IBAL (Empresa Ibaguereña de Acueducto)', url: 'https://www.ibal.gov.co', desc: 'pago y duplicado de factura de agua' },
            { name: 'CELSIA', url: 'https://www.celsia.com', desc: 'pago de servicio de energía eléctrica' },
            { name: 'Alcanos de Colombia', url: 'https://www.alcanos.com.co', desc: 'pago de factura de gas natural' }
        ],
        'movilidad': [
            { name: 'Secretaría de Movilidad de Ibagué', url: 'https://ibague.gov.co/movilidad', desc: 'trámites, trámites RUNT y pico y placa' }
        ]
    },
    'santamarta': {
        'impuestos': [
            { name: 'Alcaldía de Santa Marta - Hacienda', url: 'https://santamarta.gov.co', desc: 'impuestos distritales y predial' },
            { name: 'Gobernación del Magdalena', url: 'https://www.magdalena.gov.co', desc: 'impuesto vehicular del departamento' }
        ],
        'hogar': [
            { name: 'Alcaldía de Santa Marta', url: 'https://santamarta.gov.co', desc: 'portal distrital institucional' },
            { name: 'ESSMAR E.S.P.', url: 'https://www.essmar.gov.co', desc: 'servicios de acueducto y alcantarillado' },
            { name: 'Air-e', url: 'https://www.air-e.com', desc: 'pago de factura de energía eléctrica' },
            { name: 'Gases del Caribe', url: 'https://www.gascaribe.com', desc: 'pago de factura de gas domiciliario' }
        ],
        'movilidad': [
            { name: 'STTM Santa Marta', url: 'https://santamarta.gov.co/transito', desc: 'trámites de tránsito y movilidad' }
        ]
    },
    'pasto': {
        'impuestos': [
            { name: 'Alcaldía de Pasto - Hacienda', url: 'https://pasto.gov.co', desc: 'impuesto predial municipal' },
            { name: 'Gobernación de Nariño', url: 'https://www.narino.gov.co', desc: 'impuesto vehicular de Nariño' }
        ],
        'hogar': [
            { name: 'Alcaldía de Pasto', url: 'https://pasto.gov.co', desc: 'portal institucional' },
            { name: 'EMPOPASTO', url: 'https://www.empopasto.com.co', desc: 'pago de factura de acueducto y alcantarillado' },
            { name: 'CEDENAR', url: 'https://www.cedenar.com.co', desc: 'pago de factura de energía eléctrica' },
            { name: 'Alcanos de Colombia', url: 'https://www.alcanos.com.co', desc: 'pago de servicio de gas domiciliario' }
        ],
        'movilidad': [
            { name: 'Subsecretaría de Tránsito de Pasto', url: 'https://pasto.gov.co/transito', desc: 'servicios de movilidad y comparendos' }
        ]
    },
    'sincelejo': {
        'impuestos': [
            { name: 'Alcaldía de Sincelejo - Hacienda', url: 'https://www.sincelejo.gov.co', desc: 'impuesto predial unificado e ICA' },
            { name: 'Gobernación de Sucre', url: 'https://www.sucre.gov.co', desc: 'impuesto sobre vehículos automotores de Sucre' }
        ],
        'hogar': [
            { name: 'Alcaldía de Sincelejo (Portal Oficial)', url: 'https://www.sincelejo.gov.co', desc: 'trámites del municipio y atención al ciudadano' },
            { name: 'VeaA (Aqualectra / Veolia)', url: 'https://www.veolia.com.co/sincelejo', desc: 'pago de factura de acueducto y alcantarillado' },
            { name: 'Afinia (Grupo EPM)', url: 'https://www.afinia.com.co', desc: 'pago de factura de energía eléctrica' },
            { name: 'Surtigas', url: 'https://www.surtigas.com.co', desc: 'pago y servicios de gas natural' }
        ],
        'movilidad': [
            { name: 'Secretaría de Tránsito y Transporte de Sincelejo', url: 'https://www.sincelejo.gov.co/transito', desc: 'trámites de vehículos, licencias y comparendos' }
        ]
    },
    'villavicencio': {
        'impuestos': [
            { name: 'Alcaldía de Villavicencio - Impuestos', url: 'https://villavicencio.gov.co', desc: 'impuesto predial unificado' },
            { name: 'Gobernación del Meta', url: 'https://www.meta.gov.co', desc: 'impuesto sobre vehículos automotores' }
        ],
        'hogar': [
            { name: 'Alcaldía de Villavicencio', url: 'https://villavicencio.gov.co', desc: 'portal del municipio' },
            { name: 'EAAV (Empresa de Acueducto de Villavicencio)', url: 'https://www.eaav.gov.co', desc: 'pago de factura de agua' },
            { name: 'EMSA (Electrificadora del Meta)', url: 'https://www.emsa.com.co', desc: 'pago de factura de energía eléctrica' },
            { name: 'Llanogas', url: 'https://www.llanogas.com', desc: 'pago y trámites de gas domiciliario' }
        ],
        'movilidad': [
            { name: 'Secretaría de Movilidad Villavicencio', url: 'https://villavicencio.gov.co/movilidad', desc: 'servicios de tránsito y pico y placa' }
        ]
    },
    'valledupar': {
        'impuestos': [
            { name: 'Alcaldía de Valledupar - Impuestos', url: 'https://valledupar.gov.co', desc: 'pago de predial e ICA' },
            { name: 'Gobernación del Cesar', url: 'https://www.cesar.gov.co', desc: 'impuesto sobre vehículos automotores' }
        ],
        'hogar': [
            { name: 'Alcaldía de Valledupar', url: 'https://valledupar.gov.co', desc: 'portal único de atención' },
            { name: 'EMDUPAR', url: 'https://www.emdupar.gov.co', desc: 'pago de factura de acueducto y alcantarillado' },
            { name: 'Afinia (Grupo EPM)', url: 'https://www.afinia.com.co', desc: 'pago de factura de energía eléctrica' },
            { name: 'Gases del Caribe', url: 'https://www.gascaribe.com', desc: 'pago de factura de gas natural' }
        ],
        'movilidad': [
            { name: 'Tránsito Valledupar', url: 'https://valledupar.gov.co/transito', desc: 'trámites, comparendos y movilidad' }
        ]
    }
};

// Exponer explícitamente las constantes al ámbito global
window.CITY_META_DATA = CITY_META_DATA;
window.CATEGORY_NAMES = CATEGORY_NAMES;
window.LINKS_DATA = LINKS_DATA;
