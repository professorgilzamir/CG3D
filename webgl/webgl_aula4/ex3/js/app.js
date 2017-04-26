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
var modelTransform = null;
var viewTransform = null;
var projectionTransform = null;
var rotateView = null;
var materialList;
var obj = null;
var obj3d = null;

var angx = 0.0, angy = 0.0, angz = 0.0;


function init(obj3d){
    obj = obj3d;
    //RECUPERA OS SHADES E CRIA UM PROGRAMA PARA ESTES SHADERS
    var vx_str = document.getElementById("vxShader").innerText;

    var fg_str = document.getElementById("fgShader").innerText;

    prg = initProgram(gl, getVxShader(gl, vx_str), getFgShader(gl, fg_str));
    
    //INICIO:CRIA BUFFERS E ENVIA DADOS PARA ELES
    initObjectData(obj3d);

    gl.enable(gl.DEPTH_TEST);
    //gl.depthFunc(gl.LESS);
    //FIM:CRIA BUFFERS E ENVIA DADOS PARA ELES
}

function initObjectData(obj3d) {
    prg.vertexColor = gl.getAttribLocation(prg, "aVertexColor")
    prg.vertexPosition = gl.getAttribLocation(prg, "aVertexPosition");
    prg.modelTransform = gl.getUniformLocation(prg, "uModel");
    prg.viewTransform = gl.getUniformLocation(prg, "uView");
    prg.projectionTransform = gl.getUniformLocation(prg, "uProjection");
    prg.rotateView = gl.getUniformLocation(prg, "uRotateView");
 
    modelTransform = mat4.create();
    viewTransform = mat4.create();
    projectionTransform = mat4.create();
    rotateView = mat4.create();

    if (primitiveType == null) {
        primitiveType = gl.TRIANGLES;
    }
    //VBO
    vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj3d.vertices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);            

    //IBO
    ibo = gl.createBuffer();

    //buffer de cor
    vxColor = gl.createBuffer();
}

function draw(component){
    //define os indices do componente
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(component.indices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);


    //define a cor do componente
    gl.bindBuffer(gl.ARRAY_BUFFER, vxColor);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(component.diffuse_color), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);


    mat4.identity(modelTransform);
    mat4.identity(viewTransform);
    mat4.identity(projectionTransform);
    mat4.identity(rotateView);

    //INICIO::DEFINE TRANSFORMACOES NO MODELO
    mat4.scale(modelTransform, modelTransform, [0.3, 0.3, 0.3]);
    gl.uniformMatrix4fv(prg.modelTransform, false, modelTransform);
    //FIM::DEFINE TRANSFORMACOES NO MODEL

    //INICIO::DEFINE ROTACAO EM RELACAO A VIEW
    mat4.rotate(rotateView, rotateView, angz, [0.0, 0.0, 1.0]);
    mat4.rotate(rotateView, rotateView, angy, [0.0, 1.0, 0.0]);
    mat4.rotate(rotateView, rotateView, angx, [1.0, 0.0, 0.0]);
    gl.uniformMatrix4fv(prg.rotateView, false, rotateView);
    //FIM::DEFINE ROTACAO EM RELACAO A VIEW

    //INICIO::DEFINE TRANSFORMACOES DE CAMERA
    mat4.lookAt(viewTransform, [0, 0, 5], [0, 0, -1], [0, 1, 0])
    gl.uniformMatrix4fv(prg.viewTransform, false, viewTransform);
    //FIM::DEFINE TRANSFORMACOES DE CAMERA

    //INICIO::DEFINE TRANSFORMACOES DE PROJECAO
    mat4.perspective(projectionTransform, Math.PI/4, 1.0, 0.001, 10000);
    //mat4.ortho(projectionTransform, -1.0, 1.0, -1.0, 1.0, 0.01, 1000.0);
    gl.uniformMatrix4fv(prg.projectionTransform, false, projectionTransform);
    //FIM::DEFINE TRANSFORMACOES DE PROJECAO

    //INICIO:ATIVA OS BUFFERS PARA ENVIAR OS DADOS PARA SEREM DESENHADOS
    gl.bindBuffer(gl.ARRAY_BUFFER, vxColor);
    gl.vertexAttribPointer(prg.vertexColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(prg.vertexColor);

    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.vertexAttribPointer(prg.vertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(prg.vertexPosition);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    //FIM:ATIVA OS BUFFERS PARA ENVIAR OS DADOS PARA SEREM DESENHADOS

    //EXECUTA A PRIMITIVA DE DESENHO PARA GRUPOS DE DADOS  
    gl.drawElements(primitiveType, component.indices.length, gl.UNSIGNED_SHORT,0);
}

function updateZ() {
    angz = angz+0.1;
    drawComponents();
}

function updateX() {
    angx = angx+0.1;
    drawComponents();
}

function updateY() {
    angy = angy+0.1;
    drawComponents();
}

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


function drawComponents(){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    for (component in obj["obj"]){
        draw(obj["obj"][component]);
    }
}

function successModelHandler(url, model){
    obj3d = model;
    init(obj3d)
    drawComponents();
}

function errorModelHandler(error){
    alert("Error status: " + error.status + " : " + error.message);
}

function loadModel() {
    loadFile("models/cubo.json", successModelHandler, errorModelHandler);
}

