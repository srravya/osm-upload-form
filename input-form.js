'use strict';

var http = require('http'),
    util = require('util'),
    fs = require('fs'),
    forms = require('forms'),
    GeoJSON = require('geojson'),
    jsontemplate = require('./json-template');

var fields = forms.fields,
    validators = forms.validators,
    widgets = forms.widgets;

// template for the example page
var template = jsontemplate.Template(
    fs.readFileSync(__dirname + '/page.jsont').toString()
);

// our example registration form
var reg_form = forms.create({
        lat: fields.number({ required: true }),
        lng: fields.number({ required: true }),
        "addr:city": fields.string({ required: true, label: 'City' }),
        "addr:country": fields.string({ required: true, label: 'Country' }),
        "addr:housenumber": fields.string({ required: true, label: 'Door Number' }),
        "addr:street": fields.string({ required: true, label: 'Street' }),
        "addr:postcode": fields.string({ required: true, label: 'Pin Code' }),
        "addr:amenity": fields.string({
            choices: {
                'library': 'Library',
                'police station': 'Police Station',
                },
            widget: widgets.select()
        }),
        "addr:name": fields.string({ required: true, label: 'Name' }),
        "addr:opening_hours": fields.string({ required: true, label: 'Opening Hours' }),
        "addr:operator": fields.string({ required: true, label: 'Operator' })
});

http.createServer(function (req, res) {
    reg_form.handle(req, {
        success: function (form) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write('<h1>Success!</h1>');
            var jsonContent = GeoJSON.parse(form.data, {Point: ['lat', 'lng']}) ;
            fs.writeFile("test.geojson", JSON.stringify(jsonContent), function(err) {
                if(err) {
                    return console.log(err);
                }

                console.log("The file was saved!");
            });
            res.write('<pre>' + JSON.stringify(jsonContent) + '</pre>')
            res.end('<pre>' + util.inspect(form.data) + '</pre>');
        },
        // perhaps also have error and empty events
        other: function (form) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(template.expand({
                form: form.toHTML(),
                enctype: '',
                method: 'GET'
            }));
        }
    });

}).listen(8080);

util.puts('Server running at http://127.0.0.1:8080/');

