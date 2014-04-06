WebCLGLUtils=function(gl){this.gl=gl;};WebCLGLUtils.prototype.loadQuad=function(node,length,height){var l=(length==undefined)?0.5:length;var h=(height==undefined)?0.5:height;this.vertexArray=[-l,-h,0.0,l,-h,0.0,l,h,0.0,-l,h,0.0];this.textureArray=[0.0,0.0,0.0,1.0,0.0,0.0,1.0,1.0,0.0,0.0,1.0,0.0];this.indexArray=[0,1,2,0,2,3];var meshObject=new Object;meshObject.vertexArray=this.vertexArray;meshObject.vertexItemSize=this.vertexItemSize;meshObject.vertexNumItems=this.vertexNumItems;meshObject.textureArray=this.textureArray;meshObject.textureItemSize=this.textureItemSize;meshObject.textureNumItems=this.textureNumItems;meshObject.indexArray=this.indexArray;meshObject.indexItemSize=this.indexItemSize;meshObject.indexNumItems=this.indexNumItems;return meshObject;};WebCLGLUtils.prototype.createShader=function(name,sourceVertex,sourceFragment,shaderProgram){var _sv=false,_sf=false;var shaderVertex=this.gl.createShader(this.gl.VERTEX_SHADER);this.gl.shaderSource(shaderVertex,sourceVertex);this.gl.compileShader(shaderVertex);if(!this.gl.getShaderParameter(shaderVertex,this.gl.COMPILE_STATUS)){alert('Error sourceVertex of shader '+name+'. See console.');console.log('Error vertex-shader '+name+':\n '+this.gl.getShaderInfoLog(shaderVertex));if(this.gl.getShaderInfoLog(shaderVertex)!=undefined){console.log(this.gl.getShaderInfoLog(shaderVertex));}}else{this.gl.attachShader(shaderProgram,shaderVertex);_sv=true;}
var shaderFragment=this.gl.createShader(this.gl.FRAGMENT_SHADER);this.gl.shaderSource(shaderFragment,sourceFragment);this.gl.compileShader(shaderFragment);if(!this.gl.getShaderParameter(shaderFragment,this.gl.COMPILE_STATUS)){alert('Error sourceFragment of shader '+name+'. See console.');var infoLog=this.gl.getShaderInfoLog(shaderFragment);console.log('Error fragment-shader '+name+':\n '+infoLog);if(infoLog!=undefined){console.log(infoLog);var arrErrors=[];var errors=infoLog.split("\n");for(var n=0,f=errors.length;n<f;n++){if(errors[n].match(/^ERROR/gim)!=null){var expl=errors[n].split(':');var line=parseInt(expl[2]);arrErrors.push([line,errors[n]]);}}
var sour=this.gl.getShaderSource(shaderFragment).split("\n");sour.unshift("");for(var n=0,f=sour.length;n<f;n++){var lineWithError=false;var errorStr='';for(var e=0,fe=arrErrors.length;e<fe;e++){if(n==arrErrors[e][0]){lineWithError=true;errorStr=arrErrors[e][1];break;}}
if(lineWithError==false){console.log(n+' '+sour[n]);}else{console.log('►►'+n+' '+sour[n]+'\n'+errorStr);}}}}else{this.gl.attachShader(shaderProgram,shaderFragment);_sf=true;}
if(_sv==true&&_sf==true){this.gl.linkProgram(shaderProgram);if(!this.gl.getProgramParameter(shaderProgram,this.gl.LINK_STATUS)){alert('Error in shader '+name);console.log('Error shader program '+name+':\n ');if(this.gl.getProgramInfoLog(shaderProgram)!=undefined){console.log(this.gl.getProgramInfoLog(shaderProgram));}}}};WebCLGLUtils.prototype.getUint8ArrayFromHTMLImageElement=function(imageElement){var e=document.createElement('canvas');e.width=imageElement.width;e.height=imageElement.height;var ctx2D_tex=e.getContext("2d");ctx2D_tex.drawImage(imageElement,0,0);var arrayTex=ctx2D_tex.getImageData(0,0,imageElement.width,imageElement.height);return arrayTex.data;};WebCLGLUtils.prototype.dot4=function(vector4A,vector4B){return vector4A[0]*vector4B[0]+vector4A[1]*vector4B[1]+vector4A[2]*vector4B[2]+vector4A[3]*vector4B[3];};WebCLGLUtils.prototype.fract=function(number){return number-Math.floor(number);};WebCLGLUtils.prototype.pack=function(v){var bias=[1.0/255.0,1.0/255.0,1.0/255.0,0.0];var r=v;var g=this.fract(r*255.0);var b=this.fract(g*255.0);var a=this.fract(b*255.0);var colour=[r,g,b,a];var dd=[colour[1]*bias[0],colour[2]*bias[1],colour[3]*bias[2],colour[3]*bias[3]];return[colour[0]-dd[0],colour[1]-dd[1],colour[2]-dd[2],colour[3]-dd[3]];};WebCLGLUtils.prototype.unpack=function(colour){var bitShifts=[1.0,1.0/255.0,1.0/(255.0*255.0),1.0/(255.0*255.0*255.0)];return this.dot4(colour,bitShifts);};WebCLGLUtils.prototype.packGLSLFunctionString=function(){return'vec4 pack (float depth) {'+'const vec4 bias = vec4(1.0 / 255.0,'+'1.0 / 255.0,'+'1.0 / 255.0,'+'0.0);'+'float r = depth;'+'float g = fract(r * 255.0);'+'float b = fract(g * 255.0);'+'float a = fract(b * 255.0);'+'vec4 colour = vec4(r, g, b, a);'+'return colour - (colour.yzww * bias);'+'}';};WebCLGLUtils.prototype.unpackGLSLFunctionString=function(){return'float unpack (vec4 colour) {'+'const vec4 bitShifts = vec4(1.0,'+'1.0 / 255.0,'+'1.0 / (255.0 * 255.0),'+'1.0 / (255.0 * 255.0 * 255.0));'+'return dot(colour, bitShifts);'+'}';};
WebCLGLBuffer=function(gl,length,linear){this.gl=gl;this._floatSupport=(this.gl.getExtension('OES_texture_float')&&this.gl.getExtension('OES_texture_float_linear'))?this.gl.FLOAT:this.gl.UNSIGNED_BYTE;if(length instanceof Object){this.W=length[0];this.H=length[1];}else{this.W=Math.sqrt(length);this.H=this.W;}
this.type='FLOAT';this.offset=0;this.linear=linear;this.utils=new WebCLGLUtils(this.gl);this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL,false);this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);this.textureData=this.gl.createTexture();this.gl.bindTexture(this.gl.TEXTURE_2D,this.textureData);if(this.linear!=undefined&&this.linear){this.gl.texImage2D(this.gl.TEXTURE_2D,0,this.gl.RGBA,this.W,this.H,0,this.gl.RGBA,this._floatSupport,null);this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MAG_FILTER,this.gl.LINEAR);this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MIN_FILTER,this.gl.LINEAR_MIPMAP_NEAREST);this.gl.generateMipmap(this.gl.TEXTURE_2D);}else{this.gl.texImage2D(this.gl.TEXTURE_2D,0,this.gl.RGBA,this.W,this.H,0,this.gl.RGBA,this._floatSupport,null);this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MAG_FILTER,this.gl.NEAREST);this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MIN_FILTER,this.gl.NEAREST);this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_S,this.gl.CLAMP_TO_EDGE);this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_T,this.gl.CLAMP_TO_EDGE);}
this.inData;this.outArray4Uint8Array=new Uint8Array((this.W*this.H)*4);this.outArrayFloat32ArrayX=[];this.outArrayFloat32ArrayY=[];this.outArrayFloat32ArrayZ=[];this.outArrayFloat32ArrayW=[];this.outArray4Float32Array=[];this.rBuffer=this.gl.createRenderbuffer();this.gl.bindRenderbuffer(this.gl.RENDERBUFFER,this.rBuffer);this.gl.renderbufferStorage(this.gl.RENDERBUFFER,this.gl.DEPTH_COMPONENT16,this.W,this.H);this.gl.bindRenderbuffer(this.gl.RENDERBUFFER,null);this.fBuffer=this.gl.createFramebuffer();this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,this.fBuffer);this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER,this.gl.DEPTH_ATTACHMENT,this.gl.RENDERBUFFER,this.rBuffer);};
WebCLGLKernel=function(gl,source,header){this.gl=gl;var highPrecisionSupport=this.gl.getShaderPrecisionFormat(this.gl.FRAGMENT_SHADER,this.gl.HIGH_FLOAT);this.precision=(highPrecisionSupport.precision!=0)?'precision highp float;\n\nprecision highp int;\n\n':'precision lowp float;\n\nprecision lowp int;\n\n';this.utils=new WebCLGLUtils(this.gl);this.ready=false;this.in_values=[];this.samplers=[];this.uniformsFloat=[];if(source!=undefined)this.setKernelSource(source,header);};WebCLGLKernel.prototype.setKernelSource=function(source,header){this.head=(header!=undefined)?header:'';this.in_values=[];var argumentsSource=source.split(')')[0].split('(')[1].split(',');for(var n=0,f=argumentsSource.length;n<f;n++){if(argumentsSource[n].match(/\*/gm)!=null){if(argumentsSource[n].match(/float4/gm)!=null){this.in_values[n]={value:undefined,type:'buffer4',name:argumentsSource[n].split('*')[1].trim()};}else{this.in_values[n]={value:undefined,type:'buffer',name:argumentsSource[n].split('*')[1].trim()};}}else{this.in_values[n]={value:undefined,type:'float',name:argumentsSource[n].split(' ')[1].trim()};}}
this.source=source.replace(/\r\n/gi,'').replace(/\r/gi,'').replace(/\n/gi,'');this.source=this.source.replace(/^\w* \w*\([\w\s\*,]*\) {/gi,'').replace(/}\W*$/gi,'');this.source=this.parse(this.source);};WebCLGLKernel.prototype.parse=function(source){for(var n=0,f=this.in_values.length;n<f;n++){var regexp=new RegExp(this.in_values[n].name+'\\[\\w*\\]',"gm");var varMatches=source.match(regexp);if(varMatches!=null){for(var nB=0,fB=varMatches.length;nB<fB;nB++){var name=varMatches[nB].split('[')[0];var vari=varMatches[nB].split('[')[1].split(']')[0];var regexp=new RegExp(name+'\\['+vari.trim()+'\\]',"gm");if(this.in_values[n].type=='buffer')
source=source.replace(regexp,'in_data('+name+','+vari+')');else if(this.in_values[n].type=='buffer4')
source=source.replace(regexp,'in_data4('+name+','+vari+')');}}}
return source;};WebCLGLKernel.prototype.setKernelArg=function(numArgument,data){var isNewArg=(this.in_values[numArgument]==undefined||this.in_values[numArgument].value==undefined)?true:false;this.in_values[numArgument].value=data;if(isNewArg){}else{if(this.in_values[numArgument].type=='buffer'||this.in_values[numArgument].type=='buffer4'){this.samplers[this.in_values[numArgument].idPointer].value=this.in_values[numArgument].value;}else if(this.in_values[numArgument].type=='float'){this.uniformsFloat[this.in_values[numArgument].idPointer].value=this.in_values[numArgument].value;}}};WebCLGLKernel.prototype.isCompilable=function(){for(var n=0,f=this.in_values.length;n<f;n++)
if(this.in_values[n].value==undefined)
return false;return true;};WebCLGLKernel.prototype.isReady=function(){if(this.ready==true)return true;else if(this.isCompilable())this.compile();};WebCLGLKernel.prototype.compile=function(){lines_uniforms=function(in_values){str='';for(var n=0,f=in_values.length;n<f;n++){if(in_values[n].type=='buffer'||in_values[n].type=='buffer4'){str+='uniform sampler2D '+in_values[n].name+';\n';}else if(in_values[n].type=='float'){str+='uniform float '+in_values[n].name+';\n';}}
return str;};var sourceVertex=this.precision+'attribute vec3 aVertexPosition;\n'+'attribute vec2 aTextureCoord;\n'+'varying vec2 global_id;\n'+'void main(void) {\n'+'gl_Position = vec4(aVertexPosition, 1.0);\n'+'global_id = aTextureCoord;\n'+'}\n';var sourceFragment=this.precision+
lines_uniforms(this.in_values)+'varying vec2 global_id;\n'+'float in_data(sampler2D arg, vec2 coord) {\n'+'vec4 textureColor = texture2D(arg, coord);\n'+'return textureColor.x;\n'+'}\n'+'vec4 in_data4(sampler2D arg, vec2 coord) {\n'+'vec4 textureColor = texture2D(arg, coord);\n'+'return textureColor;\n'+'}\n'+'vec2 get_global_id() {\n'+'return global_id;\n'+'}\n'+
this.head+'void main(void) {\n'+'float out_float = -999.99989;\n'+'vec4 out_float4;\n'+
this.source+'if(out_float != -999.99989) gl_FragColor = vec4(out_float,0.0,0.0,1.0);\n'+'else gl_FragColor = out_float4;\n'+'}\n';this.kernel=this.gl.createProgram();this.utils.createShader("WEBCLGL",sourceVertex,sourceFragment,this.kernel);this.updatePointers();this.attr_VertexPos=this.gl.getAttribLocation(this.kernel,"aVertexPosition");this.attr_TextureCoord=this.gl.getAttribLocation(this.kernel,"aTextureCoord");this.ready=true;return true;};WebCLGLKernel.prototype.updatePointers=function(){this.samplers=[];this.uniformsFloat=[];for(var n=0,f=this.in_values.length;n<f;n++){if(this.in_values[n].type=='buffer'||this.in_values[n].type=='buffer4'){this.samplers.push({location:this.gl.getUniformLocation(this.kernel,this.in_values[n].name),value:this.in_values[n].value});this.in_values[n].idPointer=this.samplers.length-1;}else if(this.in_values[n].type=='float'){this.uniformsFloat.push({location:this.gl.getUniformLocation(this.kernel,this.in_values[n].name),value:this.in_values[n].value});this.in_values[n].idPointer=this.uniformsFloat.length-1;}}};
WebCLGL=function(webglcontext){this.e=undefined;if(webglcontext==undefined){this.e=document.createElement('canvas');this.e.width=32;this.e.height=32;try{this.gl=this.e.getContext("webgl",{antialias:false});}catch(e){this.gl=undefined;}
if(this.gl==undefined){try{this.gl=this.e.getContext("experimental-webgl",{antialias:false});}catch(e){this.gl=undefined;}}}else this.gl=webglcontext;this._floatSupport=(this.gl.getExtension('OES_texture_float')&&this.gl.getExtension('OES_texture_float_linear'))?this.gl.FLOAT:this.gl.UNSIGNED_BYTE;var highPrecisionSupport=this.gl.getShaderPrecisionFormat(this.gl.FRAGMENT_SHADER,this.gl.HIGH_FLOAT);this.precision=(highPrecisionSupport.precision!=0)?'precision highp float;\n\nprecision highp int;\n\n':'precision lowp float;\n\nprecision lowp int;\n\n';this.gl.viewport(0,0,32,32);this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,null);this.utils=new WebCLGLUtils(this.gl);var mesh=this.utils.loadQuad(undefined,1.0,1.0);this.vertexBuffer_QUAD=this.gl.createBuffer();this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.vertexBuffer_QUAD);this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array(mesh.vertexArray),this.gl.STATIC_DRAW);this.textureBuffer_QUAD=this.gl.createBuffer();this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.textureBuffer_QUAD);this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array(mesh.textureArray),this.gl.STATIC_DRAW);this.indexBuffer_QUAD=this.gl.createBuffer();this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer_QUAD);this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(mesh.indexArray),this.gl.STATIC_DRAW);var sourceVertex=this.precision+'attribute vec3 aVertexPosition;\n'+'attribute vec2 aTextureCoord;\n'+'varying vec2 vTextureCoord;\n'+'void main(void) {\n'+'gl_Position = vec4(aVertexPosition, 1.0);\n'+'vTextureCoord = aTextureCoord;\n'+'}\n';var sourceFragment=this.precision+'uniform sampler2D sampler_buffer;\n'+'uniform int u_vectorValue;\n'+'uniform int u_offset;\n'+'varying vec2 vTextureCoord;\n'+
this.utils.packGLSLFunctionString()+'void main(void) {\n'+'vec4 tex = texture2D(sampler_buffer, vTextureCoord);'+'if(u_offset > 0) {'+'float offset = float(u_offset);'+'if(u_vectorValue == 0) gl_FragColor = pack((tex.r+offset)/(offset*2.0));\n'+'if(u_vectorValue == 1) gl_FragColor = pack((tex.g+offset)/(offset*2.0));\n'+'if(u_vectorValue == 2) gl_FragColor = pack((tex.b+offset)/(offset*2.0));\n'+'if(u_vectorValue == 3) gl_FragColor = pack((tex.a+offset)/(offset*2.0));\n'+'} else {'+'if(u_vectorValue == 0) gl_FragColor = pack(tex.r);\n'+'if(u_vectorValue == 1) gl_FragColor = pack(tex.g);\n'+'if(u_vectorValue == 2) gl_FragColor = pack(tex.b);\n'+'if(u_vectorValue == 3) gl_FragColor = pack(tex.a);\n'+'}'+'}\n';this.shader_readpixels=this.gl.createProgram();this.utils.createShader("CLGLREADPIXELS",sourceVertex,sourceFragment,this.shader_readpixels);this.u_offset=this.gl.getUniformLocation(this.shader_readpixels,"u_offset");this.u_vectorValue=this.gl.getUniformLocation(this.shader_readpixels,"u_vectorValue");this.sampler_buffer=this.gl.getUniformLocation(this.shader_readpixels,"sampler_buffer");this.attr_VertexPos=this.gl.getAttribLocation(this.shader_readpixels,"aVertexPosition");this.attr_TextureCoord=this.gl.getAttribLocation(this.shader_readpixels,"aTextureCoord");var sourceVertex=this.precision+'attribute vec3 aVertexPosition;\n'+'attribute vec2 aTextureCoord;\n'+'varying vec2 vTextureCoord;\n'+'void main(void) {\n'+'gl_Position = vec4(aVertexPosition, 1.0);\n'+'vTextureCoord = aTextureCoord;\n'+'}';var sourceFragment=this.precision+'uniform sampler2D sampler_toSave;\n'+'varying vec2 vTextureCoord;\n'+'void main(void) {\n'+'vec4 texture = texture2D(sampler_toSave, vTextureCoord);\n'+'gl_FragColor = texture;'+'}';this.shader_copyTexture=this.gl.createProgram();this.utils.createShader("CLGLCOPYTEXTURE",sourceVertex,sourceFragment,this.shader_copyTexture);this.attr_copyTexture_pos=this.gl.getAttribLocation(this.shader_copyTexture,"aVertexPosition");this.attr_copyTexture_tex=this.gl.getAttribLocation(this.shader_copyTexture,"aTextureCoord");this.sampler_copyTexture_toSave=this.gl.getUniformLocation(this.shader_copyTexture,"sampler_toSave");};WebCLGL.prototype.copy=function(valueToRead,valueToWrite){if(valueToRead instanceof WebCLGLBuffer){this.gl.viewport(0,0,valueToWrite.W,valueToWrite.H);this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,valueToWrite.fBuffer);this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER,this.gl.COLOR_ATTACHMENT0,this.gl.TEXTURE_2D,valueToWrite.textureData,0);}else
this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER,this.gl.COLOR_ATTACHMENT0,this.gl.TEXTURE_2D,valueToWrite,0);this.gl.useProgram(this.shader_copyTexture);this.gl.activeTexture(this.gl.TEXTURE0);var toRead=(valueToRead instanceof WebGLTexture)?valueToRead:valueToRead.textureData;this.gl.bindTexture(this.gl.TEXTURE_2D,toRead);this.gl.uniform1i(this.sampler_copyTexture_toSave,0);this.gl.enableVertexAttribArray(this.attr_copyTexture_pos);this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.vertexBuffer_QUAD);this.gl.vertexAttribPointer(this.attr_copyTexture_pos,3,this.gl.FLOAT,false,0,0);this.gl.enableVertexAttribArray(this.attr_copyTexture_tex);this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.textureBuffer_QUAD);this.gl.vertexAttribPointer(this.attr_copyTexture_tex,3,this.gl.FLOAT,false,0,0);this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer_QUAD);this.gl.drawElements(this.gl.TRIANGLES,6,this.gl.UNSIGNED_SHORT,0);};WebCLGL.prototype.createBuffer=function(length,type,offset,linear){var webclglBuffer=new WebCLGLBuffer(this.gl,length,linear);if(type!=undefined&&type=='FLOAT4')webclglBuffer.type='FLOAT4';if(offset!=undefined)webclglBuffer.offset=offset;return webclglBuffer;};WebCLGL.prototype.createKernel=function(source,header){var webclglKernel=new WebCLGLKernel(this.gl,source,header);return webclglKernel;};WebCLGL.prototype.enqueueWriteBuffer=function(buffer,arr,flip){buffer.inData=arr;if(arr instanceof WebGLTexture)buffer.textureData=arr;else{if(flip==false||flip==undefined)
this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL,false);else
this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL,true);this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);this.gl.bindTexture(this.gl.TEXTURE_2D,buffer.textureData);if(arr instanceof HTMLImageElement){buffer.inData=this.utils.getUint8ArrayFromHTMLImageElement(arr);this.gl.texImage2D(this.gl.TEXTURE_2D,0,this.gl.RGBA,this.gl.RGBA,this._floatSupport,arr);}else{if(buffer.type=='FLOAT4'){if(this.gl.getExtension('OES_texture_float')||this.gl.getExtension('OES_texture_float_linear')){if(arr instanceof Uint8Array)
this.gl.texImage2D(this.gl.TEXTURE_2D,0,this.gl.RGBA,buffer.W,buffer.H,0,this.gl.RGBA,this._floatSupport,new Float32Array(arr));else if(arr instanceof Float32Array)
this.gl.texImage2D(this.gl.TEXTURE_2D,0,this.gl.RGBA,buffer.W,buffer.H,0,this.gl.RGBA,this._floatSupport,arr);else
this.gl.texImage2D(this.gl.TEXTURE_2D,0,this.gl.RGBA,buffer.W,buffer.H,0,this.gl.RGBA,this._floatSupport,new Float32Array(arr));}else{this.gl.texImage2D(this.gl.TEXTURE_2D,0,this.gl.RGBA,buffer.W,buffer.H,0,this.gl.RGBA,this._floatSupport,new Uint8Array(arr));}}else if(buffer.type=='FLOAT'){var arrayTemp;if(this.gl.getExtension('OES_texture_float')||this.gl.getExtension('OES_texture_float_linear'))
arrayTemp=new Float32Array(arr.length*4);else
arrayTemp=new Uint8Array(arr.length*4);for(var n=0,f=arr.length;n<f;n++){var idd=n*4;arrayTemp[idd]=arr[n];arrayTemp[idd+1]=0.0;arrayTemp[idd+2]=0.0;arrayTemp[idd+3]=0.0;}
arr=arrayTemp;this.gl.texImage2D(this.gl.TEXTURE_2D,0,this.gl.RGBA,buffer.W,buffer.H,0,this.gl.RGBA,this._floatSupport,arr);}}}
if(buffer.linear)this.gl.generateMipmap(this.gl.TEXTURE_2D);};WebCLGL.prototype.enqueueNDRangeKernel=function(kernel,buffer){if(kernel.isReady()==true){this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,buffer.fBuffer);this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER,this.gl.COLOR_ATTACHMENT0,this.gl.TEXTURE_2D,buffer.textureData,0);this.gl.viewport(0,0,buffer.W,buffer.H);this.gl.useProgram(kernel.kernel);for(var n=0,f=kernel.samplers.length;n<f;n++){if(n==0)this.gl.activeTexture(this.gl.TEXTURE0);else if(n==1)this.gl.activeTexture(this.gl.TEXTURE1);else if(n==2)this.gl.activeTexture(this.gl.TEXTURE2);else if(n==3)this.gl.activeTexture(this.gl.TEXTURE3);else if(n==4)this.gl.activeTexture(this.gl.TEXTURE4);else if(n==5)this.gl.activeTexture(this.gl.TEXTURE5);else if(n==6)this.gl.activeTexture(this.gl.TEXTURE6);else if(n==7)this.gl.activeTexture(this.gl.TEXTURE7);else if(n==8)this.gl.activeTexture(this.gl.TEXTURE8);else if(n==9)this.gl.activeTexture(this.gl.TEXTURE9);else if(n==10)this.gl.activeTexture(this.gl.TEXTURE10);else if(n==11)this.gl.activeTexture(this.gl.TEXTURE11);else if(n==12)this.gl.activeTexture(this.gl.TEXTURE12);else if(n==13)this.gl.activeTexture(this.gl.TEXTURE13);else if(n==14)this.gl.activeTexture(this.gl.TEXTURE14);else if(n==15)this.gl.activeTexture(this.gl.TEXTURE15);else this.gl.activeTexture(this.gl.TEXTURE16);this.gl.bindTexture(this.gl.TEXTURE_2D,kernel.samplers[n].value.textureData);this.gl.uniform1i(kernel.samplers[n].location,n);}
for(var n=0,f=kernel.uniformsFloat.length;n<f;n++){this.gl.uniform1f(kernel.uniformsFloat[n].location,kernel.uniformsFloat[n].value);}
this.gl.enableVertexAttribArray(kernel.attr_VertexPos);this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.vertexBuffer_QUAD);this.gl.vertexAttribPointer(kernel.attr_VertexPos,3,this._floatSupport,false,0,0);this.gl.enableVertexAttribArray(kernel.attr_TextureCoord);this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.textureBuffer_QUAD);this.gl.vertexAttribPointer(kernel.attr_TextureCoord,3,this._floatSupport,false,0,0);this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer_QUAD);this.gl.drawElements(this.gl.TRIANGLES,6,this.gl.UNSIGNED_SHORT,0);}};WebCLGL.prototype.enqueueReadBuffer_WebGLTexture=function(buffer){return buffer.textureData;};WebCLGL.prototype.enqueueReadBuffer=function(buffer){this.gl.uniform1i(this.u_offset,buffer.offset);this.gl.activeTexture(this.gl.TEXTURE0);this.gl.bindTexture(this.gl.TEXTURE_2D,buffer.textureData);this.gl.uniform1i(this.sampler_buffer,0);this.gl.enableVertexAttribArray(this.attr_VertexPos);this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.vertexBuffer_QUAD);this.gl.vertexAttribPointer(this.attr_VertexPos,3,this._floatSupport,false,0,0);this.gl.enableVertexAttribArray(this.attr_TextureCoord);this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.textureBuffer_QUAD);this.gl.vertexAttribPointer(this.attr_TextureCoord,3,this._floatSupport,false,0,0);this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer_QUAD);this.gl.drawElements(this.gl.TRIANGLES,6,this.gl.UNSIGNED_SHORT,0);this.gl.readPixels(0,0,buffer.W,buffer.H,this.gl.RGBA,this.gl.UNSIGNED_BYTE,buffer.outArray4Uint8Array);return buffer.outArray4Uint8Array;};WebCLGL.prototype.enqueueReadBuffer_Float_Packet4Uint8Array=function(buffer){this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,null);this.gl.viewport(0,0,buffer.W,buffer.H);if(this.e!=undefined){this.e.width=buffer.W;this.e.height=buffer.H;}
this.gl.useProgram(this.shader_readpixels);this.gl.uniform1i(this.u_vectorValue,0);return this.enqueueReadBuffer(buffer);};WebCLGL.prototype.enqueueReadBuffer_Float=function(buffer){this.outArrayFloat32ArrayX=[];this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,null);this.gl.viewport(0,0,buffer.W,buffer.H);if(this.e!=undefined){this.e.width=buffer.W;this.e.height=buffer.H;}
this.gl.useProgram(this.shader_readpixels);this.gl.uniform1i(this.u_vectorValue,0);var packet4Uint8Array=this.enqueueReadBuffer(buffer);for(var n=0,f=packet4Uint8Array.length/4;n<f;n++){var idd=n*4;if(buffer.offset>0)buffer.outArrayFloat32ArrayX[n]=(this.utils.unpack([packet4Uint8Array[idd+0]/255,packet4Uint8Array[idd+1]/255,packet4Uint8Array[idd+2]/255,packet4Uint8Array[idd+3]/255])*(buffer.offset*2))-buffer.offset;else buffer.outArrayFloat32ArrayX[n]=(this.utils.unpack([packet4Uint8Array[idd+0]/255,packet4Uint8Array[idd+1]/255,packet4Uint8Array[idd+2]/255,packet4Uint8Array[idd+3]/255]));}
return buffer.outArrayFloat32ArrayX;};WebCLGL.prototype.enqueueReadBuffer_Float4=function(buffer){this.outArrayFloat32ArrayX=[];this.outArrayFloat32ArrayY=[];this.outArrayFloat32ArrayZ=[];this.outArrayFloat32ArrayW=[];this.outArray4Float32Array=[];this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,null);this.gl.viewport(0,0,buffer.W,buffer.H);if(this.e!=undefined){this.e.width=buffer.W;this.e.height=buffer.H;}
this.gl.useProgram(this.shader_readpixels);this.gl.uniform1i(this.u_vectorValue,0);var packet4Uint8Array=this.enqueueReadBuffer(buffer);for(var n=0,f=packet4Uint8Array.length/4;n<f;n++){var idd=n*4;if(buffer.offset>0)buffer.outArrayFloat32ArrayX[n]=(this.utils.unpack([packet4Uint8Array[idd+0]/255,packet4Uint8Array[idd+1]/255,packet4Uint8Array[idd+2]/255,packet4Uint8Array[idd+3]/255])*(buffer.offset*2))-buffer.offset;else buffer.outArrayFloat32ArrayX[n]=(this.utils.unpack([packet4Uint8Array[idd+0]/255,packet4Uint8Array[idd+1]/255,packet4Uint8Array[idd+2]/255,packet4Uint8Array[idd+3]/255]));}
this.gl.uniform1i(this.u_vectorValue,1);packet4Uint8Array=this.enqueueReadBuffer(buffer);for(var n=0,f=packet4Uint8Array.length/4;n<f;n++){var idd=n*4;if(buffer.offset>0)buffer.outArrayFloat32ArrayY[n]=(this.utils.unpack([packet4Uint8Array[idd+0]/255,packet4Uint8Array[idd+1]/255,packet4Uint8Array[idd+2]/255,packet4Uint8Array[idd+3]/255])*(buffer.offset*2))-buffer.offset;else buffer.outArrayFloat32ArrayY[n]=(this.utils.unpack([packet4Uint8Array[idd+0]/255,packet4Uint8Array[idd+1]/255,packet4Uint8Array[idd+2]/255,packet4Uint8Array[idd+3]/255]));}
this.gl.uniform1i(this.u_vectorValue,2);packet4Uint8Array=this.enqueueReadBuffer(buffer);for(var n=0,f=packet4Uint8Array.length/4;n<f;n++){var idd=n*4;if(buffer.offset>0)buffer.outArrayFloat32ArrayZ[n]=(this.utils.unpack([packet4Uint8Array[idd+0]/255,packet4Uint8Array[idd+1]/255,packet4Uint8Array[idd+2]/255,packet4Uint8Array[idd+3]/255])*(buffer.offset*2))-buffer.offset;else buffer.outArrayFloat32ArrayZ[n]=(this.utils.unpack([packet4Uint8Array[idd+0]/255,packet4Uint8Array[idd+1]/255,packet4Uint8Array[idd+2]/255,packet4Uint8Array[idd+3]/255]));}
this.gl.uniform1i(this.u_vectorValue,3);packet4Uint8Array=this.enqueueReadBuffer(buffer);for(var n=0,f=packet4Uint8Array.length/4;n<f;n++){var idd=n*4;if(buffer.offset>0)buffer.outArrayFloat32ArrayW[n]=(this.utils.unpack([packet4Uint8Array[idd+0]/255,packet4Uint8Array[idd+1]/255,packet4Uint8Array[idd+2]/255,packet4Uint8Array[idd+3]/255])*(buffer.offset*2))-buffer.offset;else buffer.outArrayFloat32ArrayW[n]=(this.utils.unpack([packet4Uint8Array[idd+0]/255,packet4Uint8Array[idd+1]/255,packet4Uint8Array[idd+2]/255,packet4Uint8Array[idd+3]/255]));}
for(var n=0,f=buffer.outArrayFloat32ArrayX.length;n<f;n++){var idd=n*4;buffer.outArray4Float32Array[idd]=buffer.outArrayFloat32ArrayX[n];buffer.outArray4Float32Array[idd+1]=buffer.outArrayFloat32ArrayY[n];buffer.outArray4Float32Array[idd+2]=buffer.outArrayFloat32ArrayZ[n];buffer.outArray4Float32Array[idd+3]=buffer.outArrayFloat32ArrayW[n];}
return buffer.outArray4Float32Array;};