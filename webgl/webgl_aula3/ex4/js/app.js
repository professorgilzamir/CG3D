var gl = null;
var indices = [];
var vertices = [];
var colors = [];
var prg = null;
var quadIBO = null;
var quadVBO = null;
var quadVxColor = null;
var width = 0;
var height = 0;
var primitiveType = null;


function createBuffers() {
    prg.vertexColor = gl.getAttribLocation(prg, "aVertexColor")
    prg.vertexPosition = gl.getAttribLocation(prg, "aVertexPosition");

    if (primitiveType == null) {
        primitiveType = gl.TRIANGLES;
    }
    //VBO
    vertices = [ 0.0,  0.0, 0.2,  0.2, 0.4,  0.0, 0.6,  0.2, 
                 0.8,  0.0]; /* vertex array */
    quadVBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadVBO);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);            

    //IBO
    indices = [0, 2, 1, 1, 2, 3, 2, 4, 3];
    quadIBO = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, quadIBO);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    //Quad Color
    colors = [1.0, 0.0, 0.0, 1.0, 
              0.0, 1.0, 0.0, 1.0,
              0.0, 0.0, 1.0, 1.0,
              1.0, 1.0, 0.0, 1.0,
              0.0, 1.0, 1.0, 1.0];

    quadVxColor = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadVxColor);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

function draw(){

    var vx_str = document.getElementById("vxShader").innerText;

    var fg_str = document.getElementById("fgShader").innerText;

    prg = initProgram(gl, getVxShader(gl, vx_str), getFgShader(gl, fg_str));
    
    createBuffers();

    gl.bindBuffer(gl.ARRAY_BUFFER, quadVxColor);
    gl.vertexAttribPointer(prg.vertexColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(prg.vertexColor);


    gl.bindBuffer(gl.ARRAY_BUFFER, quadVBO);
    gl.vertexAttribPointer(prg.vertexPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(prg.vertexPosition);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, quadIBO);
    gl.drawElements(primitiveType, indices.length, gl.UNSIGNED_SHORT,0);
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
