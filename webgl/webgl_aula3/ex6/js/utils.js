function getVxShader(gl, str){
    shader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }
    return shader;
}

function getFgShader(gl, str) {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }
    return shader;
}

function initProgram(gl, vertexShader, fragShader) {
    prg = gl.createProgram();
    gl.attachShader(prg, vertexShader);
    gl.attachShader(prg, fragShader);
    gl.linkProgram(prg);

    if (!gl.getProgramParameter(prg, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    gl.useProgram(prg);
    return prg;
}

function getGLContext(canvasID){
    var canvas = document.getElementById(canvasID);
    if (canvas==null){
        alert("Canvas ausente!!!");
        return;
    } 
    var names = ["webgl", "experimental-webgl", "webkit-3d",
                "moz-webgl"];
    for (var i = 0; i < names.length; ++i){
        try{
            gl = canvas.getContext(names[i]);
        } catch(e){}
        if (gl) break;
    }
    if (gl == null) {
        alert("WebGL não é suportado!!!");
        return null;
    } 
    return gl;
}
