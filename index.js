var koa = require('koa');
var router = require('koa-router')();
var Q = require('q');

var app = koa();

var ESProxy = require('./lib/ESProxy').default;

var proxy = new ESProxy('http://localhost:9200', 'point');

function setError(ctx, err, status){
    ctx.response.status = status || 400;
    ctx.response.body = {
        err: err || 'Bad Request'
    }
}

// ?key=yourkey
router.get('/search_by_key', function *(next){
    var qs = this.request.query;
    if(qs == undefined || qs.key == undefined){
        setError(this, 'Paramter "key" not found');
    } else {
        this.body = yield Q.nfcall(proxy.SearchPoiByKey.bind(proxy), qs.key);
    }
});

// ?lat=10&lon=10&distance=10km
router.get('/search_by_point', function *(next){
    var qs = this.request.query;
    if(qs == undefined || qs.lat == undefined){
        setError(this, 'Paramter "lat" not found');
    } else if(qs.lon == undefined) {
        setError(this, 'Paramter "lon" not found');
    } else {
        this.body = yield Q.nfcall(proxy.SearchPoiByPoint.bind(proxy), 
            qs.lat, qs.lon, qs.distance);
    }
});

// ?points=[[115.005, 38.005],[115.005, 39.005],[116.005, 39.005],[116.005, 38.005]]
router.get('/search_by_pg', function *(){
    var qs = this.request.query;
    if(qs == undefined || qs.points == undefined){
        setError(this, 'Paramter "points" not found');
    } else {
        var points = JSON.parse(qs.points);
        this.body = yield Q.nfcall(proxy.SearchPoiByPolygon.bind(proxy), points);
    }
});

// ?id=1
router.get('/search_by_id', function *(){
    var qs = this.request.query;
    if(qs == undefined || qs.id == undefined){
        setError(this, 'Paramter "id" not found');
    } else {
        this.body = yield Q.nfcall(proxy.SearchPoiById.bind(proxy), qs.id);
    }
});

// ?text=yourinput
router.get('/autocomplete', function *(){
    var qs = this.request.query;
    if(qs == undefined || qs.text == undefined){
        setError(this, 'Paramter "text" not found');
    } else {
        this.body = yield Q.nfcall(proxy.InputTips.bind(proxy), qs.text);
    }
});

app
    .use(router.routes())
    .use(router.allowedMethods());

app.listen(3000);