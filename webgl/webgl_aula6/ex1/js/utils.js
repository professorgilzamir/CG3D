var scene = scene || {};

scene.create = function(){
	scn = {};
	scn.objects = []
	scn.object_index = {}
	return scn;
}

scene.add_object = function(scn, obj){
	idx = scn.objects.length;
	scn.objects.push(obj);
	scn.object_index[obj.name] = idx;
	return idx;
}

scene.get_object = function(scn, idx){
	return scn.objects[idx];
}

scene.find_object = function(scn, name){
	if (scn.object_index.has(name)){
		return scn.object_index[name];
	}
	return null;
}

scene.calculateNormals = function (vertices, eleSize) {
    if (eleSize < 1 || eleSize > 3) {
        throw "Invalid element size: " + eleSize + ". Try element size in set [2, 3]."
        return;
    }

    if (eleSize == 1) {
        normals = [];
        n = vertices.length/3;
        for (var i = 0; i < n; i++) {
            normals.push(0.0);
            normals.push(0.7);
            normals.push(0.7);
        }
        return normals;
    }
    if (eleSize == 2){
        var vnormal = {};
        var n = 0;
        for (var i = 0; i < indices.length; i+=2) {
            vnormal[indices[i]] = vnormal[indices[i]] || [0,0,0];
            vnormal[indices[i+1]] = vnormal[indices[i+1]] || [0,0,0];

            var a = indices[i]*3, b = indices[i+1]*3;
            var A = [vertices[a], vertices[a+1], vertices[a+2]];
            var B = [vertices[b], vertices[b+1], vertices[b+2]];
            var u = [B[0]-A[0], B[1]-A[1], B[2]-A[2]];
            var v = [0.0, 1.0, 0.0];
            var w = [u[2] * v[3] - u[3] * v[2], u[3] * v[1] - u[1] * v[3], u[1]*v[2] - u[2] * v[1]];
            size = Math.sqrt[w[0] * w[0] + w[1] * w[1] + w[2] * w[2]];
            w[0] = w[0]/size;
            w[1] = w[1]/size;
            w[2] = w[2]/size;
            vnormal[indices[i]][0] = (vnormal[indices[i+1]][0] += w[0]);
            vnormal[indices[i]][1] = (vnormal[indices[i+1]][1] += w[1]);
            vnormal[indices[i]][2] = (vnormal[indices[i+1]][2] += w[2]);
            n++;
        }
        for (var i = 0; i < indices.length; i+=2) {
            vnormal[indices[i]][0]= (vnormal[indices[i+1]][0] /= n);
            vnormal[indices[i]][1]= (vnormal[indices[i+1]][1] /= n);
            vnormal[indices[i]][2]= (vnormal[indices[i+1]][2] /= n);
        }
        normals = [];
        n = vertices.length/3;
        for (var i = 0; i < n; i++){
            try {
                normals.push(vnormal[i][0]);
                normals.push(vnormal[i][1]);
                normals.push(vnormal[i][2]);   
            } catch(e){
                throw e+"\n Invalid index: "+i;
            }
        }

        return normals;

    } else {
        var vnormal = {};
        var n = 0;
        for (var i = 0; i < indices.length; i+=3) {
            vnormal[indices[i]] = vnormal[indices[i]] || [0,0,0];
            vnormal[indices[i+1]] = vnormal[indices[i+1]] || [0,0,0];

            var a = indices[i]*3, b = indices[i+1]*3;
            var A = [vertices[a], vertices[a+1], vertices[a+2]];
            var B = [vertices[b], vertices[b+1], vertices[b+2]];
            var C = [vertices[c], vertices[c+1], vertices[c+2]];
            var u = [B[0]-A[0], B[1]-A[1], B[2]-A[2]];
            var v = [C[0]-A[0], C[1]-A[1], C[2]-A[2]];
            var w = [u[2] * v[3] - u[3] * v[2], u[3] * v[1] - u[1] * v[3], u[1]*v[2] - u[2] * v[1]];
            size = Math.sqrt[w[0] * w[0] + w[1] * w[1] + w[2] * w[2]];
            w[0] = w[0]/size;
            w[1] = w[1]/size;
            w[2] = w[2]/size;
            vnormal[indices[i]][0] = vnormal[indices[i+1]][0] = (vnormal[indices[i+2]][0] += w[0]);
            vnormal[indices[i]][1] = vnormal[indices[i+1]][1] = (vnormal[indices[i+2]][1] += w[1]);
            vnormal[indices[i]][2] = vnormal[indices[i+1]][2] = (vnormal[indices[i+2]][2] += w[2]);
            n++;
        }
        for (var i = 0; i < indices.length; i+=3) {
            vnormal[indices[i]][0]= vnormal[indices[i+1]][0] = (vnormal[indices[i+2]][0] /= n);
            vnormal[indices[i]][1]= vnormal[indices[i+1]][1] = (vnormal[indices[i+2]][1] /= n);
            vnormal[indices[i]][2]= vnormal[indices[i+1]][2] = (vnormal[indices[i+2]][2] /= n);
        }
        normals = [];
        n = vertices.length/3;
        for (var i = 0; i < n; i++){
            try {
                normals.push(vnormal[i][0]);
                normals.push(vnormal[i][1]);
                normals.push(vnormal[i][2]);
            } catch(e){
                throw e+"\n Invalid index: "+i;
            }
        }
        return normals;
    }
}

scene.create_object = function(name, vertices, indices, eleSize=3, normals=null){
    obj = {};
    if (vertices) {
        obj.vertices = vertices;
    } else {
        throw "Vertices is necessary to object definition";
        return;
    }
    
    if (!indices) {
        throw "Indices is necessary to object definition";
        return;
    }

    if (normals) {
        obj.normals = normals;
    } else {
        if (eleSize >= 1) {
            obj.normals = scene.calculateNormals(vertices, eleSize);
        } else {
            throw "Element size can be more than 1";
        }
    }

    obj.name = name;
    obj.worldMatrix=[1, 0, 0, 0,
                     0, 1, 0, 0, 
                     0, 0, 1, 0, 
                     0, 0, 0, 1];

    obj.localMatrix=[1, 0, 0, 0,
                     0, 1, 0, 0, 
                     0, 0, 1, 0,
                     0, 0, 0, 1];
    obj.obj = {};
    obj.obj.material = {};
    obj.obj.material.indices = indices;
    obj.obj.material.diffuse_color = [];
    obj.obj.material.specular_color = [];
    obj.obj.material.ambient = [];
    obj.obj.material.eleSize = eleSize;
    for (var i = 0; i < obj.obj.material.indices.length; i++){
        obj.obj.material.diffuse_color.push(0.0);
        obj.obj.material.diffuse_color.push(0.0);
        obj.obj.material.diffuse_color.push(0.0);
        obj.obj.material.diffuse_color.push(1.0);
        obj.obj.material.ambient.push(0.6);
        obj.obj.material.specular_color.push(1.0);
        obj.obj.material.specular_color.push(1.0);
        obj.obj.material.specular_color.push(1.0);
        obj.obj.material.specular_color.push(1.0);
    }
    return obj;
}


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

function loadFile(url, successHandler, errorHandler){
	var request = new XMLHttpRequest();
	
	var resource = url;
	request.open("GET", resource);

	request.onreadystatechange= function() {
		if (request.readyState == 4) {
			if (request.status == 200 || (request.status == 0 && document.domain.length == 0)){
				try{
					model = JSON.parse(request.responseText);
					successHandler(url, model);
					return;
				} catch(e) {
					//console.warn(request.responseText);
					error = {
						"status": 0,
						"message": e.message
					};
					errorHandler(error);
					return;
				}
			}
			error = {
				"status": request.status,
				"message": "server error"
			};
			return errorHandler(error);
		}
	};

	request.send();
}
