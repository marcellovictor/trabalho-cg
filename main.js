import Camera from './camera.js';
import Light from './light.js';
import Mesh from './mesh.js';

class Scene {
  constructor(gl) {
    // Camera virtual
    this.cam = new Camera(gl);

    // Luz
    this.light = new Light();

    // Mesh
    this.bunny = new Mesh(0.0);
    this.armadillo = new Mesh(0.1);
  }

  async init(gl) {
    await this.bunny.loadMeshV4('bunny.obj');
    this.bunny.init(gl, this.light);

    await this.armadillo.loadMeshV4('armadillo.obj')
    this.armadillo.init(gl, this.light);
  }

  draw(gl) {  
    this.cam.updateCam();
    this.light.updateLight();

    const bunny_commands = [
      {
        'type': 'scale',
        'value': [0.3, 0.3, 0.3]
      },
      {
        'type': 'rotateY',
        'value': 0.005
      },
    ];

    const armadillo_commands = [
      {
        'type': 'translate',
        'value': [1.0, 0.0, 0.0]
      },
      {
        'type': 'scale',
        'value': [0.1, 0.1, 0.1]
      },
      {
        'type': 'orbitZ',
        'value': 0.01
      },
    ];

    this.bunny.draw(gl, this.cam, this.light, bunny_commands);
    this.armadillo.draw(gl, this.cam, this.light, armadillo_commands);
  }
}

class Main {
  constructor() {
    const canvas = document.querySelector("#glcanvas");

    this.gl = canvas.getContext("webgl2");
    this.setViewport();

    this.scene = new Scene(this.gl);
    this.scene.init(this.gl).then(() => {
      this.draw();
    });
  }

  setViewport() {
    var devicePixelRatio = window.devicePixelRatio || 1;
    this.gl.canvas.width = 1024 * devicePixelRatio;
    this.gl.canvas.height = 768 * devicePixelRatio;

    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
  }

  draw() {
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    this.scene.draw(this.gl);

    requestAnimationFrame(this.draw.bind(this));
  }
}

window.onload = () => {
  const app = new Main();
  app.draw();
}


