'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _elasticsearch = require('elasticsearch');

var _elasticsearch2 = _interopRequireDefault(_elasticsearch);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ESProxy = function () {
    function ESProxy(host, index) {
        _classCallCheck(this, ESProxy);

        this.index = index;
        this.client = new _elasticsearch2.default.Client({
            host: host
        });
    }

    _createClass(ESProxy, [{
        key: 'SearchPoiByKey',
        value: function SearchPoiByKey(key, cb) {
            var body = {
                query: {
                    multi_match: {
                        query: key,
                        fields: ["name^2", "address^1"],
                        fuzziness: 2
                    }
                }
            };

            this.client.search({
                index: this.index,
                body: body
            }, function (err, response) {
                if (err != undefined) {
                    cb(err);
                } else {
                    cb(null, _lodash2.default.map(response.hits.hits, function (hit) {
                        return _lodash2.default.assign({}, hit._source, {
                            _id: hit._id
                        });
                    }));
                }
            });
        }
    }, {
        key: 'SearchPoiByPoint',
        value: function SearchPoiByPoint(lat, lon, distance, cb) {
            distance = distance || '1km';

            var body = {
                query: {
                    bool: {
                        filter: {
                            geo_distance: {
                                distance: distance,
                                geom: {
                                    lat: lat,
                                    lon: lon
                                }
                            }
                        }
                    }
                }
            };

            this.client.search({
                index: this.index,
                body: body
            }, function (err, response) {
                if (err != undefined) {
                    cb(err);
                } else {
                    cb(null, _lodash2.default.map(response.hits.hits, function (hit) {
                        return _lodash2.default.assign({}, hit._source, {
                            _id: hit._id
                        });
                    }));
                }
            });
        }
    }, {
        key: 'SearchPoiByPolygon',
        value: function SearchPoiByPolygon(points, cb) {
            var body = {
                query: {
                    bool: {
                        filter: {
                            geo_polygon: {
                                geom: {
                                    points: points
                                }
                            }
                        }
                    }
                }
            };

            this.client.search({
                index: this.index,
                body: body
            }, function (err, response) {
                if (err != undefined) {
                    cb(err);
                } else {
                    cb(null, _lodash2.default.map(response.hits.hits, function (hit) {
                        return _lodash2.default.assign({}, hit._source, {
                            _id: hit._id
                        });
                    }));
                }
            });
        }
    }, {
        key: 'SearchPoiById',
        value: function SearchPoiById(id, cb) {
            var body = {
                query: {
                    ids: {
                        values: [id]
                    }
                }
            };

            this.client.search({
                index: this.index,
                body: body
            }, function (err, response) {
                if (err != undefined) {
                    cb(err);
                } else {
                    cb(null, _lodash2.default.map(response.hits.hits, function (hit) {
                        return _lodash2.default.assign({}, hit._source, {
                            _id: hit._id
                        });
                    }));
                }
            });
        }
    }, {
        key: 'InputTips',
        value: function InputTips(text, cb) {
            var body = {
                autocomplete: {
                    prefix: text,
                    completion: {
                        field: 'suggest'
                    }
                }
            };

            this.client.suggest({
                index: this.index,
                body: body
            }, function (err, response) {
                if (err != undefined) {
                    cb(err);
                } else {
                    if (response.autocomplete.length > 0) {
                        cb(null, _lodash2.default.map(response.autocomplete[0].options, function (option) {
                            return _lodash2.default.assign({}, option._source, {
                                _id: option._id
                            });
                        }));
                    } else {
                        cb(null, []);
                    }
                }
            });
        }
    }]);

    return ESProxy;
}();

exports.default = ESProxy;
//# sourceMappingURL=ESProxy.js.map