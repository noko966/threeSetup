function vertexShader() {
  return `
  varying vec2 vUv;
  uniform vec2 u_size;
  uniform vec2 u_resolution;

  void main() {
    vUv = position.xy; 
    float scalex,scaley;
    scalex = u_size.x / (u_resolution.x);
    scaley = u_size.y / (u_resolution.y);
    vUv.x = vUv.x / scalex;
    vUv.y = vUv.y / scaley;
    gl_Position = vec4(position,1);
  }
  `;
}

function fragmentShader() {
  // vec4(1.0,0.0,0.0,1.0);
  return `
  varying vec2 vUv;
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform sampler2D texture;
  
  void main() {
    float distort = sin(vUv.y * 100. + u_time * 0.05) * 0.05;
    vec4 color = texture2D(texture, vec2(vUv.x + distort, vUv.y));
    gl_FragColor = vec4(color.rgb, 1.0);
  }
  `;
}

var camera, scene, renderer;
var geometry,
  material,
  mesh,
  controls,
  light,
  axesHelper,
  mouse,
  composer,
  hblur,
  uniforms,
  map,
  material,
  fgMaterial,
  plane;
var w, h;

init();
animate();

function createPlane(material) {
  var geometry = new THREE.PlaneBufferGeometry(1, 1);
  plane = new THREE.Mesh(geometry, material);
  scene.add(plane);
}

function init() {
  map = new THREE.TextureLoader().load("../img/mash_alpha.png");
  material = new THREE.TextureLoader().load("../img/mash.png");

  fgMaterial = new THREE.TextureLoader().load("../img/grid.jpg", function(
    texture
  ) {
    uniforms.u_size.value.x = texture.image.width;
    uniforms.u_size.value.y = texture.image.height;
    uniforms.texture.value = texture;
  });

  uniforms = {
    u_time: { value: 0 },
    u_resolution: { value: new THREE.Vector2() },
    texture: { value: null },
    u_size: {
      type: "v2",
      value: new THREE.Vector2(null, null)
    }
  };

  let shaderMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertexShader(),
    fragmentShader: fragmentShader()
  });

  w = window.innerWidth;
  h = window.innerHeight;

  uniforms.u_resolution.value.x = w;
  uniforms.u_resolution.value.y = h;

  camera = new THREE.PerspectiveCamera(75, w / h, 0.01, 500);
  scene = new THREE.Scene();

  var loader = new THREE.GLTFLoader();

  var newMaterial = new THREE.MeshStandardMaterial({
    map: material,
    alphaMap: map,
    transparent: true
  });

  createPlane(shaderMaterial);

  // Load a glTF resource
  loader.load("../models/Mash.gltf", function(gltf) {
    gltf.scene.traverse(object => {
      if (object.isMesh) {
        object.material = newMaterial;
        object.position.set(0, 0, 0);
      }
    });

    // scene.add(gltf.scene);
  });

  light = new THREE.AmbientLight(0x404040, 5);
  scene.add(light);
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(w, h);
  document.body.appendChild(renderer.domElement);
  scene.background = new THREE.Color(0x000);
  var axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);
  mouse = new Mouse(renderer.domElement);

  resize();
}

function animate() {
  uniforms.u_time.value += 0.5;

  window.requestAnimationFrame(animate);
  let normalX = 2 * (mouse.x / w) - 1;
  let normalY = 2 * (mouse.y / h) - 1;
  // camera.position.y = -normalY + 0.5;
  // camera.position.x = normalX;
  // camera.position.z = 1;
  // camera.lookAt(0, 0, 0);
  renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
  resize();
});

function resize() {
  uniforms.u_resolution.value.x = w;
  uniforms.u_resolution.value.y = h;

  uniforms.u_resolution.value.x = w;
  w = window.innerWidth;
  h = window.innerHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;

  let dist = camera.position.x - plane.position.z;
  let height = 1;
  camera.fow = 2 * (180 / Math.PI) * Math.atan(height / (2 * dist));
  if (w / h > 1) {
    plane.scale.x = w / h;
  }

  camera.updateProjectionMatrix();
}
