'use strict';
module.exports = function (gitRoot) {
    var d3 = require('d3');
    var fs = require('fs');
    var path = require('path');
    var geoPath = path.join(gitRoot, 'similarweb-pro/SimilarWebPro.Website/Images/GeoJson');

    fs.mkdirSync('out');

    var files = fs.readdirSync(geoPath);
    for (var i in files) {
        var file = files[i];
        var str = fs.readFileSync(path.join(geoPath, file));
        try {
            var json = JSON.parse(str);
        } catch (e) {
            console.error('error in file: ' + file);
        }
        geo(json, file.substr(0, file.length - 5));
    }
    return 'done';

    function geo(json, id) {
        var height = 90,
            width = 110;

        console.log('reading ' + id);

        var center = d3.geo.centroid(json);

        var scale = height / 2;
        var offset = [width / 2, height / 2];
        var projection = d3.geo.mercator().scale(scale).center(center)
            .translate(offset);

        // create the path
        var svgPath = d3.geo.path().projection(projection);

        // using the path determine the bounds of the current map and use
        // these to determine better values for the scale and translation
        var bounds = svgPath.bounds(json);
        var hscale = scale * width / (bounds[1][0] - bounds[0][0]);
        var vscale = scale * height / (bounds[1][1] - bounds[0][1]);
        scale = (hscale < vscale) ? hscale : vscale;
        offset = [width - (bounds[0][0] + bounds[1][0]) / 2,
            height - (bounds[0][1] + bounds[1][1]) / 2];

        // new projection
        projection = d3.geo.mercator().center(center)
            .scale(scale).translate(offset);
        svgPath = svgPath.projection(projection);
        var pathStr = svgPath(json, 0);

        var svg = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n<svg xmlns="http://www.w3.org/2000/svg" id="vis-country-' + id + '" width="' + width + '" height="' + height + '"><path d="' + pathStr + '" style="fill: rgb(59, 122, 181);"></path></svg>';
        fs.writeFileSync(path.join(__dirname, 'out', id + '.svg'), svg);
    }
};