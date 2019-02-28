$(document).ready(function () {
    var map = L.map("map", {
        fullscreenControl: true,
        timeDimension: true,
        timeDimensionControl: true,
        }).setView([19.042805, -70.581183], 8);

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
        zIndex: 1,
    }).addTo(map);

    L.tileLayer.wms("http://localhost:8080/geoserver/yaque_del_norte/wms", {
        layers: 'yaque_del_norte:dominican_republic-national-drainage_line',
        transparent: true,
        zIndex: 2,
        format: "image/png",
    }).addTo(map);
});


$("#dateinput").on('change', function(){
    var date = document.getElementById("dateinput").value;
    console.log(date);
});
