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
var obj = null;


var ang = 0.0;


function init(obj3d){
    obj = obj3d;
    //RECUPERA OS SHADES E CRIA UM PROGRAMA PARA ESTES SHADERS
    var vx_str = document.getElementById("vxShader").text;

    var fg_str = document.getElementById("fgShader").text;

    prg = initProgram(gl, getVxShader(gl, vx_str), getFgShader(gl, fg_str));
    
    //INICIO:CRIA BUFFERS E ENVIA DADOS PARA ELES
    initObjectData(obj3d);
    //FIM:CRIA BUFFERS E ENVIA DADOS PARA ELES
}

function initObjectData(obj3d) {
    prg.vertexColor = gl.getAttribLocation(prg, "aVertexColor")
    prg.vertexPosition = gl.getAttribLocation(prg, "aVertexPosition");
    prg.modelTransform = gl.getUniformLocation(prg, "uModel");
    prg.viewTransform = gl.getUniformLocation(prg, "uView");
    prg.projectionTransform = gl.getUniformLocation(prg, "uProjection");
 
    modelTransform = mat4.create();
    viewTransform = mat4.create();
    projectionTransform = mat4.create();

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
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(obj3d.indices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    vxColor = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vxColor);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj3d.colors), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

function draw(){


    mat4.identity(modelTransform);
    mat4.identity(viewTransform);
    mat4.identity(projectionTransform);

    //INICIO::DEFINE TRANSFORMACOES NO MODELO
    mat4.scale(modelTransform, modelTransform, [0.1, 0.1, 0.1]);
    mat4.rotate(modelTransform, modelTransform, ang, [0.0, 0.0, 1.0]);
    gl.uniformMatrix4fv(prg.modelTransform, false, modelTransform);
    //FIM::DEFINE TRANSFORMACOES NO MODEL

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
    gl.drawElements(primitiveType, obj.indices.length, gl.UNSIGNED_SHORT,0);
}

function update() {
    ang = ang+1.0;
    if (ang > Math.PI){
        ang = 0.0;
    }
    draw();
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

function successHandler(url, model){
    init(model);
    draw();
}

function errorHandler(error){
    alert("Error status: " + error.status + " : " + error.message);
}

function loadModel() {
    loadFile("models/cubo.json", successHandler, errorHandler);   
}
