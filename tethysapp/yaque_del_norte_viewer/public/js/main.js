
$(document).ready(function () {
    let map = L.map("map").setView([19.042805, -70.581183], 7.2);

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

});