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

function CuponUploadController($scope, $http, $location, fileReader){
    $scope.active = '';
    $scope.showButton = true;
    $scope.imagen = '';
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
		console.log(file);
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

function CuponesController($scope){
    
}