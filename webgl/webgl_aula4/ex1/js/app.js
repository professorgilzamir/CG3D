var gl = null;
var indices = [];
var vertices = [];
var colors = [];
var prg = null;
var ibo = null;
var vbo = null;
var vxColor = null;
var width = 0;
var height = 0;
var primitiveType = null;
var modelViewTransform = null;
var cameraTransform = null;
var projectionTransform = null;
var rotate = [0,0,0];
var translate = [0,0,0];
var materialList;
var obj = null;
var obj3d = null;
var home = [0, 3, 10];


/*
    Compila os shaders, cria o programa e cria os buffers
    para futuro armazenamento de dados do objeto e de matrizes
    de transformacao.
*/
function init(obj3d){
    obj = obj3d;
    //INICIO::RECUPERA OS SHADES E CRIA UM PROGRAMA PARA ESTES SHADERS
    var vx_str = document.getElementById("vxShader").text;
    var fg_str = document.getElementById("fgShader").text;
    prg = initProgram(gl, getVxShader(gl, vx_str), getFgShader(gl, fg_str));
    //INICIO::
    

    //INICIO:CRIA BUFFERS E ENVIA DADOS PARA ELES
    initObjectData(obj3d);
    //gl.depthFunc(gl.LESS);
    //FIM::


    //INICIO::habilita algoritmo z-buffer
    gl.enable(gl.DEPTH_TEST);
    //FIM::
}

/*
    Cria buffers para armazenar os dados referentes ao objeto 
    obj3d.
*/
function initObjectData(obj3d) {
    //INICIO::obtem referencia para os atributos e uniformes dos shaders
    prg.vertexColor = gl.getAttribLocation(prg, "aVertexColor")
    prg.vertexPosition = gl.getAttribLocation(prg, "aVertexPosition");
    prg.modelViewTransform = gl.getUniformLocation(prg, "uModelView");
    prg.projectionTransform = gl.getUniformLocation(prg, "uProjection");
    //FIM::obtem referencia para os atributos e uniformes dos shaders
    
    //INICIO:: cria as matrizes e as inicializa como identidade
    modelViewTransform = mat4.create();
    projectionTransform = mat4.create();
    cameraTransform = mat4.create();
    rotation = mat4.create();
    translation = mat4.create();
    mat4.identity(rotation);
    mat4.identity(translation);
    mat4.identity(cameraTransform);
    //FIM::
    
    //INICIO::DEFINE O TIPO DE PRIMITIVA DE DESENHO A SER UTILIZADA
    if (primitiveType == null) {
        primitiveType = gl.TRIANGLES;
    }
    //FIM::
    

    //INICIO::CRIA O VBO - VERTEX BUFFER OBJECT - PARA GUARDAR OS VERTICES DO OBJETO E COPIA OS VERTICES
    //PARA O BUFFER CRIADO
    vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj3d.vertices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);            
    //FIM::

    //INICIO:: CRIA IBO - INDEX BUFFER OBJECT - MAS NAO O INICIALIZA
    //POIS CADA PARTE/COMPONENTE DE OBJETO SERÁ DESENHADO A PARTE
    //E, PORTANTO, TERA O SEU PROPRIO IBO
    ibo = gl.createBuffer();
    //FIM::

    //INICIO:: cria um buffer para armazenar dados de cor
    vxColor = gl.createBuffer();
    //FIM::
}

function draw(component){
    //INICIO::COPIA OS DADOS DE INDICES DO COMPONENTE ATUAL PARA O IBO
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(component.indices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    //FIM::


    //INICIO::COPIA OS DADOS DE CORES DO COMPONENTE ATUAL PARA O BUFFER DE COR
    //QUE EH APONTADO PELA VARIAVEL vxColor
    gl.bindBuffer(gl.ARRAY_BUFFER, vxColor);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(component.diffuse_color), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    //FIM::

    //INICIO::DEFINE TRANSFORMACOES MODELVIEW
    gl.uniformMatrix4fv(prg.modelViewTransform, false, modelViewTransform);
    //FIM::


    //INICIO::DEFINE TRANSFORMACOES DE PROJECAO
    mat4.identity(projectionTransform);
    mat4.perspective(projectionTransform, Math.PI/4, 1.0, 0.001, 10000);
    //mat4.ortho(projectionTransform, -1.0, 1.0, -1.0, 1.0, 0.01, 1000.0);
    gl.uniformMatrix4fv(prg.projectionTransform, false, projectionTransform);
    //FIM::

    //INICIO:ATIVA OS BUFFERS PARA ENVIAR OS DADOS PARA SEREM DESENHADOS
    gl.bindBuffer(gl.ARRAY_BUFFER, vxColor);
    gl.vertexAttribPointer(prg.vertexColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(prg.vertexColor);

    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.vertexAttribPointer(prg.vertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(prg.vertexPosition);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    //FIM::

    //INICIO::EXECUTA A PRIMITIVA DE DESENHO PARA GRUPOS DE DADOS  
    gl.drawElements(primitiveType, component.indices.length, gl.UNSIGNED_SHORT,0);
    //FIM::
}

function applyRotation(axisIdx, angle) {
	rotate[axisIdx] = fromSliderToRange(angle, 720, 360) * Math.PI/180.0;
    redraw(false);
}

/*
    Altera o tipo de primitva utiliza em drawElements
*/
function selectPrimitiveType(option) {
	switch(option.value){
		case "TRIANGLES":
			primitiveType = gl.TRIANGLES;
			break;
		case "LINES":
			primitiveType = gl.LINES;
			break;
		case "POINTS":
			primitiveType = gl.POINTS;
			break;
	}
}

/*
    Esta funcao executa tres operacoes:
     #1 : Limpa os buffers de cor e de profundidade.
     #2 : Desenha os componentes de um objeto indicado
     pela variavel global 'obj'
     #3 : mostra o codigo da matriz atual na pagina
     'index.html'
*/
function drawComponents(){
    //INICIO::LIMPA BUFFERS
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    //FIM::
    for (component in obj["obj"]){
        draw(obj["obj"][component]);
    }
    //FIM::
}

/*
    Funcao callback (de retorno) chamada quando o corregamento
    de um objeto pela funcao loadModel eh bem sucedido.
*/
function successModelHandler(url, model){
    init(model); //configuracoes iniciais da aplicacao
    reset(true); //define configuracoes iniciais da aplicacao
	redraw(true); //desenha/redesenha toda a aplicacao
}

function errorModelHandler(error){
    alert("Error status: " + error.status + " : " + error.message);
}

function loadModel() {
    loadFile("models/floor.json", successModelHandler, errorModelHandler);
}

function fromSliderToRange(pos, iamp=100, ishift=50){
	return iamp * (pos/100.0) - ishift;
}

function fromRangeToSlider(pos, iamp=100, ishift=50){
	return (pos + ishift) * 100.0/iamp;
}

function changeCameraPosition(idx, pos){
	translate[idx] = fromSliderToRange(pos);
	redraw(false);
}

function updateMatrices(worldMode=true){

	mat4.identity(modelViewTransform);
	mat4.identity(cameraTransform);
    if (worldMode){
        mat4.translate(modelViewTransform, modelViewTransform, translate);
		mat4.rotateX(modelViewTransform, modelViewTransform, rotate[0], [1, 0, 0]);
		mat4.rotateY(modelViewTransform, modelViewTransform, rotate[1], [0, 1, 0]);
		mat4.rotateZ(modelViewTransform, modelViewTransform, rotate[2], [0, 0, 1]);
		mat4.invert(cameraTransform, modelViewTransform);
		mat4.multiply(modelViewTransform, modelViewTransform, obj.localMatrix);
	} else {
		mat4.translate(cameraTransform, cameraTransform, translate);
		mat4.rotateX(cameraTransform, cameraTransform, rotate[0], [1, 0, 0]);
		mat4.rotateY(cameraTransform, cameraTransform, rotate[1], [0, 1, 0]);
		mat4.rotateZ(cameraTransform, cameraTransform, rotate[2], [0, 0, 1]);
		mat4.invert(modelViewTransform, cameraTransform);
		mat4.multiply(modelViewTransform, modelViewTransform, obj.localMatrix);
    }
}

function updateDisplay(){
    var el = document.getElementById("matrixCode");
    var elW = document.getElementById("rdW");
    el.value = "";
    var str = "";

	var mv = modelViewTransform;        
   
	//if (!elW.checked){
		//mv = cameraTransform;	
	//}
	
	str += mv[0].toFixed(2) + "  " + mv[4].toFixed(2) + "  " + mv[8].toFixed(2)  + "  " +  mv[12].toFixed(2) + "\n";
    str += mv[1].toFixed(2) + "  " + mv[5].toFixed(2) + "  " + mv[9].toFixed(2)  + "  " +  mv[13].toFixed(2) + "\n";
    str += mv[2].toFixed(2) + "  " + mv[6].toFixed(2) + "  " + mv[10].toFixed(2)  + "  " + mv[14].toFixed(2) + "\n";
    str += mv[3].toFixed(2) + "  " + mv[7].toFixed(2) + "  " + mv[11].toFixed(2)  + "  " + mv[15].toFixed(2)+ "\n";
    
    el.value = str;

	var spEyeDistZ = document.getElementById("spEyeDistanceZ");
    var elEyeDistZ = document.getElementById("rgEyeDistanceZ");
	spEyeDistZ.innerText = fromSliderToRange(elEyeDistZ.value).toFixed(1);


	var spRotX = document.getElementById("spRotateX");
    var elRotX = document.getElementById("rgRotateX");
	spRotX.innerText = fromSliderToRange(elRotX.value, 720, 360).toFixed(1);

	var spRotY = document.getElementById("spRotateY");
    var elRotY = document.getElementById("rgRotateY");
	spRotY.innerText = fromSliderToRange(elRotY.value, 720, 360).toFixed(1);

	var spRotZ = document.getElementById("spRotateZ");
    var elRotZ = document.getElementById("rgRotateZ");
	spRotZ.innerText = fromSliderToRange(elRotZ.value, 720, 360).toFixed(1);
}


function updateGUIControls() {
    var elW = document.getElementById("rdW");
    var elEyeDistZ = document.getElementById("rgEyeDistanceZ");
	if (elW.checked){
    	elEyeDistZ.value = fromRangeToSlider(modelViewTransform[14]);
		var elRotX = document.getElementById("rgRotateX");
		elRotX.value = fromRangeToSlider(rotate[0], 720, 360);
		var elRotY = document.getElementById("rgRotateY");
		elRotY.value = fromRangeToSlider(rotate[1], 720, 360);
		var elRotZ = document.getElementById("rgRotateZ");
		elRotZ.value = fromRangeToSlider(rotate[2], 720, 360);
	} else {
		elEyeDistZ.value = fromRangeToSlider(cameraTransform[14]);	
		var elRotX = document.getElementById("rgRotateX");
		elRotX.value = fromRangeToSlider(-rotate[0], 720, 360);
		var elRotY = document.getElementById("rgRotateY");
		elRotY.value = fromRangeToSlider(-rotate[1], 720, 360);
		var elRotZ = document.getElementById("rgRotateZ");
		elRotZ.value = fromRangeToSlider(-rotate[2], 720, 360);
	}	
}

function reset(worldMode){
	translate=vec3.negate([0,0,0], home);
	rotate=[0.0, 0.0, 0.0];
}

function redraw(isToUpdateGUICtrl){
    var elW = document.getElementById("rdW");
	updateMatrices(elW.checked);
	if (isToUpdateGUICtrl) updateGUIControls();
	updateDisplay();
	drawComponents();
}


