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
var projectionTransform = null;
var rotation = null;
var translation = null;
var rotate = null;
var translate = null;
var materialList;
var obj = null;
var obj3d = null;

var angx = 0.0, angy = 0.0, angz = 0.0;


/*
    Compila os shaders, cria o programa e cria os buffers
    para futuro armazenamento de dados do objeto e de matrizes
    de transformacao.
*/
function init(obj3d){
    obj = obj3d;
    //INICIO::RECUPERA OS SHADES E CRIA UM PROGRAMA PARA ESTES SHADERS
    var vx_str = document.getElementById("vxShader").innerText;
    var fg_str = document.getElementById("fgShader").innerText;
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
    rotation = mat4.create();
    translation = mat4.create();
    mat4.identity(rotation);
    mat4.identity(translation);
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
    mat4.identity(modelViewTransform);
    calcModelView();
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

/*
    Altera a matriz de rotacao para representar uma rotacao
    em torno do eixo indicado pela variavel 'axis'.
    A variavel 'source' indica de qual objeto de evento partiu a chamada
    desta funcao.
*/
function rotateAxis(axis, source) {
    mat4.rotate(rotation, rotation, 0.1, axis);
    drawComponents();
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

    //INICIO::DESENHA CADA COMPONENTE DO OBJETO
    for (component in obj["obj"]){
        draw(obj["obj"][component]);
    }
    //FIM::

    //INICIO::MOSTRA OS VALORES DA MATRIZ
    displayMatrixCode();
    //FIM::
}

/*
    Funcao callback (de retorno) chamada quando o corregamento
    de um objeto pela funcao loadModel eh bem sucedido.
*/
function successModelHandler(url, model){
    init(model); //configuracoes iniciais da aplicacao
    reset(); //reseta as transformacoes para o seu estado inicial
    //camera no estado inicial esta na posicao: (0, 0, 5)
    drawComponents();
}

function errorModelHandler(error){
    alert("Error status: " + error.status + " : " + error.message);
}

function loadModel() {
    loadFile("models/cubo.json", successModelHandler, errorModelHandler);
}

function changeEyePosition(source){
    var elW = document.getElementById("rdW");
    
    if (elW.checked){
        translation[14] = -source.value * 0.3;
    } else {
        translation[14] = source.value * 0.3;
    }
    
    drawComponents();
}

function calcModelView(){
    var elW = document.getElementById("rdW");
    var sliderTr = document.getElementById("rgEyeDistance");
    
    if (elW.checked){
        mat4.multiply(modelViewTransform, translation, rotation);
    } else {
        mat4.multiply(modelViewTransform, modelViewTransform, mat4.invert(mat4.create(), rotation))
        modelViewTransform[12] = -translation[12];
        modelViewTransform[13] = -translation[13];
        modelViewTransform[14] = -translation[14];
    }
    return modelViewTransform;
}

function displayMatrixCode(){
    var el = document.getElementById("matrixCode");
    var mv = calcModelView();
    var elW = document.getElementById("rdW");

    el.value = "";
    var str = "";
    if (elW.checked){
        str += mv[0].toFixed(2) + "  " + mv[4].toFixed(2) + "  " + mv[8].toFixed(2)  + "  " +  mv[12].toFixed(2) + "\n";
        str += mv[1].toFixed(2) + "  " + mv[5].toFixed(2) + "  " + mv[9].toFixed(2)  + "  " +  mv[13].toFixed(2) + "\n";
        str += mv[2].toFixed(2) + "  " + mv[6].toFixed(2) + "  " + mv[10].toFixed(2)  + "  " + mv[14].toFixed(2) + "\n";
        str += mv[3].toFixed(2) + "  " + mv[7].toFixed(2) + "  " + mv[11].toFixed(2)  + "  " + mv[15].toFixed(2)+ "\n";
    } else {
                str += mv[0].toFixed(2) + "  " + mv[4].toFixed(2) + "  " + mv[8].toFixed(2)  + "  " +  (-mv[12].toFixed(2)) + "\n";
        str += mv[1].toFixed(2) + "  " + mv[5].toFixed(2) + "  " + mv[9].toFixed(2)  + "  " +  (-mv[13].toFixed(2)) + "\n";
        str += mv[2].toFixed(2) + "  " + mv[6].toFixed(2) + "  " + mv[10].toFixed(2)  + "  " + (-mv[14].toFixed(2)) + "\n";
        str += mv[3].toFixed(2) + "  " + mv[7].toFixed(2) + "  " + mv[11].toFixed(2)  + "  " + (-mv[15].toFixed(2)) + "\n";
    }
    el.value = str;      
}

function resetTransforms(){
    mat4.identity(translation);
    mat4.identity(rotation);
}

function reset() {
    var elEyeDist = document.getElementById("rgEyeDistance");
    var elW = document.getElementById("rdW");
    resetTransforms();
    calcModelView();
    elEyeDist.value = 50;
    changeEyePosition(elEyeDist);
    drawComponents();
}    