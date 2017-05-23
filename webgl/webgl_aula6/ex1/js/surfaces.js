var scene = scene || {};



scene.translate = function(p, t){
	p[0] = p[0] + t[0];
	p[1] = p[1] + t[1];
	p[2] = p[2] + t[2];
}

scene.copyPoint3f = function(p1, p2){
	p1[0] = p2[0];
	p1[1] = p2[1];
	p1[2] = p2[2];
}

scene.create_surf_loftbezier = function(name, curve1, curve2, resolution){
	p0 = [0.0, 0.0, 0.0];
	p1 = [0.0, 0.0, 0.0];
	tmp = [0.0, 0.0, 0.0];
	vertices = [];
	indices = [];
	idx = 0;
	for (var s = 0.0; s < 1.0; s += resolution){
		p0[0] = scene.cubic_bezier_coord(curve1, s, 0);
		p0[1] = scene.cubic_bezier_coord(curve1, s, 1);
	 	p0[2] = scene.cubic_bezier_coord(curve1, s, 2);
		
		p1[0] = scene.cubic_bezier_coord(curve2, s, 0);
		p1[1] = scene.cubic_bezier_coord(curve2, s, 1);
		p1[2] = scene.cubic_bezier_coord(curve2, s, 2);
		
		for (var t = 0.0; t < 1.0;  t += resolution) {
			pr = scene.linearInterp(p0, p1, t);
			vertices.push(pr[0]);
			vertices.push(pr[1]);
			vertices.push(pr[2]);	
			indices.push(idx++);
		}
		pr = scene.linearInterp(p0, p1, 1.0);
		vertices.push(pr[0]);
		vertices.push(pr[1]);
		vertices.push(pr[2]);	
		indices.push(idx++);
	}
	p0[0] = scene.cubic_bezier_coord(curve1, 1.0, 0);
	p0[1] = scene.cubic_bezier_coord(curve1, 1.0, 1);
 	p0[2] = scene.cubic_bezier_coord(curve1, 1.0, 2);
	
	p1[0] = scene.cubic_bezier_coord(curve2, 1.0, 0);
	p1[1] = scene.cubic_bezier_coord(curve2, 1.0, 1);
	p1[2] = scene.cubic_bezier_coord(curve2, 1.0, 2);
	
	for (var t = 0.0; t < 1.0;  t += resolution) {
		pr = scene.linearInterp(p0, p1, t);
		vertices.push(pr[0]);
		vertices.push(pr[1]);
		vertices.push(pr[2]);	
		indices.push(idx++);
	}
	pr = scene.linearInterp(p0, p1, 1.0);
	vertices.push(pr[0]);
	vertices.push(pr[1]);
	vertices.push(pr[2]);	
	indices.push(idx++);
	surf =  scene.create_object(name, vertices, indices, 1);
	surf.obj.material.pointSize = 10;
	return surf;
}

