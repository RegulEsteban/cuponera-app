var mongoose = require('mongoose');
var db = mongoose.createConnection('localhost', 'cuponeradb');
var schemaCupones = require('../models/SchemasCupones.js');

var UsuarioSchema = schemaCupones.UsuarioSchema;
var CuponSchema = schemaCupones.CuponSchema;

var Usuario = db.model('usuario',UsuarioSchema);
var Cupon = db.model('cupon', CuponSchema);

var fs = require("fs");
var ObjectID = mongoose.mongo.BSONPure.ObjectID;
var Binary = mongoose.mongo.Binary;

exports.index = function(req, res){
  res.render('index', { title: 'Cupones de Descuento' });
};

exports.creaUsuarios = function(req, res) {
    var bodyUsuario = req.body,
    tipo_usuario = {identificador: "VIZOR", descripcion: "Usuario Normal", status: 1},
    usuarioObj = {nombre: bodyUsuario.nombre, ap_paterno: bodyUsuario.ap_paterno, 
            ap_materno: bodyUsuario.ap_materno, edad: bodyUsuario.edad,
            email: bodyUsuario.email, username: bodyUsuario.username,
            contrasena: bodyUsuario.contrasena, status: bodyUsuario.status, tipo_usuario: [tipo_usuario]};
    
    var usuario=new Usuario(usuarioObj);
    usuario.save(function(err, doc){
        if(err || !doc){
            throw 'Error al guardar usuario';
        }else{
            res.json(doc);
        }
    });
};

exports.usuariosList = function(req, res){
    Usuario.find({}, 'nombre', function(error, usuarios) {
        if(error){
            throw 'Error al buscar los cupones';
        }else{
            res.json(usuarios);
        }
    });
};

exports.findUsuarioId = function(req, res){
    var usuarioId = req.params.id;
    Usuario.findById(usuarioId, '', {lean: true}, function(err, usuario){
        if(usuario){
//            var votoUsuario, eligioUsuario, totalVotos=0;
//            for(var c in cupon.elecciones){
//                var eleccion = cupon.elecciones[c];
//                for(var v in eleccion.votos){
//                    var voto = eleccion.votos[v];
//                    totalVotos++;
//                    if(voto.ip === (req.header('x-forwarded-for') || req.ip)){
//                        votoUsuario=true;
//                        eligioUsuario = {_id: eleccion._id, comentario: eleccion.comentario};
//                    }
//                }
//            }
//            cupon.votoUsuario = votoUsuario;
//            cupon.eligioUsuario = eligioUsuario;
//            cupon.totalVotos = totalVotos;
            res.json(usuario);
        }else{
            res.json({error: true});
        }
    });
};

exports.upload = function(req, res, next){
	var image = req.files.file;
	var input = req.body;
	var id_user;
	console.log(req);
	Usuario.findOne({ 'nombre' : 'Esteban' }).exec().then(function (usuario) {
	    id_user = usuario._id;
     });
	
	var cupon_get = {nombre: image.name, extension: image.type, imagen_binary: new Binary(image.path), 
	                imagen: fs.readFileSync(image.path), fecha_validez: input.fecha, id_usuario: new ObjectID(id_user)};
    
    var cupon = new Cupon(cupon_get);
    cupon.save(function(err,file){
    	if(err || !file){
    		throw 'Error al guardar imagen';
    	}else{
    		Cupon.findById(cupon, function(err,doc){
    			res.json(doc);
    		});
    	}
    });
};

exports.uploadCupon = function(req, res){    
    res.send(200, req.status);
};

exports.list = function(req, res) {
  Cupon.find({}, 'nombre', function(error, cupones) {
      if(error){
          throw 'Error al buscar los cupones';
      }else{
          res.json(cupones);
      }
  });
};

/*exports.imagenes = function(req, res) {
	Cupon.findOne({ 'imageName' : 'cp_110914.png' }, function(error, result){
		if(!error || result){
			var b = new Buffer(result.image).toString('base64');
			//res.contentType(result.imageType);
			var respuesta=[{binaryImage: 'data:'+result.imageType+';base64,'+b, imageName: result.imageName }];
			console.log(respuesta);
			res.json(respuesta);
		}
	});
};*/

exports.imagenes = function(req, res) {
	Cupon.find({}, '', function(error, result){
		if(!error || result){
			var i = 0, stop = result.length, respuesta = new Array(result.length);
            for (i; i < stop; i=i+1)
            {
            	var b = new Buffer(result[i].imagen).toString('base64');
//            	respuesta[i].nombre = result[i].nombre;
//            	respuesta[i]._id = result[i]._id;
//            	respuesta[i].imagen = 'data:'+result[i].extension+';base64,'+b;
            	respuesta[i]={binaryImage: "data:"+result[i].extension+";base64,"+b, nombre: result[i].nombre, _id: result[i]._id };
            }
            res.json(respuesta);
		}
	});
};

exports.cupon = function(req, res){
	var cuponId = req.params.id;
	Cupon.findById(cuponId, '', {lean: true}, function(err, cupon){
		if(cupon){
			var votoUsuario, eligioUsuario, totalVotos=0;
			for(var c in cupon.elecciones){
				var eleccion = cupon.elecciones[c];
				for(var v in eleccion.votos){
					var voto = eleccion.votos[v];
					totalVotos++;
					if(voto.ip === (req.header('x-forwarded-for') || req.ip)){
						votoUsuario=true;
						eligioUsuario = {_id: eleccion._id, comentario: eleccion.comentario};
					}
				}
			}
			cupon.votoUsuario = votoUsuario;
			cupon.eligioUsuario = eligioUsuario;
			cupon.totalVotos = totalVotos;
			res.json(cupon);
		}else{
			res.json({error: true});
		}
	});
};

exports.create = function(req, res){
	var reqBody = req.body,
	elecciones = reqBody.elecciones.filter(function(v) { return v.text != ''; }),
	cuponObj = {anuncioText: reqBody.anuncioText, elecciones: elecciones};
	
	var cupon=new Cupon(cuponObj);
	cupon.save(function(err, doc){
		if(err || !doc){
			throw 'Error al guardar anuncio';
		}else{
			res.json(doc);
		}
	});
};

exports.votar = function(socket){
	socket.on('send:votar', function(data){
		var ip = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address.address;
		Cupon.findById(data.cupon_id, function(err, cupon){
			var eleccion = cupon.elecciones.id(data.eleccion);
			eleccion.votos.push({ip: ip});
			cupon.save(function(err, doc){
				var theDoc = {anuncioText: doc.anuncioText,
							_id: doc._id,
							elecciones: doc.elecciones,
							votoUsuario: false, totalVotos: 0};
				for(var i=0, ln = doc.elecciones.length; i < ln; i++){
					var eleccion = doc.elecciones[i];
					for(var j = 0, jLn = eleccion.votos.length; j < jLn; j++){
						var voto = eleccion.votos[j];
						theDoc.totalVotos++;
						theDoc.ip = ip;
						if(voto.ip === ip){
							theDoc.votoUsuario = true;
							theDoc.eligioUsuario ={_id: eleccion._id, comentario: eleccion.comentario};
						}
					}
				}
				socket.emit('mivoto', theDoc);
				socket.broadcast.emit('votar', theDoc);
			});
		});
	});
};