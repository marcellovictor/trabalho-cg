export default class Camera {
  constructor(gl) {
    // Posição da camera
    this.eye = vec3.fromValues(1.0, 1.0, 1.0);
    this.at  = vec3.fromValues(0.0, 0.0, 0.0);
    this.up  = vec3.fromValues(0.0, 1.0, 0.0);

    // Parâmetros da projeção
    this.fovy = Math.PI / 2;
    this.aspect = gl.canvas.width / gl.canvas.height;

    this.left = -2.5;
    this.right = 2.5;
    this.top = 2.5;
    this.bottom = -2.5;

    this.near = 0;
    this.far = 5;

    // Matrizes View e Projection
    this.view = mat4.create();
    this.proj = mat4.create();

    // Parâmetros da órbita
    this.radius = 2.0;
    this.theta = 0.0;
    this.phi = 0.0;

  }

  getView() {
    return this.view;
  }

  getProj() {
    return this.proj;
  }

  updateViewMatrix() {
    const eyeX = this.radius * Math.sin(this.phi) * Math.cos(this.theta);
    const eyeY = this.radius * Math.cos(this.phi);
    const eyeZ = this.radius * Math.sin(this.phi) * Math.sin(this.theta);
  
    this.eye = vec3.fromValues(eyeX, eyeY, eyeZ);
  
    mat4.identity(this.view);
    mat4.lookAt(this.view, this.eye, this.at, this.up);
  }  

  updateProjectionMatrix(type = '') {
    mat4.identity( this.proj );

    if (type === 'ortho') {
      mat4.ortho(this.proj, this.left * 1024/768, this.right * 1024/768, this.bottom , this.top, this.near, this.far);
    } else {
      mat4.perspective(this.proj, this.fovy, this.aspect, this.near, this.far);
    }
  }

  updateCam() {
    this.theta += 0.01;
    this.phi = Math.PI / 4; // Define um angulo fixo para phi (45 graus ou PI/4 radianos)    

    this.updateViewMatrix();
    this.updateProjectionMatrix();
  }
}