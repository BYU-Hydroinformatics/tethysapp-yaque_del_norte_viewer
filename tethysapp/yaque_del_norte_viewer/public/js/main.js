$(document).ready(function () {
    let map = L.map("map").setView([19.042805, -70.581183], 7.2);

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    $.ajax({
        dataType: "json",
        url: "/static/yaque_del_norte_viewer/GeoJSON/yaque_del_norte.geojson",
        success: function (data) {
            console.log(data);

            let myStyle = {
                "color": "#2427ff",
                "weight": 5,
                "opacity": 0.65
            };

            L.geoJSON(data, {style: myStyle}).addTo(map);

            // let yaqueDelNorteLayer = new L.GeoJSON();
            //
            // $(data.features).each(function (key, data) {
            //
            //     console.log(data);
            //     yaqueDelNorteLayer.addData(data);
            // });

            // console.log(yaqueDelNorteLayer);
            //

            // yaqueDelNorteLayer.setStyle(myStyle);
            //
            // yaqueDelNorteLayer.addTo(map);
        }
    });
});

