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
    let comid;
    let currentFloodExtentLayer;


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

    // Event that fire's after the modal content is loaded
    $('#damage-report-modal').on('shown.bs.modal', function () {

        let json_data = {
            query_string: "https://tethys.byu.edu/thredds/fileServer/testAll/floodextent/floodedgrid186.nc"
        };

        $.ajax({
            url: "/apps/yaque-del-norte-viewer/damage_report_ajax/", // the endpoint
            type: "POST", // http method
            data: JSON.stringify(json_data),
            dataType: 'json',

            // handle a successful response
            success: function (resp) {

                console.log(resp);

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
                    title: 'Forecasted Average Flood Depth',
                    width: 425,
                    height: 425,
                    xaxis: {
                        title: {
                            text: 'Date',
                        },
                    },
                    yaxis: {
                        title: {
                            text: 'Depth (ft.)'
                        }
                    }
                };

                Plotly.newPlot('depth_plot', depth_data, layout_depth);

                // Plotting the number of people impacted on each day
                const people_data = [
                    {
                        x: resp["time_list"],
                        y: resp["max_height_list"], // TODO: Change this to the actual data
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
                //$("#max_people").html(Math.max(...resp["max_people_list"])); // TODO: Change this to the actual values
                $("#max_people").html("1543 People");

                $("#damage-report").fadeIn();
                console.log(resp);
                $("#damage-report-loader").fadeOut();
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
        let grid = 104;
        // TODO: Clear all other maps, and add the selected flood extent to the map
        $("#current-stream").html(gridid); //Wade put this in, I'm not entirely sure why it's here.

        // TODO: Finish this line
        //const testWMS = "https://tethys.byu.edu/thredds/wms/testAll/floodextent/floodedgrid" + data['gridid'] + ".nc";

        // TODO: Add this method
        // addnetcdflayer(testWMS);
        comid = gridid;

        // TODO: Add this, should just have to get the path to a netcdf file on the server
        // currentFloodExtentLayer =
    }
});
