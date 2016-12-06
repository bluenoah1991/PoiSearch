import elasticsearch from 'elasticsearch';
import _ from 'lodash';

export default class ESProxy{
    constructor(host, index){
        this.index = index;
        this.client = new elasticsearch.Client({
            host: host
        });
    }

    SearchPoiByKey(key, cb){
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
        }, function(err, response){
            if(err != undefined){
                cb(err);
            } else {
                cb(null, _.map(response.hits.hits, function(hit){
                    return _.assign({}, hit._source, {
                        _id: hit._id
                    })
                }));
            }
        });
    }

    SearchPoiByPoint(lat, lon, distance, cb){
        distance = distance || '1km'

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
        }, function(err, response){
            if(err != undefined){
                cb(err);
            } else {
                cb(null, _.map(response.hits.hits, function(hit){
                    return _.assign({}, hit._source, {
                        _id: hit._id
                    })
                }));
            }
        });
    }

    SearchPoiByPolygon(points, cb){
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
        }, function(err, response){
            if(err != undefined){
                cb(err);
            } else {
                cb(null, _.map(response.hits.hits, function(hit){
                    return _.assign({}, hit._source, {
                        _id: hit._id
                    })
                }));
            }
        });
    }

    SearchPoiById(id, cb){
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
        }, function(err, response){
            if(err != undefined){
                cb(err);
            } else {
                cb(null, _.map(response.hits.hits, function(hit){
                    return _.assign({}, hit._source, {
                        _id: hit._id
                    })
                }));
            }
        });
    }

    InputTips(text, cb){
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
        }, function(err, response){
            if(err != undefined){
                cb(err);
            } else {
                if(response.autocomplete.length > 0){
                    cb(null, _.map(response.autocomplete[0].options, function(option){
                        return _.assign({}, option._source, {
                            _id: option._id
                        })
                    }))
                } else {
                    cb(null, []);
                }
            }
        });
    }
}