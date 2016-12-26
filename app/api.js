var _ = require('underscore');
var fetch = require('node-fetch');

var getHost = (host) => {
    var pure = host.replace(/\/+$/g, '');
    if (pure.indexOf('http') !== 0) {
        pure = `https://${pure}`;
    }
    return pure;
};

var appendTokenToUrl = (url, account) => (url + '&token=' + account.token);

var extractErrorMessage = (body) => {

    var m = _.last(select('.InnerException .Message', body));

    if (_.isEmpty(m)) {
        m = _.last(select('.Items .Details .Value', body));
    }

    if (_.isEmpty(m)) {
        m = _.first(select('.Message', body));
    }

    return m;
};

var errorResponse = (message, url) => {
    var msg = message || 'Wow. We got troubles with TargetProcess communication';
    throw new Error(msg);
};

var processResponse = (res, url) => {
    if (!res.ok) {
        if (res.headers.get('content-type').indexOf('json') >= 0) {
            return (res
                .json()
                .then((body) => errorResponse(extractErrorMessage(body), url)));
        }

        return res.text().then((message) => errorResponse(message, url));
    }

    return res.json();
};

var fetchAccountData = (url, account, options) => {
    options = options || {method: 'GET'};
    var fetchUrl = appendTokenToUrl(url, account);
    return (fetch(fetchUrl, options)
        .then((res) => res)
        .then((res) => processResponse(res, url)));
};

var fetchPostOrGet = (authInfo, remotePath, body) => {

    var options = {
        method: body ? 'POST' : 'GET'
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    var delimiter = remotePath.indexOf('?') > 0 ? '&' : '?';

    return fetchAccountData(remotePath + delimiter + 'format=json', authInfo, options);
};

module.exports = {
    fetch: (authInfo, path, body) => {
        var remotePath = getHost(authInfo.host) + path;
        return fetchPostOrGet(authInfo, remotePath, body);
    }
};