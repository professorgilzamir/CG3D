var pditools = pditools || {};

pditools.createCPUContext = function(context2d){
	if (!context2d) {
		throw "Invalid Context: context2d is undefined!"
		return;
	} 
	
	var context =  {'context2d':context2d};

	context.getIndexFrom = function(x, y, w, h) {
		return (w * y + x) * 4;
	}

	context.setPixelf = function(imageData, x, y, pixel=[0.0, 0.0, 0.0, 1.0]){
		var idx = context.getIndexFrom(x, y, imageData.width, imageData.height);
		imageData.data[idx] = Math.floor(pixel[0] * 255);
		imageData.data[idx+1] = Math.floor(pixel[1] * 255);
		imageData.data[idx+2] = Math.floor(pixel[2] * 255);
		imageData.data[idx+3] = Math.floor(pixel[3] * 255);
	}

	context.setPixel = function(imageData, x, y, pixel=[0, 0, 0, 255]){
		var idx = context.getIndexFrom(x, y, imageData.width, imageData.height);
		imageData.data[idx] = pixel[0];
		imageData.data[idx+1] = pixel[1];
		imageData.data[idx+2] = pixel[2];
		imageData.data[idx+3] = pixel[3];
	}

	context.setChannel = function(imageData, x, y, channel=0, value = 0){
		var idx = context.getIndexFrom(x, y, imageData.width, imageData.height);
		imageData.data[idx+channel] = value;
	}

	context.setChannelf = function(imageData, x, y, channel=0, value = 0){
		var idx = context.getIndexFrom(x, y, imageData.width, imageData.height);
		imageData.data[idx+channel] = Math.round(value * 255.0);
	}

	context.getChannel = function(imageData, x, y, channel=0){
		var idx = context.getIndexFrom(x, y, imageData.width, imageData.height);
		return imageData.data[idx+channel];
	}

	context.getChannelf = function(imageData, x, y, channel=0){
		var idx = context.getIndexFrom(x, y, imageData.width, imageData.height);
		return imageData.data[idx+channel]/255.0;
	}

	context.getPixelf = function(imageData, x, y){
		var idx = context.getIndexFrom(x, y, imageData.width, imageData.height);
		var pixel = [0.0, 0.0, 0.0, 0.0];
		pixel[0] = imageData.data[idx]/255.0;
		pixel[1] = imageData.data[idx+1]/255.0;
		pixel[2] = imageData.data[idx+2]/255.0;
		pixel[3] = imageData.data[idx+3]/255.0;
		return pixel;
	}

	context.getPixel = function(imageData, x, y){
		var idx = context.getIndexFrom(x, y, imageData.width, imageData.height);
		var pixel = [0,0,0,0];
		pixel[0] = imageData.data[idx];
		pixel[1] = imageData.data[idx+1];
		pixel[2] = imageData.data[idx+2];
		pixel[3] = imageData.data[idx+3];
		return pixel;
	}

	context.intPixel = function(fpixel) {
		pixel = [0, 0, 0, 255];
		pixel[0] = Math.round(fpixel[0] * 255);
		pixel[1] = Math.round(fpixel[1] * 255);
		pixel[2] = Math.round(fpixel[2] * 255);
		pixel[3] = Math.round(fpixel[3] * 255);
		return pixel; 
	}

	context.floatPixel = function(ipixel) {
		pixel = [0.0, 0.0, 0.0, 1.0];
		pixel[0] = ipixel[0]/255.0;
		pixel[1] = ipixel[1]/255.0;
		pixel[2] = ipixel[2]/255.0;
		pixel[3] = ipixel[3]/255.0;
		return pixel;
	}

	context.readChannel = function(imageData, callback, channel=0){
		for (var y = 0; y < imageData.height; y++) {
			for (var x = 0; x < imageData.width; x++){
				callback(x, y, context.getChannel(imageData, x, y, channel));
			}
		}
	}

	context.read = function(imageData, callback){
		for (var y = 0; y < imageData.height; y++) {
			for (var x = 0; x < imageData.width; x++){
				callback(x, y, context.getPixel(imageData, x, y));
			}
		}
	}


	context.writeChannel = function(dstImageData, callback, srcImageData, channel=0){
		if (!srcImageData) srcImageData = dstImageData;
		for (var y = 0; y < dstImageData.height; y++) {
			for (var x = 0; x < dstImageData.width; x++){
				context.setChannel(dstImageData, x, y, channel, callback(srcImageData, x, y));
			}
		}
	}

	context.write = function(dstImageData, callback, srcImageData){
		if (!srcImageData) srcImageData = dstImageData;
		for (var y = 0; y < dstImageData.height; y++) {
			for (var x = 0; x < dstImageData.width; x++){
				context.setPixel(dstImageData, x, y,callback(srcImageData, x, y));
			}
		}
	}

	context.grayScale = function(imageData) {
		context.write(imageData, function(imgDt, x, y){
			pixel = context.getPixelf(imageData, x, y);
			r = pixel[0];
			g = pixel[1];
			b = pixel[2];
			v = 0.3 * r + 0.59 * g + 0.11 * b;
			pixel[0] = v;
			pixel[1] = v;
			pixel[2] = v;
			return context.intPixel(pixel);
		});
	}

	context.applyMask = function(dstImageData, maskw, maskWidth, maskHeight, srcImgData, channel=0, ignore=function(imgDt, x,y){return false;}){
		if (maskWidth % 2 == 0 || maskWidth < 3){
			throw "Invalid mask: width is not odd or width is less than 3";
			return;
		} else if (maskHeight % 2 == 0 || maskHeight < 3){
			throw "Invalid mask: height is not odd or height is less than 3";
		}

		if (!srcImgData) {
			ctx2d = context.context2d;
			srcImgData = ctx2d.createImageData(dstImageData.width, dstImageData.height);
			srcImgData.data.set(dstImageData.data);
		}

		widx = Math.floor(maskWidth/2);
		hidx = Math.floor(maskHeight/2);
		context.writeChannel(dstImageData, function(imgDt, x, y){

				cur = context.getChannelf(imgDt, x, y, channel);
				
				if (ignore(imgDt, x, y)){
					return cur;
				}

				var pixel = 0.0;
				var tmp = context.getChannelf(imgDt, x, y, channel);
				pixel += cur * maskw[widx][hidx];
				if (y + 1 < imgDt.height){
					cur = context.getChannelf(imgDt, x, y+1, channel);
					pixel += cur * maskw[widx][hidx+1];
					if (x + 1 < imgDt.width){
						cur = context.getChannelf(imgDt, x+1, y+1, channel);
						pixel += cur * maskw[widx+1][hidx+1];
					} 

					if (x - 1 >= 0) {
						cur = context.getChannelf(imgDt, x-1, y+1);
						pixel += cur * maskw[widx-1][hidx+1];
					}
				} 
				if (y - 1 >= 0) {
					cur = context.getChannelf(imgDt, x, y-1, channel);
					pixel += cur * maskw[widx][hidx-1];
					if (x + 1 < imgDt.width){
						cur = context.getChannelf(imgDt, x+1, y-1);
						pixel += cur * maskw[widx+1][hidx-1];
					} 

					if (x - 1 >= 0) {
						cur = context.getChannelf(imgDt, x-1, y-1);
						pixel += cur * maskw[widx-1][hidx-1];
					}
				}

				if (x + 1 < imgDt.width){
					cur = context.getChannelf(imgDt, x+1, y);
					pixel += cur * maskw[widx+1][hidx];
				} 

				if (x - 1 >= 0) {
					cur = context.getChannelf(imgDt, x-1, y);
					pixel += cur * maskw[widx-1][hidx];
				}

				return Math.round(pixel * 255.0);
		}, srcImgData, channel);
	}

	context.op2 = function(dstImgDt, imgDt1, imgDt2, operation = function(ch, opn1, opn2, dvalue){
		return opn1+opn2;
	}, channel=0) {
		context.writeChannel(dstImgDt, function(imgDt, x, y){
			p1 = context.getChannelf(imgDt1, x, y, channel);
			p2 = context.getChannelf(imgDt2, x, y, channel);
			return Math.round(operation(channel, p1, p2, 0.0)*255);
		});
	}

	context.op1 = function(dstImgDt, imgDt1, operation = function(ch, opn1, dvalue){
		return opn1;
	}, channel=0) {
		context.writeChannel(dstImgDt, function(imgDt, x, y){
			p1 = context.getChannelf(imgDt1, x, y, channel);
			return Math.round(operation(0, p1, 0.0) * 255);
		});
	}

	context.replicateChannel = function(dstImgDt, channel=0){
		context.write(dstImgDt, function(imgDt, x, y){
			pixel = [0, 0, 0, 255];
			src = context.getPixel(imgDt, x, y);
			pixel[0] = src[channel];
			pixel[1] = src[channel];
			pixel[2] = src[channel];
			return pixel;
		});
	}
	return context;
}
