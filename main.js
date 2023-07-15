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
    this.bunnyStar = null;
    this.armadillo = new Mesh(0.0);
    this.armadilloStar = null;
    this.isBunnyStarSelected = false;
    this.isArmadilloStarSelected = false;
  }

  async init(gl) {
    await this.bunny.loadMeshV4('bunny.obj');
    this.bunny.init(gl, this.light);

    await this.armadillo.loadMeshV4('armadillo.obj')
    this.armadillo.init(gl, this.light);
  }

  draw(gl) {
    this.cam.updateCam();

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

    this.bunny.draw(gl, this.cam, bunny_commands);
    this.armadillo.draw(gl, this.cam, armadillo_commands);

    if (this.isBunnyStarSelected) {
      this.bunnyStar.draw(gl, this.cam, bunny_commands);
    }
    if (this.isArmadilloStarSelected) {
      this.armadilloStar.draw(gl, this.cam, armadillo_commands);
    }

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

    // Atualiza a posição da luz branca de acordo com a posição da cam
    this.scene.light.pos = vec4.fromValues(this.scene.cam.eye[0], this.scene.cam.eye[1], this.scene.cam.eye[2], 1.0);

    this.scene.draw(this.gl);

    requestAnimationFrame(this.draw.bind(this));
  }
}

const app = new Main();
const bunny = app.scene.bunny;
const armadillo = app.scene.armadillo;

window.onload = () => {
  app.draw();
}

function processarVertexBunny() {
  var valorInput = document.getElementById("bunny").value;

  if (valorInput) {
    console.log("O valor do campo de entrada é: " + valorInput);
    this.isBunnyStarSelected = true;
    let faces = bunny.selectFaces(valorInput);
    this.bunnyStar = new Mesh(0.0);
    this.bunnyStar.clone(faces);
  }
  else {
    this.isBunnyStarSelected = false;
  }
}

function processarVertexArmadillo() {
  var valorInput = document.getElementById("armadillo").value;

  if (valorInput) {
    console.log("O valor do campo de entrada é: " + valorInput);
    this.isArmadilloStarSelected = true;
    let faces = armadillo.selectFaces(valorInput);
    this.armadilloStar = new Mesh(0.0);
    this.armadilloStar.clone(faces);
  }
  else {
    this.isArmadilloStarSelected = false;
  }
}

document.getElementById("btnBunny").addEventListener("click", processarVertexBunny);
document.getElementById("btnArmadillo").addEventListener("click", processarVertexArmadillo);
