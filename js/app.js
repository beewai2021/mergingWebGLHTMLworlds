import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as dat from "dat.gui"
// import gsap from "gsap"

import vertexShader from "./shader/vertex.glsl"
import fragmentShader from "./shader/fragment.glsl"
import oceanTexture from "../img/ocean.jpg"

export default class Sketch {
  constructor(props) {
    this.scene = new THREE.Scene()

    this.container = props.canvasContainer

    this.width = this.container.offsetWidth
    this.height = this.container.offsetHeight

    this.renderer = new THREE.WebGLRenderer()
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(this.width, this.height)
    // this.renderer.setClearColor(0xeeeeee, 1)

    this.container.appendChild(this.renderer.domElement)

    this.time = 0

    this.camera = new THREE.PerspectiveCamera(
      70,
      this.width / this.height,
      0.001,
      1000
    )

    // var frustumSize = 10;
    // var aspect = window.innerWidth / window.innerHeight;
    // this.camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, -1000, 1000 );

    this.camera.position.set(0, 0, 2)

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)

    this.isPlaying = true

    // setup scene
    this.addObjects()
    this.resize()
    this.setupResize()
    // this.settings();
    this.render()
  }

  addObjects() {
    let that = this

    // this.geometry = new THREE.PlaneBufferGeometry(1, 1, 40, 40)
    this.geometry = new THREE.SphereBufferGeometry(1, 10, 10)
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector4() },
        uOceanTexture: { value: new THREE.TextureLoader().load(oceanTexture) },
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      // extensions: {
      //   derivatives: "#extension GL_OES_standard_derivatives : enable",
      // },
      side: THREE.DoubleSide,
      // wireframe: true,
      transparent: false,
    })
    this.plane = new THREE.Mesh(this.geometry, this.material)

    this.scene.add(this.plane)
  }

  resize() {
    this.height = this.container.offsetHeight
    this.width = this.container.offsetWidth

    this.renderer.setSize(this.width, this.height)

    this.camera.aspect = this.width / this.height
    this.camera.updateProjectionMatrix()
  }

  setupResize() {
    window.addEventListener("resize", this.resize.bind(this))
  }

  play() {
    if (!this.isPlaying) {
      this.render()
      this.isPlaying = true
    }
  }

  stop() {
    this.isPlaying = false
  }

  settings() {
    let that = this

    this.settings = {
      progress: 0,
    }

    this.gui = new dat.GUI()
    this.gui.add(this.settings, "progress", 0, 1, 0.01)
  }

  render() {
    if (!this.isPlaying) return

    this.time += 0.05

    this.material.uniforms.uTime.value = this.time

    this.renderer.render(this.scene, this.camera)

    requestAnimationFrame(this.render.bind(this))
  }
}

new Sketch({
  canvasContainer: document.getElementById("container"),
})
