function UsuariosController($scope, $sce, $location, Usuario){
    $scope.confirm_contrasena = '';
    $scope.usuario = {nombre: '', ap_paterno: '', ap_materno: '', edad: '', email: '', username: '',
        contrasena: '', status: 1};
    $scope.error = $sce.trustAsHtml('');
    $scope.crearUsuario = function(){
        var usuario = $scope.usuario;
        if($scope.confirm_contrasena != usuario.contrasena){
            $scope.error = $sce.trustAsHtml("<div class='alert alert-danger' role='alert' >Las <strong>contraseñas</strong> no coinciden.</div>");
        }else{
            var nuevoUsuario=new Usuario(usuario);
            nuevoUsuario.$save(function (error, resp){
                if(!error.error){
                    $location.path('usuarios');
                }else{
                    alert('No se pudo crear el usuario, lo sentimos. :');
                }
            });
        }
    };
}

function UsuariosListController($scope, Usuario){
    $scope.usuarios = Usuario.query();
}

function CuponListController($scope, Cupon){
	$scope.cupones = Cupon.query();
}

function CuponImagenController($scope, ImagenCupon){
	$scope.cupones = ImagenCupon.query();
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

function CuponUploadController($scope, $http, $location){
	$scope.nuevoCupon = function(){
		$scope.$on('flow::fileAdded', function (event, $flow, flowFile) {
		  event.preventDefault();
		});
		
		var file = $scope.imagen;
		console.log(file);
        var fd = new FormData();
        fd.append('file', file);
//		var obj = {autor: $scope.autor, content: $scope.content, file: file};
//		$http.post('/upload', fd, {
//            transformRequest: angular.identity,
//            headers: {'Content-Type': undefined}
//        })
//        .success(function(data) {
//            alert('excelente: '+data._id);
//            $location.path('cuponera');
//        })
//        .error(function(data) {
//            console.log('Error: ');
//        });
	};
}

function CuponesController($scope){
    $scope.$on('flow::fileAdded', function (event, $flow, flowFile) {
      //event.preventDefault();
    });
}