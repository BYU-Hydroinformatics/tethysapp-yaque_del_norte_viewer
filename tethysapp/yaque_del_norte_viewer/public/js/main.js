// Add map and basemap to the screen

let comid;
let currentFloodExtentLayer;

const map = L.map("map", {
    fullscreenControl: true,
    timeDimension: true,
    timeDimensionControl: true,
}).setView([19.042805, -70.581183], 8);

L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    zIndex: 1,
}).addTo(map);

// Population Layer (populationData variable defined in watershed_data.js)
const populationLayer = L.geoJSON(populationData, {
    onEachFeature: onEachFeaturePopulation,
    style: function (feature) {
        return {
            weight: 2,
            color: "#000000",
            opacity: 1,
            fillColor: "#B0DE5C",
            fillOpacity: 0.8
        }
    },
}).addTo(map);

// 	Watershed Layer (watershedData variable defined in watershed_data.js)
const watershedLayer = L.geoJSON(watershedData, {
    onEachFeature: onEachWatershed,
    style: function (feature) {
        return {
            weight: 2,
            color: "#000000",
            opacity: 1,
            fillColor: "#B0DE5C",
            fillOpacity: 0.8
        }
    },
});

let overlays = {
    "Population Layer": populationLayer,
    "Watershed Layer": watershedLayer,
};

L.control.layers(overlays).addTo(map);
const drainageLineLayer = L.geoJSON(drainageLineData, {
    onEachFeature: onEachDrainageLine
}).addTo(map);


$("#dateinput").on('change', function () {
    const date = document.getElementById("dateinput").value;
});

// When the Layer Control layer is changed this brings the drainage lines to the front of the map.
map.on("baselayerchange", function (event) {
  drainageLineLayer.bringToFront();
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

function onEachDrainageLine(feature, layer) {
    // comid.push(feature.properties.HydroID); // TODO: Change this to COMID

    layer.on({
        click: whenClicked
    });

}

function whenClicked(e) {
    const gridid = e.target.feature.properties.GridID;

    if (currentFloodExtentLayer) {
         map.removeLayer(currentFloodExtentLayer);
    }
    grid = 104;
    // TODO: Clear all other maps, and add the selected flood extent to the map
    $("#current-stream").html(gridid); //Wade put this in, I'm not entirely sure why it's here.

    var testWMS="https://tethys.byu.edu/thredds/wms/testAll/floodextent/floodedgrid" + data['gridid'] + ".nc"

    addnetcdflayer (testWMS)
    comid = gridid;

    // TODO: Add this, should just have to get the path to a netcdf file on the server
    // currentFloodExtentLayer =
}


const data = [
    {
        x: ['2013-10-04 22:23:00', '2013-11-04 22:23:00', '2013-12-04 22:23:00'],
        y: [1, 3, 6],
        type: 'scatter'
    }
];

const layout_damage = {
    title: 'Forecasted Damage',
    width: 425,
    height: 425,
//    xaxis: {
//        title: {
//            text: 'Date',
//        },
//    },
    yaxis: {
        title: {
            text: 'Damage (U.S. Dollars)'
        }
    }
};

const layout_depth = {
    title: 'Forecasted Average Flood Depth',
    width: 425,
    height: 425,
//    xaxis: {
//        title: {
//            text: 'Date',
//        },
//    },
    yaxis: {
        title: {
            text: 'Depth (ft.)'
        }
    }
};

const layout_people = {
    title: 'Number of People Impacted',
    width: 425,
    height: 425,
//    xaxis: {
//        title: {
//            text: 'Date',
//        },
//    },
    yaxis: {
        title: {
            text: 'People Impacted'
        }
    }
};

Plotly.newPlot('plot-test', data, layout_damage);
Plotly.newPlot('plot-test-2', data, layout_depth);
Plotly.newPlot('plot-test-3', data, layout_people);