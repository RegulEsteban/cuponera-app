function UsuariosController($scope, $sce, $location, Usuario, $http, fileReader, $window, API, $rootScope){
    $scope.confirm_contrasena = '';
    $scope.active = '';
    $scope.showButton = true;
    $scope.imagen = '';
    $scope.usuario = {nombre: '', ap_paterno: '', ap_materno: '', edad: '', email: '', username: '', contrasena: '', status: 1};
    $scope.progress = 0;
    $scope.error = $sce.trustAsHtml('');
    
    $scope.getFile = function () {
        $scope.progress = 0;
        fileReader.readAsDataUrl($scope.file, $scope).then(function(result) {
            $scope.imageSrc = result;
            $scope.showButton = false;
            $scope.active = '';
        });
    };
    $scope.$on("fileProgress", function(e, progress) {
        $scope.progress = progress.loaded / progress.total;
        $scope.active = 'active';
    });
    
    $scope.removeImage = function(){
        $scope.imageSrc = '';
        $scope.showButton = true;
        $scope.imagen = '';
        $scope.progress = 0;
    };
    
    $scope.crearUsuario = function(){
    	$scope.error = $sce.trustAsHtml('');
        var usuario = $scope.usuario;
        var file = $scope.imagen;
        var fd = new FormData();
        fd.append('file', file);
        fd.append('usuario', angular.toJson(usuario));
        if(file == '' || file == undefined){
        	$scope.error = $sce.trustAsHtml("<div class='alert alert-danger' role='alert' >Selecciona una imagen de perfil.</div>");
        	return false;
        }else if($scope.confirm_contrasena != usuario.contrasena){
            $scope.error = $sce.trustAsHtml("<div class='alert alert-danger' role='alert' >Las <strong>contraseñas</strong> no coinciden.</div>");
            return false;
        }else{
            $http.post('/usuarios', fd, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            })
            .success(function(data) {
                alert('¡Usuario registrado exitósamente!');
                $rootScope.setToken(data._id); // create a session kind of thing on the client side
                $window.location.href = ('#/cuponera');
            })
            .error(function(data) {
            	$scope.error = $sce.trustAsHtml("<div class='alert alert-danger' role='alert' >"+data+"</div>");
            });
        }
    };
}

function UsuariosListController($scope, Usuario){
    $scope.usuarios = Usuario.query();
}

function CuponListController($scope, Cupon, API, $rootScope){
	$scope.cupones = Cupon.query();
}

function CuponImagenController($scope, $http, ImagenCupon, API, $rootScope){
    "use strict";
    if ($rootScope.isSessionActive()) {
        $scope.usuario = API.getUserById().get({id: $rootScope.getToken()});
        $scope.usuario.$promise.then(function(data) {
            if(data.tipo_usuario[0].identificador==$rootScope.getVisor()){
                $scope.menu_login='visor';
            }else if(data.tipo_usuario[0].identificador==$rootScope.getProv()){
                $scope.menu_login='proveedor';
            }else{
                $scope.menu_login='';
            }
        });
    }else{
        $scope.menu_login='';
    }
    
	$scope.cupones = ImagenCupon.query();
	$scope.comentario = '';
	$scope.start = 0;
	$scope.end = 5;
	$scope.rate = 0;
	
	$scope.doComment = function(id, coment, list){
	    var fd = new FormData();
        fd.append('id_cupon', id);
        fd.append('comentario', coment);
        fd.append('fecha', new Date());
        $http.post('/comentar', fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        })
        .success(function(data) {
            $scope.comentario = '';
            list.push(data);
            $scope.end = $scope.end + 1;
        })
        .error(function(data) {
            console.log('Error: '+data);
        });
	};
	
	$scope.vieMoreComents = function(){
	    $scope.end = $scope.end + 5;
    };
}

function CuponNewController($scope, $location, Cupon){
	$scope.cupon = {anuncioText: '', elecciones: [{comentario: ''}, {comentario: ''}, {comentario: ''}]};
	$scope.agregarComentario = function(){
		$scope.cupon.elecciones.push({comentario: ''});
	};
	$scope.crearCupon = function(){
		var cupon = $scope.cupon;
		if(cupon.anuncioText.length > 0){
			var cuentaComentario=0;
			for(var i=0, ln = cupon.elecciones.length; i< ln; i++){
				var eleccion = cupon.elecciones[i];
				if(eleccion.comentario.length > 0){
					cuentaComentario++;
				}
			}
			if(cuentaComentario > 1){
				var newCupon=new Cupon(cupon);
				newCupon.$save(function (p, resp){
					if(!p.error){
						$location.path('cuponera');
					}else{
						alert('No se pudo crear el Cupón, lo sentimos. :');
					}
				});
			}else{
				alert('Debes ingresar al menos dos comentarios');
			}
		}else{
			alert('Debes ingresar un anuncio.');
		}
	};
}

function CuponItemController($scope, $routeParams, socket, Cupon){
	$scope.cupon = Cupon.get({cuponId: $routeParams.cuponId});
	socket.on('mivoto', function(data){
		console.dir(data);
		if(data._id === $routeParams.cuponId){
			$scope.cupon = data;
		}
	});
	socket.on('votar', function(data){
		console.dir(data);
		if(data._id === $routeParams.cuponId){
			$scope.cupon.elecciones = data.elecciones;
			$scope.cupon.totalVotos = data.totalVotos;
		}
	});
	
	$scope.votar = function(){
		var cuponId = $scope.cupon._id, eleccionId = $scope.cupon.votarUsuario;
		
		if(eleccionId){
			var votoObj = {cupon_id: cuponId, eleccion: eleccionId};
			socket.emit('send:votar', votoObj);
		}else{
			alert('Debes seleccionar un comentario.');
		}
	};
}

function CuponUploadController($scope, $http, $location, fileReader, API, $rootScope, $window){
    if ($rootScope.isSessionActive()) {
        $scope.menu_login='proveedor';
    }else{
        $window.location.href = ('#/login');
    }
    
    $scope.active = '';
    $scope.showButton = true;
    $scope.imagen = '';
    $scope.progress = 0;
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1;
    var yyyy = today.getFullYear();
    if(dd<10) {
        dd='0'+dd;
    } 
    if(mm<10) {
        mm='0'+mm;
    } 
    today = yyyy+'-'+mm+'-'+dd;
    $scope.fecha_validez = today;
    
    $scope.getFile = function () {
        $scope.progress = 0;
        fileReader.readAsDataUrl($scope.file, $scope).then(function(result) {
            $scope.imageSrc = result;
            $scope.showButton = false;
            $scope.active = '';
        });
    };
    $scope.$on("fileProgress", function(e, progress) {
        $scope.progress = progress.loaded / progress.total;
        $scope.active = 'active';
    });
    
    $scope.removeImage = function(){
        $scope.imageSrc = '';
        $scope.showButton = true;
    };
	
    $scope.nuevoCupon = function(){
		var file = $scope.imagen;
        var fd = new FormData();
        fd.append('file', file);
        fd.append('fecha', $scope.fecha_validez);
		$http.post('/upload', fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        })
        .success(function(data) {
            alert('¡Cupón registrado exitósamente!');
            $location.path('cuponera');
        })
        .error(function(data) {
            console.log('Error: '+data);
        });
	};
}

function ProveedorController($scope, $sce, $location, Usuario, $http, fileReader){
    $scope.confirm_contrasena = '';
    $scope.active = '';
    $scope.showButton = true;
    $scope.imagen = '';
    $scope.usuario = {nombre: '', ap_paterno: '', ap_materno: '', edad: '', email: '', username: '',
            contrasena: '', status: 1, rfc: '', empresa: ''};
    $scope.progress = 0;
    $scope.error = $sce.trustAsHtml('');
    
    $scope.getFile = function () {
        $scope.progress = 0;
        fileReader.readAsDataUrl($scope.file, $scope).then(function(result) {
            $scope.imageSrc = result;
            $scope.showButton = false;
            $scope.active = '';
        });
    };
    $scope.$on("fileProgress", function(e, progress) {
        $scope.progress = progress.loaded / progress.total;
        $scope.active = 'active';
    });
    
    $scope.removeImage = function(){
        $scope.imageSrc = '';
        $scope.showButton = true;
    };
    
    $scope.crearUsuario = function(){
        var usuario = $scope.usuario;
        var file = $scope.imagen;
        var fd = new FormData();
        fd.append('file', file);
        fd.append('usuario', angular.toJson(usuario));

        if($scope.confirm_contrasena != usuario.contrasena){
            $scope.error = $sce.trustAsHtml("<div class='alert alert-danger' role='alert' >Las <strong>contraseñas</strong> no coinciden.</div>");
        }else{
            $http.post('/nuevoProveedor', fd, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            })
            .success(function(data) {
                alert('¡Cuponero registrado exitósamente!');
                console.log(data);
                $location.path('/addUbicaciones').search({id_user: 'asdfghjkl'});
            })
            .error(function(data) {
                console.log('Error: '+data);
            });
        }
    };
}

function CuponesController($scope, API, $rootScope, $window){
    if ($rootScope.isSessionActive()) {
        $scope.menu_login='proveedor';
    }else{
        $window.location.href = ('#/login');
    }
}

function SignInControlller($scope, $sce, API, $rootScope, $window){
    if ($rootScope.isSessionActive()) {
        $window.location.href = ('#/cuponera');
    }
    
    $scope.user = {
        email: "",
        password: ""
    };

    $scope.validateUser = function () {
        $scope.error = $sce.trustAsHtml('');
        var email = this.user.email;
        var password = this.user.password;
        if(!email) {
            $scope.error = $sce.trustAsHtml("<div class='alert alert-danger' role='alert' >El campo <strong>email</strong> no puede estar vacío.</div>");
            return false;
        }else if(!password){
            $scope.error = $sce.trustAsHtml("<div class='alert alert-danger' role='alert' >El campo <strong>password</strong> no puede estar vacío.</div>");
            return false;
        }
        var fd = new FormData();
        fd.append('email', email);
        fd.append('password', password);
        API.signin(fd).success(function (data) {
            if(!data.error){
                $rootScope.setToken(data._id); // create a session kind of thing on the client side
                $window.location.href = ('#/cuponera');
            }else{
                $scope.error = $sce.trustAsHtml("<div class='alert alert-danger' role='alert' >"+data.error+"</div>");
            }
        }).error(function (error) {
            $scope.error = $sce.trustAsHtml("<div class='alert alert-danger' role='alert' >Usuario y/o password incorrectos.</div>");
        });
    };
}