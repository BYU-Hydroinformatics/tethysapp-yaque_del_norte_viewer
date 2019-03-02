$(document).ready(function () {
    const map = L.map("map", {
        fullscreenControl: true,
        timeDimension: true,
        timeDimensionControl: true,
    }).setView([19.042805, -70.581183], 8);

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
        zIndex: 1,
    }).addTo(map);

    // L.tileLayer.wms("http://localhost:8080/geoserver/yaque_del_norte/wms", {
    //     layers: 'yaque_del_norte:population_yaque',
    //     transparent: true,
    //     zIndex: 2,
    //     format: "image/png",
    // }).addTo(map);

    // TODO: Split this stuff into functions, and only allow one layer at a time
    const owsrootUrl = 'http://localhost:8080/geoserver/ows';

    // Population Layer
    const defaultParametersPopulation = {
        service: 'WFS',
        version: '2.0',
        request: 'GetFeature',
        typeName: 'yaque_del_norte:population_yaque',
        outputFormat: 'text/javascript',
        format_options: 'callback:getJson',
        SrsName: 'EPSG:4326'
    };
    const parametersPopulation = L.Util.extend(defaultParametersPopulation);
    const populationURL = owsrootUrl + L.Util.getParamString(parametersPopulation);

    // 	Land Use Layer
    const defaultParametersLandUse = {
        service: 'WFS',
        version: '2.0',
        request: 'GetFeature',
        typeName: 'yaque_del_norte:yaque',
        outputFormat: 'text/javascript',
        format_options: 'callback:getJson',
        SrsName: 'EPSG:4326'
    };
    const parametersLandUse = L.Util.extend(defaultParametersLandUse);
    const landUseURL = owsrootUrl + L.Util.getParamString(parametersLandUse);

    // 	Watershed Layer Layer
    const defaultParametersWatershed = {
        service: 'WFS',
        version: '2.0',
        request: 'GetFeature',
        typeName: 'yaque_del_norte:yaque_uso',
        outputFormat: 'text/javascript',
        format_options: 'callback:getJson',
        SrsName: 'EPSG:4326'
    };
    const parametersWatershed = L.Util.extend(defaultParametersWatershed);
    const watershedURL = owsrootUrl + L.Util.getParamString(parametersWatershed);

    // Population Layer
    $.ajax({
        url: populationURL,
        dataType: 'jsonp',
        jsonpCallback: 'getJson',
        success: function (response) {
            let WFSLayer = L.geoJson(response, {
                // style: function (feature) {
                //     return {
                //         stroke: false,
                //         fillColor: 'FFFFFF',
                //         fillOpacity: 0
                //     };
                // },
                onEachFeature: onEachFeaturePopulation  // Helper Function
            }).addTo(map);
        }
    });

    // Land Use Layer
    $.ajax({
        url: landUseURL,
        dataType: 'jsonp',
        jsonpCallback: 'getJson',
        success: function (response) {
            let WFSLayer = L.geoJson(response, {
                style: {
                    weight: 2,
                    color: "#999",
                    opacity: 1,
                    fillColor: "#B0DE5C",
                    fillOpacity: 0.8
                },
                onEachFeature: onEachFeatureLandUse  // Helper Function
            }).addTo(map);
        }
    });

    // $.ajax({
    //     url: URL,
    //     dataType: 'jsonp',
    //     jsonpCallback: 'getJson',
    //     success: function (response) {
    //         let WFSLayer = L.geoJson(response, {
    //             // style: function (feature) {
    //             //     return {
    //             //         stroke: false,
    //             //         fillColor: 'FFFFFF',
    //             //         fillOpacity: 0
    //             //     };
    //             // },
    //             onEachFeature: onEachFeaturePopulation  // Helper Function
    //         }).addTo(map);
    //     }
    // });

});


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

    // if (feature.properties && feature.properties.popupContent) {
    //     popupContent += feature.properties.popupContent;
    // }

    layer.bindPopup(popupContent);
}

function onEachFeatureLandUse(feature, layer) {
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

    // if (feature.properties && feature.properties.popupContent) {
    //     popupContent += feature.properties.popupContent;
    // }

    layer.bindPopup(popupContent);
}
