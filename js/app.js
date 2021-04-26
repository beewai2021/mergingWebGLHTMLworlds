import * as THREE from "three"
import * as dat from "dat.gui"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import imagesLoaded from "imagesloaded"
import gsap from "gsap"

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

    this.materials = []

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)

    this.isPlaying = true

    this.clock = new THREE.Clock()

    this.currentScroll = 0

    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()

    const preloadImages = new Promise((resolve, reject) => {
      imagesLoaded(document.querySelectorAll("img"), {}, resolve)
    })

    Promise.all([preloadImages]).then(() => {
      this.resize()
      this.render()
      this.setupResize()
      this.addImages()
      this.setPosition()
      this.mouseMovement()
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

  addImages() {
    this.imageMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uImage: { value: 0 },
        uTime: { value: 0 },
        uHoverState: { value: 0 },
        uHover: { value: new THREE.Vector2(0.5, 0.5) },
      },
      // wireframe: true,
      side: THREE.DoubleSide,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    })

    this.imageStore = this.images.map((img) => {
      let bounds = img.getBoundingClientRect()

      let geometry = new THREE.PlaneBufferGeometry(
        bounds.width,
        bounds.height,
        5,
        5
      )
      let texture = new THREE.Texture(img)
      texture.needsUpdate = true

      let material = this.imageMaterial.clone()
      this.materials.push(material)
      material.uniforms.uImage.value = texture

      let mesh = new THREE.Mesh(geometry, material)

      this.scene.add(mesh)

      img.addEventListener("mouseenter", () => {
        gsap.to(material.uniforms.uHoverState, {
          value: 1,
          duration: 1,
          ease: "expo.out",
        })
      })
      img.addEventListener("mouseout", () => {
        gsap.to(material.uniforms.uHoverState, {
          value: 0,
          duration: 1,
          ease: "expo.out",
        })
      })

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

  mouseMovement() {
    window.addEventListener(
      "mousemove",
      (event) => {
        this.mouse.x = (event.clientX / this.width) * 2 - 1
        this.mouse.y = -(event.clientY / this.height) * 2 + 1

        this.raycaster.setFromCamera(this.mouse, this.camera)

        const intersects = this.raycaster.intersectObjects(this.scene.children)

        if (intersects.length > 0) {
          let obj = intersects[0].object
          obj.material.uniforms.uHover.value = intersects[0].uv
        }
      },
      false
    )
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

    this.materials.forEach((material) => {
      material.uniforms.uTime.value = this.clock.getElapsedTime()
    })

    this.renderer.render(this.scene, this.camera)

    requestAnimationFrame(this.render.bind(this))
  }
}

new Sketch({
  dom: document.getElementById("container"),
})
