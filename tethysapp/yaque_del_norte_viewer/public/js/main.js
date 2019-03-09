// Add map and basemap to the screen
// TODO: Recolor the layers that aren't drainage lines
const map = L.map("map", {
    fullscreenControl: true,
    timeDimension: true,
    timeDimensionControl: true,
}).setView([19.042805, -70.581183], 8);

L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    zIndex: 1,
}).addTo(map);

const owsrootUrl = 'http://localhost:8080/geoserver/ows';

// Population Layer (populationData variable defined in geojson_layers.js)
const populationLayer = L.geoJSON(populationData, {
    onEachFeature: onEachFeaturePopulation
}).addTo(map);

// 	Watershed Layer (watershedData variable defined in geojson_layers.js)
const watershedLayer = L.geoJSON(watershedData, {
    onEachFeature: onEachWatershed
});

// Drainage Line Layer
// const defaultParameters = {
//     service: 'WFS',
//     version: '2.0',
//     request: 'GetFeature',
//     typeName: 'yaque_del_norte:ClippedYaqueDrainage',
//     outputFormat: 'text/javascript',
//     format_options: 'callback:getJson',
//     SrsName: 'EPSG:4326'
// };
//
// const parameters = L.Util.extend(defaultParameters);
// const URL = owsrootUrl + L.Util.getParamString(parameters);
//
// $.ajax({
//     url : URL,
//     dataType : 'jsonp',
//     jsonpCallback : 'getJson',
//     success : function (response) {
//         console.log(JSON.stringify(response));
//         let WFSLayer = L.geoJson(response).addTo(map);
//     }
// });
const drainageLineLayer = L.geoJSON(drainageLineData).addTo(map);

// 	Land Use Layer Layer
const landUseLayer = L.tileLayer.wms(owsrootUrl, {
    layers: 'yaque_del_norte:yaque_uso',
    transparency: 'true',
    format: 'image/png',
    opacity: 0.5,
});

let overlays = {
    "Population Layer": populationLayer,
    "Watershed Layer": watershedLayer,
    "Land Use Layer": landUseLayer,
};

L.control.layers(overlays).addTo(map);


$("#dateinput").on('change', function () {
    var date = document.getElementById("dateinput").value;
    console.log(date);
});


// Helper Functions
function onEachFeaturePopulation(feature, layer) {
    let popupContent = `
        <table>
            <tbody>
                <tr>
                    <td>Provincia:&nbsp;</td>
                    <td>&nbsp;${feature.properties.PROV}</td>
                </tr>
                <tr>
                    <td>Regi&oacute;n:&nbsp;</td>
                    <td>&nbsp;${feature.properties.REG}</td>
                </tr>
                <tr>
                    <td>Toponimia:&nbsp;</td>
                    <td>&nbsp;${feature.properties.TOPONIMIA}</td>
                </tr>
                <tr>
                    <td>Population:&nbsp;</td>
                    <td>&nbsp;${feature.properties.Population}</td>
                </tr>
            </tbody>
        </table>`;

    layer.bindPopup(popupContent);
}

function onEachWatershed(feature, layer) {
    let popupContent = `
        <table>
            <tbody>
                <tr>
                    <td>Area:&nbsp;</td>
                    <td>&nbsp;${feature.properties.AREA}</td>
                </tr>
                <tr>
                    <td>Perimeter:&nbsp;</td>
                    <td>&nbsp;${feature.properties.PERIMETER}</td>
                </tr>
                <tr>
                    <td>CUENCA1_:&nbsp;</td>
                    <td>&nbsp;${feature.properties.CUENCA1_}</td>
                </tr>
                <tr>
                    <td>CUENCA1_ID:&nbsp;</td>
                    <td>&nbsp;${feature.properties.CUENCA1_ID}</td>
                </tr>
                <tr>
                    <td>NOMBRE:&nbsp;</td>
                    <td>&nbsp;${feature.properties.NOMBRE}</td>
                </tr>
                <tr>
                    <td>MICRO:&nbsp;</td>
                    <td>&nbsp;${feature.properties.MICRO}</td>
                </tr>
                <tr>
                    <td>HECTARES:&nbsp;</td>
                    <td>&nbsp;${feature.properties.HECTARES}</td>
                </tr>
                <tr>
                    <td>AREAKM2:&nbsp;</td>
                    <td>&nbsp;${feature.properties.AREAKM2}</td>
                </tr>
            </tbody>
        </table>`;

    layer.bindPopup(popupContent);
}

