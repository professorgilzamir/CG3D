var scene = scene || {};


scene.linearInterp = function(p1, p2, t){
	return [(1.0 - t)*p1[0] + t*p2[0], (1.0 - t)*p1[1] + t*p2[1], (1.0 - t)*p1[2] + t*p2[2]]; 
} 

scene.cubic_bezier_coord = function(B, t, axis){
	t3 = t*t*t;
	t2 = t*t;

	coef = [-t3 + 3*t2 - 3*t + 1,
			3*t3 - 6*t2 + 3*t,
			-3*t3+3*t2,
			t3];

	return coef[0]*B[0][axis] + coef[1]*B[1][axis] + coef[2]*B[2][axis] + coef[3]*B[3][axis];
}

scene.create_cubic_bezier = function(name, control, resolution){
	step = resolution;
	vertices = [];
	for (var t = 0.0; t < 1.0; t += step){
		vertices.push(scene.cubic_bezier_coord(control, t, 0));
		vertices.push(scene.cubic_bezier_coord(control, t, 1));
		vertices.push(scene.cubic_bezier_coord(control, t, 2));
	}
	vertices.push(scene.cubic_bezier_coord(control, 1.0, 0));
	vertices.push(scene.cubic_bezier_coord(control, 1.0, 1));
	vertices.push(scene.cubic_bezier_coord(control, 1.0, 2));
	indices = [];
	n = vertices.length/3;
	for (var i = 0; i < n-1; i++) {
		indices.push(i);
		indices.push(i+1);
	}
	return scene.create_object(name, vertices, indices, 2);
}
