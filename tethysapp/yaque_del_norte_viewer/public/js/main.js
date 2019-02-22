$(document).ready(function () {
    let map = L.map("map").setView([19.042805, -70.581183], 7.2);

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


