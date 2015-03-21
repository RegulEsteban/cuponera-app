
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var app = express();

//var server = http.createServer(app);
//var io = require('socket.io').listen(server);

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
//app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' === app.get('env')) {
  app.use(express.errorHandler());
}
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', routes.index);
app.get('/cuponera/cuponera', routes.list);
//app.get('/cuponera/:id', routes.cupon);
app.get('/imagenes', routes.imagenes);
app.get('/imagenesMovil', routes.imagenesMovil);
//app.post('/cuponera', routes.create);
app.post('/upload', routes.upload);
app.get('/usuarios/usuarios', routes.usuariosList);
app.get('/usuarios/:id', routes.findUsuarioId);
app.post('/usuarios', routes.creaUsuarios);
app.post('/comentar', routes.doComentoByCupon);
app.post('/nuevoProveedor', routes.createCuponero);
app.post('/addUbicaciones', routes.addUbicaciones);
app.get('/getCuponById/:id', routes.getCuponById);

app.get('/users', user.list);

//io.sockets.on('connection', routes.votar);

app.listen(app.get('port'), function () {
    //var host = app.address().address;
    var port = app.get('port');
    console.log('Example app listening at localhost:', port);
});
//server.listen(app.get('port'), function(){
//  console.log('Express server escuchando en el puerto ' + app.get('port'));
//});