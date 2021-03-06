var mongoose = require('mongoose');

/*var votoSchema = new mongoose.Schema({ ip: 'String' });

var eleccionSchema = new mongoose.Schema({
  comentario: String,
  votos: [votoSchema]
});

exports.CuponSchema = new mongoose.Schema({
  anuncioText: { type: String, required: true },
  elecciones: [eleccionSchema]
});

exports.ImageCupon = new mongoose.Schema({
    imagen: Buffer,
    imageType: String,
    imageName: String,
    binaryImage: String
});*/


var tipo_usuarioSchema = new mongoose.Schema({
    identificador: String,
    descripcion: String,
    status: Number
});

var ubicacionSchema = new mongoose.Schema({
    lat: Number,
    lon: Number,
    direccion: String,
    status: Boolean
});

var comentario_cupon_usuario = new mongoose.Schema({
    descripcion: String,
    fecha: Date,
    id_usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'usuario' }
});

var favorito_cupon_usuario = new mongoose.Schema({
    id_usuario: { type : mongoose.Schema.Types.ObjectId, ref : 'usuario' }
});

var puntuacion_cupon_usuario = new mongoose.Schema({
    puntuacion: Number,
    id_usuario: { type : mongoose.Schema.Types.ObjectId, ref : 'usuario' }
});

exports.UsuarioSchema = new mongoose.Schema({
    nombre: String,
    ap_paterno: String,
    ap_materno: String,
    edad: Number,
    email: String,
    username: String,
    contrasena: String,
    status: Number,
    rfc: String,
    empresa: String,
    tipo_usuario: [tipo_usuarioSchema],
    ubicaciones: [ubicacionSchema],
    extension_avatar: String,
    avatar: Buffer,
    avatar_binary: String
});

exports.CuponSchema = new mongoose.Schema({
    nombre: String,
    extension: String,
    imagen: Buffer,
    imagen_binary: String,
    fecha_validez: Date,
    id_usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'usuario' },
    comentarios: [comentario_cupon_usuario],
    favoritos: [favorito_cupon_usuario],
    puntuacion: [puntuacion_cupon_usuario]
});
