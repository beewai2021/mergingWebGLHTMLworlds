import * as THREE from "three"
import * as dat from "dat.gui"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import imagesLoaded from "imagesloaded"

import fragmentShader from "./shader/fragment.glsl"
import vertexShader from "./shader/vertex.glsl"

export default class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene()

    this.container = options.dom

    this.height = this.container.offsetHeight
    this.width = this.container.offsetWidth

    this.renderer = new THREE.WebGLRenderer({ alpha: true })
    this.renderer.setSize(this.width, this.height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    this.container.appendChild(this.renderer.domElement)

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      100,
      900
    )
    this.cameraDistance = 500
    this.camera.position.z = this.cameraDistance
    // fov (vertical) height calculation
    // 1. get half of fov angle
    // 2. get full fov height (by multiplying by 2), and converting into degrees (from radians)
    this.fovAngle = Math.atan(this.height / 2 / this.cameraDistance)
    this.camera.fov = 2 * this.fovAngle * (180 / Math.PI)

    this.images = [...document.querySelectorAll("img")]

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)

    this.isPlaying = true

    this.time = 0

    this.currentScroll = 0

    const preloadImages = new Promise((resolve, reject) => {
      imagesLoaded(document.querySelectorAll("img"), {}, resolve)
    })

    Promise.all([preloadImages]).then(() => {
      this.addObjects()
      this.resize()
      this.render()
      this.setupResize()
      this.addImages()
      this.setPosition()
      // this.settings();

      window.addEventListener("scroll", () => {
        this.currentScroll = window.scrollY
        this.setPosition()
      })
    })
  }

  settings() {
    let that = this
    this.settings = {
      progress: 0,
    }
    this.gui = new dat.GUI()
    this.gui.add(this.settings, "progress", 0, 1, 0.01)
  }

  setupResize() {
    window.addEventListener("resize", this.resize.bind(this))
  }

  resize() {
    this.height = this.container.offsetHeight
    this.width = this.container.offsetWidth

    this.renderer.setSize(this.width, this.height)

    this.camera.aspect = this.width / this.height
    this.camera.updateProjectionMatrix()
  }

  addObjects() {
    let that = this
    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable",
      },
      side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector4() },
      },
      // wireframe: true,
      // transparent: true,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    })

    // this.geometry = new THREE.PlaneGeometry(200, 300, 10, 10)
    // this.plane = new THREE.Mesh(this.geometry, this.material)
    // this.scene.add(this.plane)
  }

  addImages() {
    this.imageStore = this.images.map((img) => {
      let bounds = img.getBoundingClientRect()

      let geometry = new THREE.PlaneBufferGeometry(
        bounds.width,
        bounds.height,
        4,
        4
      )
      let texture = new THREE.Texture(img)
      texture.needsUpdate = true
      let material = new THREE.MeshBasicMaterial({
        map: texture,
      })
      let mesh = new THREE.Mesh(geometry, material)

      this.scene.add(mesh)

      return {
        img: img,
        mesh: mesh,
        top: bounds.top,
        left: bounds.left,
        height: bounds.height,
        width: bounds.width,
      }
    })
  }

  setPosition() {
    this.imageStore.forEach((imgObj) => {
      imgObj.mesh.position.x = imgObj.left - this.width / 2 + imgObj.width / 2
      imgObj.mesh.position.y =
        -imgObj.top + this.height / 2 - imgObj.height / 2 + this.currentScroll
    })
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

  render() {
    if (!this.isPlaying) return

    // this.time += 0.05

    // this.material.uniforms.uTime.value = this.time

    this.renderer.render(this.scene, this.camera)

    requestAnimationFrame(this.render.bind(this))
  }
}

new Sketch({
  dom: document.getElementById("container"),
})
