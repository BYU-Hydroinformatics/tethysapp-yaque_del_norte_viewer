// CSRF Validation for Ajax Requests
let csrftoken = Cookies.get('csrftoken');

function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

$.ajaxSetup({
    beforeSend: function (xhr, settings) {
        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    }
});


// Main Body
$(document).ready(function () {
    // Globals
    let currentFloodExtentLayer;
    let netcdf = L.layerGroup();

    // Add map and basemap to the screen
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
        style: function () {
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

    $.ajax({
        url: "/apps/yaque-del-norte-viewer/is_flooded_check/", // the endpoint
        type: "POST",
        data: JSON.stringify({}),
        dataType: 'json',

        // handle a successful response
        success: function (resp) {
            // Create object to lookup keys easily
            let lookUpObject = {};

            for (let i = 0; i < resp["rivids"].length; i++) {
                lookUpObject[resp["rivids"][i]] = resp["is_flooded"][i]
            }



            const drainageLineLayer = L.geoJSON(drainageLineData, {
                onEachFeature: function (feature, layer) {
                    if (lookUpObject[feature.properties.COMID]) {
                        layer.on({
                            click: whenClicked
                        });
                    }
                },

                style: function (feature) {
                    if (lookUpObject[feature.properties.COMID]) {
                        return {
                            weight: 2,
                            color: "#FF0000",
                            opacity: 1,
                        }
                    }
                },
            }).addTo(map);
            $("#page-loader").fadeOut();
        },

        // handle a non-successful response
        error: function (xhr, errmsg, err) {
            console.log(xhr.status + ": " + xhr.responseText); // provide info about the error to the console
        },
    });

    // When the Layer Control layer is changed this brings the drainage lines to the front of the map.
    map.on("baselayerchange", function (event) {
        drainageLineLayer.bringToFront();
    });

    // Event that fire's after the modal content is loaded
    $('#damage-report-modal').on('shown.bs.modal', function () {

        const comid = parseFloat($("#current-stream").html());

        // Not flooded: 104
        let json_data = {
            query_string: `https://tethys.byu.edu/thredds/fileServer/testAll/Yaque_Del_Norte_Viewer/floodextent${comid}.nc`
        };

        $.ajax({
            url: "/apps/yaque-del-norte-viewer/damage_report_ajax/", // the endpoint
            type: "POST", // http method
            data: JSON.stringify(json_data),
            dataType: 'json',

            // handle a successful response
            success: function (resp) {

                let isError = resp["error"];

                if (isError) {
                    let errorMessage = $("#error_message");
                    errorMessage.html(`<p>${resp["error_message"]}</p>`)
                    errorMessage.fadeIn();
                    $("#damage-report-loader").fadeOut();

                } else {
                    // Plot the damage at each date
                    const damage_data = [
                        {
                            x: resp["time_list"],
                            y: resp["damage_list"],
                            type: 'scatter'
                        }
                    ];

                    const layout_damage = {
                        title: 'Forecasted Damage',
                        width: 425,
                        height: 425,
                        xaxis: {
                            title: {
                                text: 'Date',
                            },
                        },
                        yaxis: {
                            title: {
                                text: 'Damage (U.S. Dollars)'
                            }
                        }
                    };

                    Plotly.newPlot('damage_plot', damage_data, layout_damage);

                    // Plot max depth at each time interval
                    const depth_data = [
                        {
                            x: resp["time_list"],
                            y: resp["max_height_list"],
                            type: 'scatter'
                        }
                    ];

                    const layout_depth = {
                        title: 'Forecasted Maximum Flood Depth',
                        width: 425,
                        height: 425,
                        xaxis: {
                            title: {
                                text: 'Date',
                            },
                        },
                        yaxis: {
                            title: {
                                text: 'Depth (m)'
                            }
                        }
                    };

                    Plotly.newPlot('depth_plot', depth_data, layout_depth);

                    // Plotting the number of people impacted on each day
                    const people_data = [
                        {
                            x: resp["time_list"],
                            y: resp["population_impacted_list"],
                            type: 'scatter'
                        }
                    ];

                    const layout_people = {
                        title: 'Number of People Impacted',
                        width: 425,
                        height: 425,
                        xaxis: {
                            title: {
                                text: 'Date',
                            },
                        },
                        yaxis: {
                            title: {
                                text: 'People Impacted'
                            }
                        }
                    };

                    Plotly.newPlot('people_plot', people_data, layout_people);

                    // Table Elements
                    const formatter = new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                    });

                    $("#max_damage").html(formatter.format(Math.max(...resp["damage_list"])));
                    $("#max_depth").html(Math.max(...resp["max_height_list"]).toString() + " meters");
                    $("#max_people").html(Math.max(...resp["population_impacted_list"]) + " people");

                    $("#damage-report").fadeIn();
                    $("#damage-report-loader").fadeOut();
                }
            },

            // handle a non-successful response
            error: function (xhr, errmsg, err) {
                $('#results').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: " + errmsg + ".</div>"); // add the error to the dom
                console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
                $("#damage-report-loader").fadeOut();
            }
        });
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

    function addnetcdflayer(wms, scale, maxheight) {

        let src;
        let style;
        let layer;
        let range;

        if (scale === 'prob') {
            range = '1.5,100';
            layer = 'Flood_Probability';
            style = 'boxfill/prob';
            src = "https://tethys.byu.edu/thredds/wms/testAll/floodextent/probscale.nc?REQUEST=GetLegendGraphic&LAYER=Flood_Probability&PALETTE=prob&COLORSCALERANGE=0,100";
        } else {
            range = '0,' + maxheight;
            layer = 'timeseries';
            style = 'boxfill/whiteblue';
            src = "https://tethys.byu.edu/thredds/wms/testAll/floodextent/floodedscale.nc?REQUEST=GetLegendGraphic&LAYER=Height&PALETTE=whiteblue&COLORSCALERANGE=0," + maxheight;
        }

        const floodMapLayer = L.tileLayer.wms(wms, {
            layers: layer,
            format: 'image/png',
            transparent: true,
            opacity: 0.8,
            styles: style,
            colorscalerange: range,
            attribution: '<a href="https://www.pik-potsdam.de/">PIK</a>'
        });

        const testTimeLayer = L.timeDimension.layer.wms(floodMapLayer, {
            updateTimeDimension: true,
        });
        netcdf.addLayer(testTimeLayer).addTo(map);


        $(".legend").remove();

        const Legend = L.control({
            position: 'bottomright'
        });

        Legend.onAdd = function (map) {
            const div = L.DomUtil.create('div', 'info legend');
            div.innerHTML +=
                '<img src="' + src + '" alt="legend">';
            return div;
        };

        Legend.addTo(map);
        floodMapLayer.bringToFront();
    }

    function whenClicked(e) {
        const COMID = e.target.feature.properties.COMID;

        netcdf.clearLayers();

        if (currentFloodExtentLayer) {
            map.removeLayer(currentFloodExtentLayer);
        }

        const testWMS = `https://tethys.byu.edu/thredds/wms/testAll/Yaque_Del_Norte_Viewer/floodextent${COMID}.nc`;
        const scale = 'flooded';
        const maxheight = 3;
        addnetcdflayer(testWMS, scale, maxheight);

        $("#current-stream").html(COMID);

        // TODO: Add this, should just have to get the path to a netcdf file on the server
        // currentFloodExtentLayer =

    }


});
