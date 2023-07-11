import vertShaderSrc from './phong.vert.js';
import fragShaderSrc from './phong.frag.js';

import Shader from './shader.js';
import { HalfEdgeDS } from './half-edge.js';

export default class Mesh {
  constructor(delta) {
    // model data structure
    this.heds = new HalfEdgeDS();

    // Matriz de modelagem
    this.angleX = 0;
    this.angleY = 0;
    this.angleZ = 0;
    this.delta = delta;
    this.model = mat4.create();
    this.originRotationMatrix = mat4.create();

    // Shader program
    this.vertShd = null;
    this.fragShd = null;
    this.program = null;

    // Data location
    this.vaoLoc = -1;
    this.indicesLoc = -1;

    this.uModelLoc = -1;
    this.uViewLoc = -1;
    this.uProjectionLoc = -1;
  }

  async loadMeshV4(filename) {
    const resp = await fetch(filename);
    const text = await resp.text();

    const lines = text.split('\n');
    const coords = [];
    const indices = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('v ')) {
        const [_, x, y, z] = line.split(/\s+/);
        coords.push(parseFloat(x), parseFloat(y), parseFloat(z), 1.0);
      } else if (line.startsWith('f ')) {
        const [_, i1, i2, i3] = line.split(/\s+/);
        indices.push(parseInt(i1) - 1, parseInt(i2) - 1, parseInt(i3) - 1);
      }
    }

    console.log(coords, indices);
    this.heds.build(coords, indices);
  }


  createShader(gl) {
    this.vertShd = Shader.createShader(gl, gl.VERTEX_SHADER, vertShaderSrc);
    this.fragShd = Shader.createShader(gl, gl.FRAGMENT_SHADER, fragShaderSrc);
    this.program = Shader.createProgram(gl, this.vertShd, this.fragShd);

    gl.useProgram(this.program);
  }

  createUniforms(gl) {
    this.uModelLoc = gl.getUniformLocation(this.program, "u_model");
    this.uViewLoc = gl.getUniformLocation(this.program, "u_view");
    this.uProjectionLoc = gl.getUniformLocation(this.program, "u_projection");
  }

  createVAO(gl) {
    const vbos = this.heds.getVBOs();
    console.log(vbos);

    var coordsAttributeLocation = gl.getAttribLocation(this.program, "position");
    const coordsBuffer = Shader.createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(vbos[0]));

    var colorsAttributeLocation = gl.getAttribLocation(this.program, "color");
    const colorsBuffer = Shader.createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(vbos[1]));

    var normalsAttributeLocation = gl.getAttribLocation(this.program, "normal");
    const normalsBuffer = Shader.createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(vbos[2]));

    this.vaoLoc = Shader.createVAO(gl,
      coordsAttributeLocation, coordsBuffer,
      colorsAttributeLocation, colorsBuffer,
      normalsAttributeLocation, normalsBuffer);

    this.indicesLoc = Shader.createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(vbos[3]));
  }

  init(gl, light) {
    this.createShader(gl);
    this.createUniforms(gl);
    this.createVAO(gl);

    light.createUniforms(gl, this.program);
  }

  updateModelMatrix(commands) {
    mat4.identity( this.model );
    commands.forEach((cmd) => {
      switch (cmd.type) {
        case 'scale':
          mat4.scale(this.model, this.model, cmd.value);
          break;
        case 'translate':
          mat4.translate(this.model, this.model, cmd.value);
          break;
        case 'rotateX':
          this.angleX += cmd.value;
          mat4.rotateX(this.model, this.model, this.angleX);
          break;
        case 'rotateY':
          this.angleY += cmd.value;
          mat4.rotateY(this.model, this.model, this.angleY);
          break;
        case 'rotateZ':
          this.angleZ += cmd.value;
          mat4.rotateZ(this.model, this.model, this.angleZ);
          break;
        case 'orbitZ':
          mat4.rotateZ(this.originRotationMatrix, this.originRotationMatrix, cmd.value);
          mat4.multiply(this.model, this.originRotationMatrix, this.model);
          break;
      }
    });
  }

  draw(gl, cam, light, commands) {
    // faces orientadas no sentido anti-horário
    gl.frontFace(gl.CCW);

    // face culling
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    gl.useProgram(this.program);

    // updates the model transformations
    this.updateModelMatrix(commands);

    const model = this.model;
    const view = cam.getView();
    const proj = cam.getProj();

    gl.uniformMatrix4fv(this.uModelLoc, false, model);
    gl.uniformMatrix4fv(this.uViewLoc, false, view);
    gl.uniformMatrix4fv(this.uProjectionLoc, false, proj);

    gl.bindVertexArray(this.vaoLoc);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesLoc);

    gl.drawElements(gl.TRIANGLES, this.heds.faces.length * 3, gl.UNSIGNED_INT, 0);

    gl.disable(gl.CULL_FACE);
  }
}