var express = require('express');
var app = express();
var _ = require('underscore');
var bodyParser = require('body-parser');
var request = require('request');
var resolve = require('path').resolve;
var fetch = require('node-fetch');
var fetchData = require('./app/api').fetch;

app.use(bodyParser.json());

var sources = {
    original: {
        name: 'Original history data',
        url: '/api/v2/projects?select={id,name,customValues}',
        handler: ((data) => data)
    },
    daily: {
        name: 'Daily history data',
        url: '/api/v2/projects?select={id,name,customValues}',
        handler: ((data) => data)
    },
    weekly: {
        name: 'Weekly history data',
        url: '/api/v2/projects?select={id,name,customValues}',
        handler: ((data) => data)
    },
    monthly: {
        name: 'Monthly history data',
        url: '/api/v2/projects?select={id,name,customValues}',
        handler: ((data) => data)
    }
};

app.get('/logo', function(req, res) {
    res.sendFile(resolve('./logo.svg'));
});

app.get('/', function (req, res) {
    var app = {
        'name': 'Sample history connector',
        'version': '2.0',
        'description': 'Sample history connector to Targetprocess',
        'authentication': [
            {
                'id': 'token',
                'name': 'API Token Authentication',
                'description': 'Token authentication for access to Targetprocess',
                'fields': [
                    {
                        'optional': false,
                        'id': 'host',
                        'name': 'TP Path',
                        'type': 'url',
                        'description': 'Path to your Targetprocess instance',
                        'datalist': false
                    },
                    {
                        'optional': true,
                        'id': 'token_link',
                        'value': 'http://dev.targetprocess.com/rest/authentication#token',
                        'type': 'link',
                        'name': 'More details',
                        'datalist': false,
                        'description': 'To get your API token, navigate to [your tp instance]/api/v1/authentication'
                    },
                    {
                        'optional': false,
                        'id': 'token',
                        'name': 'API Token',
                        'type': 'text',
                        'description': 'API Token from Targetprocess',
                        'datalist': false
                    }
                ]
            }
        ],
        'sources': _.keys(sources).map((key) => ({id: key, name: sources[key].name}))
    };

    res.json(app);
});

app.post(
    '/validate',
    (req, res, next) => {
        var authInfo = req.body.fields;
        fetchData(authInfo, '/api/v1/users/loggeduser')
            .then((x) => ({name: x.FirstName + ' ' + x.LastName}))
            .then((account) => res.json(account))
            .catch(next);
    });

app.post(
    '/',
    (req, res, next) => {
        var sourceId = req.body.source;
        var authInfo = req.body.account;
        var handler = sources[sourceId].handler;
        var url = sources[sourceId].url;

        fetchData(authInfo, url)
            .then((raw) => res.json(handler(raw.items)))
            .catch(next);
    });

app.listen(process.env.PORT || 8080);