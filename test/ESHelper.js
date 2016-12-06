var elasticsearch = require('elasticsearch');

module.exports = function (host) {
    var client = new elasticsearch.Client({
        host: host
    });

    // elasticsearch mappings
    var mappings = {
        "poi": {
            "properties": {
                "admincode": {
                    "type": "string"
                }, "kind": {
                    "type": "string"
                }, "subkind": {
                    "type": "string"
                }, "name": {
                    "type": "string"
                }, "address": {
                    "type": "string"
                }, "telephone": {
                    "type": "string"
                }, "geom": {
                    "type": "geo_point"
                }, "suggest": {
                    "type": "completion"
                }
            }
        }
    }

    var INDEX = 'poi_search_test';

    // clean and fill seed data into elasticsearch
    var InitIndex = function (done) {
        client.indices.delete({
            index: INDEX
        }, function (err) {
            client.indices.create({
                index: INDEX,
                body: {
                    mappings: mappings
                }
            }).then(function () {
                var items = [];

                var terms = [
                    ['Huizhong Mansion', '1 Shangdi 7th St, Haidian Qu, Beijing Shi, China, 100085'],
                    ['Deshi Mansion', '9 Shangdi E Rd, Haidian Qu, China, 100193'],
                    ['Jubao Fishing Port', 'Chuangye Rd, Haidian Qu, China, 100193'],
                    ['Xiaoqiye Finance Business Center', 'Shangdi 7th St, Haidian Qu, Beijing Shi, China, 100193'],
                    ['Industrial and Commercial Bank of China', 'Qijie Roundabout, Haidian Qu, Beijing Shi, China, 100193'],
                    ['Inspur', 'Xinxi Rd, Haidian Qu, Beijing Shi, China, 100193'],
                    ['Bank of Beijing', '1 Xinxi Rd, Haidian Qu, Beijing Shi, China, 100193'],
                    ['Venture Park Business Center', 'Xinxi Rd, Haidian Qu, Beijing Shi, China, 100193'],
                    ['Pod Inn', '105 Qijie Roundabout, Haidian Qu, Beijing Shi, China, 100193'],
                    ['Qicai Countryside Tea House', 'China, Beijing Shi, Haidian Qu, Xinxi Rd'],
                    ['Parking Lot', 'Shangdi 8th St, Haidian Qu, Beijing Shi, China, 100193'],
                    ['Lucky Wonton', 'Shangdi E Rd, Haidian Qu, Beijing Shi, China, 100193'],
                    ['Casserole King', 'G7 Jingxin Expy, Haidian Qu, Beijing Shi, China, 100193'],
                    ['Haidian Postal Service', 'China, Beijing Shi, Haidian Qu, Shangdi 9th St'],
                    ['Bank of Beijing ATM', 'China, Beijing Shi, Haidian Qu, Shangdi E Rd'],
                    ['Huihuang International Liquor Store', 'China, Beijing Shi, Haidian Qu, Shangdi 10th St'],
                    ['Zhongguancun Software Park', 'Shangdi W Rd, Haidian Qu, Beijing Shi, China, 100193'],
                    ['Baidu Building', '10 Shangdi 10th St, Haidian Qu, China, 100193'],
                    ['Zhongguancun', 'Zhongguancun, Haidian, China, 100000'],
                    ['Mei Jia Huan Le Ying Cheng', 'Zhongguancun Plaza Shopping Mall, 5 Zhongguancun St, ZhongGuanCun, Haidian Qu, Beijing Shi, China, 100000'],
                    ['Citibank', 'China, Beijing Shi, Haidian Qu, ZhongGuanCun, N 4th Ring Rd W, 58号, Ideal International Plaza Property Management Office, 100000'],
                    ['Donglaishun', '34 Haidian St, Haidian Qu, Beijing Shi, China, 100080'],
                    ['Christian Church', '9 Caihefang Rd, Haidian Qu, China, 100000'],
                    ['Microsoft Asia-Pacific R & D Group Headquarters', '5 Danling St, ZhongGuanCun, Haidian Qu, Beijing Shi, China, 100080'],
                    ['The Middle-8th Restaurant', 'China, Beijing Shi, Haidian Qu, ZhongGuanCun'],
                    ['EC Mall', '1 Danling St, ZhongGuanCun, Haidian Qu, Beijing Shi, China, 100000'],
                    ['HSBC (China)', 'China, Beijing Shi, Haidian Qu, ZhongGuanCun, Danling St, 3']
                ];
                // generate random data
                for (var i in terms) {
                    items.push({ index: { _index: INDEX, _type: 'poi', _id: i.toString() } });
                    items.push({
                        admincode: String.fromCharCode('A'.charCodeAt(0) + i % 5), kind: 'kind' + i % 10, subkind: 'subkind' + i % 5,
                        name: terms[i][0], address: terms[i][1], telephone: i + '0000000', geom: {
                            lat: 39.00000 + i / 1000,
                            lon: 116.00000
                        }, suggest: {
                            input: terms[i]
                        }
                    });
                }           

                return client.bulk({
                    body: items
                });
            }).then(function () {
                // wait for elk to prepare data
                setTimeout(done, 3000);
            }).catch(function (err) {
                console.log(err);
            });
        });
    };

    // clean test data
    var CleanIndex = function (done) {
        client.indices.delete({
            index: INDEX
        }, function (err) {
            done(err);
        });
    };

    return {
        INDEX: INDEX,
        InitIndex: InitIndex,
        CleanIndex: CleanIndex
    }

}
