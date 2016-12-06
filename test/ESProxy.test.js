var assert = require('chai').assert;

var ESProxy = require('../lib/ESProxy').default;
var Projection = require('../lib/Projection').default;

var host = '192.168.102.73:9200';

var ESHelper = (require('./ESHelper'))(host);

before(function (done) {
    this.timeout(5000);
    ESHelper.InitIndex(done);
});

after(function (done) {
    ESHelper.CleanIndex(done);
});

describe('ESProxy', function () {
    var proxy = new ESProxy(host, ESHelper.INDEX);

    describe('Search Poi by Key', function () {

        it('Search by Name', function (done) {
            setTimeout(function () { done(new Error('Timeout')); }, 3000);

            var key = 'Huizhong';
            proxy.SearchPoiByKey(key, function (err, result) {
                assert.isArray(result, 'search result is an array');
                assert.isOk(result.length > 0, 'there are at least one result');
                assert.equal(result[0].name, 'Huizhong Mansion', 'the first item is Huizhong Mansion');
                done(err);
            });
        });

        it('Search by Address', function (done) {
            setTimeout(function () { done(new Error('Timeout')); }, 3000);

            var key = 'Chuangye';
            proxy.SearchPoiByKey(key, function (err, result) {
                assert.isArray(result, 'search result is an array');
                assert.isOk(result.length > 0, 'there are at least one result');
                assert.equal(result[0].address, 'Chuangye Rd, Haidian Qu, China, 100193', 'the first item is Jubao Fishing Port');
                done(err);
            });
        });

        it('Fuzzy Search', function (done) {
            setTimeout(function () { done(new Error('Timeout')); }, 3000);

            var key = 'spur';
            proxy.SearchPoiByKey(key, function (err, result) {
                assert.isArray(result, 'search result is an array');
                assert.isOk(result.length > 0, 'there are at least one result');
                assert.equal(result[0].name, 'Inspur', 'the first item is Inspur');
                done(err);
            });
        });

        it('Multi Terms Search', function (done) {
            setTimeout(function () { done(new Error('Timeout')); }, 3000);

            var key = 'Beijing';
            proxy.SearchPoiByKey(key, function (err, result) {
                assert.isArray(result, 'search result is an array');
                assert.isOk(result.length > 4, 'there are at least one result');
                assert.include(result[0].name, 'Beijing', 'first match name');
                assert.include(result[1].name, 'Beijing', 'first match name');
                assert.include(result[3].address, 'Beijing', 'first match name');
                assert.include(result[4].address, 'Beijing', 'first match name');
                done(err);
            });
        });

    });

    describe('Search Poi by Point', function () {

        it('Search 1km distance', function (done) {
            setTimeout(function () { done(new Error('Timeout')); }, 3000);

            var lat = 39.00000;
            var lon = 116.00000;

            proxy.SearchPoiByPoint(lat, lon, null, function (err, result) {
                assert.isArray(result, 'search result is an array');
                assert.isOk(result.length > 0, 'there are at least one result');
                result.forEach(function (item) {
                    assert.isBelow(item.geom.lat - lat, 0.01, 'lat distance less than 0.01');
                });
                done(err);
            });
        });

    });

    describe('Search Poi by Polygon', function () {

        it('Search Square', function (done) {
            setTimeout(function () { done(new Error('Timeout')); }, 3000);

            var points = [
                [115.005, 38.005],
                [115.005, 39.005],
                [116.005, 39.005],
                [116.005, 38.005]
            ];

            proxy.SearchPoiByPolygon(points, function (err, result) {
                assert.isArray(result, 'search result is an array');
                assert.isOk(result.length > 0, 'there are at least one result');
                result.forEach(function (item) {
                    assert.isAtMost(item.geom.lat, 39.005, 'lat distance less than or equal to 0.01');
                });
                done(err);
            });
        });

    });

    describe('Search Poi by Id', function () {

        it('Search Id', function (done) {
            setTimeout(function () { done(new Error('Timeout')); }, 3000);

            var id = '5';

            proxy.SearchPoiById(id, function (err, result) {
                assert.isArray(result, 'search result is an array');
                assert.isOk(result.length > 0, 'there are at least one result');
                result.forEach(function (item) {
                    assert.equal(item._id, id, 'the uid equal to 5');
                });
                done(err);
            });
        });

    });

    describe('Input tips', function () {

        it('Input tips', function (done) {
            setTimeout(function () { done(new Error('Timeout')); }, 3000);

            var text = 'zhong';

            proxy.InputTips(text, function (err, result) {
                assert.isArray(result, 'search result is an array');
                assert.isOk(result.length > 0, 'there are at least one result');
                result.forEach(function (item) {
                    assert.isOk(item.name.toLowerCase().startsWith(text) ||
                        item.address.toLowerCase().startsWith(text),
                        'the name or address startswith \'zhong\'');
                });
                done(err);
            });
        });

    });

});

describe('Projection', function () {

    it('Mercator to Latlon', function () {
        var latlon = Projection.m2ll(5299424.36041, 1085840.05328);
        assert.equal(Math.floor(latlon.lat * 100000) / 100000, 9.77165, 'Lat equal to 9.77165');
        assert.equal(Math.floor(latlon.lon * 100000) / 100000, 47.60553, 'Lat equal to 47.60553');
    });

    it('Latlon to Mercator', function () {
        var mercator = Projection.ll2m(47.6035525, 9.770602);
        assert.equal(Math.floor(mercator.x * 1000) / 1000, 5299203.224, 'X equal to 5299203.224');
        assert.equal(Math.floor(mercator.y * 1000) / 1000, 1085722.218, 'Y equal to 1085722.218');
    });

});