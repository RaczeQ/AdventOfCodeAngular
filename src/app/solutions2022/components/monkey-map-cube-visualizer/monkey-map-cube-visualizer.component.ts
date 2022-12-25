import { Component, OnInit } from '@angular/core';
import { BaseResultComponent } from 'src/app/helper/components/base-result.component';
import { ScriptsLoaderService } from 'src/app/helper/services/scripts-loader.service';
import { points2DEqual } from 'src/app/helper/util-functions/point';
import { Tile } from '../../day22.service';

declare let THREE: any;

const SMALL_CUBE_FACES = [
  { x: [12, 15], y: [8, 11], rot: 3 }, // right side
  { x: [4, 7], y: [4, 7], rot: 0 }, // left side
  { x: [8, 11], y: [0, 3], rot: 0 }, // top side
  { x: [8, 11], y: [8, 11], rot: 0 }, // bottom side
  { x: [8, 11], y: [4, 7], rot: 0 }, // front side
  { x: [0, 3], y: [4, 7], rot: 0 }, // back side
];

const BIG_CUBE_FACES = [
  { x: [100, 149], y: [0, 49], rot: 1 }, // right side
  { x: [0, 49], y: [100, 149], rot: 1 }, // left side
  { x: [50, 99], y: [0, 49], rot: 0 }, // top side
  { x: [50, 99], y: [100, 149], rot: 0 }, // bottom side
  { x: [50, 99], y: [50, 99], rot: 0 }, // front side
  { x: [0, 49], y: [150, 199], rot: 1 }, // back side
];

@Component({
  selector: 'aoc-monkey-map-cube-visualizer',
  templateUrl: './monkey-map-cube-visualizer.component.html',
  styleUrls: ['./monkey-map-cube-visualizer.component.scss'],
})
export class MonkeyMapCubeVisualizerComponent
  extends BaseResultComponent
  implements OnInit
{
  sceneId!: string;
  camera: any;
  controls: any;
  scene: any;
  renderer: any;
  mesh: any;
  map!: Tile[];
  moves!: { tile: Tile; facing: number }[];
  scale: number = 4;
  constructor(private scripts: ScriptsLoaderService) {
    super();
    this.sceneId = (Math.random() + 1).toString(36).substring(2);
  }
  ngOnInit(): void {
    this.map = this.data.map as Tile[];
    this.moves = this.data.executedMoves as { tile: Tile; facing: number }[];
    var maxY = Math.max(...this.map.map((tile) => tile.y));
    if (maxY > 16) {
      this.scale = 50;
    }
    this.scripts
      .loadScript(
        'ThreeJs',
        'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
      )
      .then(async () => {
        await this.renderCube();
      });
  }

  renderFace(xRange: number[], yRange: number[], rotation: number): string {
    var canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    var textureSize = 1000;
    const magnifier = textureSize / this.scale;
    canvas.width = textureSize;
    canvas.height = textureSize;
    yRange.forEach((y, yIdx) =>
      xRange.forEach((x, xIdx) => {
        var matchingTile = this.map.find((tile) =>
          points2DEqual(tile, { x, y })
        )!;
        ctx!.fillStyle = matchingTile.isWall
          ? '#000'
          : 'rgba(255,255,255,0.25)';
        ctx!.fillRect(xIdx * magnifier, yIdx * magnifier, magnifier, magnifier);
        var pathMove = this.moves.find((move) =>
          points2DEqual(move.tile, { x, y })
        );
        if (pathMove !== undefined) {
          if (pathMove === this.moves[0]) {
            ctx!.fillStyle = '#2cfa3a';
            ctx!.fillRect(
              xIdx * magnifier + magnifier * 0.2,
              yIdx * magnifier + magnifier * 0.2,
              magnifier * 0.6,
              magnifier * 0.6
            );
          } else if (pathMove === this.moves[this.moves.length - 1]) {
            ctx!.fillStyle = '#fa2c2c';
            ctx!.fillRect(
              xIdx * magnifier + magnifier * 0.2,
              yIdx * magnifier + magnifier * 0.2,
              magnifier * 0.6,
              magnifier * 0.6
            );
          } else {
            ctx!.fillStyle = '#fad02c';
            ctx!.fillRect(
              xIdx * magnifier + magnifier * 0.25,
              yIdx * magnifier + magnifier * 0.25,
              magnifier * 0.5,
              magnifier * 0.5
            );
          }
          if (pathMove === this.moves[0]) {
            ctx!.fillStyle = '#2cfa3a';
            ctx!.fillRect(
              xIdx * magnifier + magnifier * 0.2,
              yIdx * magnifier + magnifier * 0.2,
              magnifier * 0.6,
              magnifier * 0.6
            );
          } else if (pathMove === this.moves[this.moves.length - 1]) {
            ctx!.fillStyle = '#fa2c2c';
            ctx!.fillRect(
              xIdx * magnifier + magnifier * 0.2,
              yIdx * magnifier + magnifier * 0.2,
              magnifier * 0.6,
              magnifier * 0.6
            );
          }
        }
      })
    );

    for (let index = 0; index < rotation; index++) {
      ctx!.save();
      // prep canvas for rotation
      ctx!.translate(textureSize / 2, textureSize / 2); // translate to canvas center
      ctx!.rotate(Math.PI * 0.5); // add rotation transform
      ctx!.globalCompositeOperation = 'copy'; // set comp. mode to "copy"
      ctx!.drawImage(
        ctx!.canvas,
        0,
        0,
        textureSize,
        textureSize,
        -textureSize / 2,
        -textureSize / 2,
        textureSize,
        textureSize
      );
      ctx!.restore();
    }
    const data = canvas.toDataURL();
    return data;
  }

  async renderCube() {
    await this.init();
    this.animate();
  }

  async init() {
    var OC = await import('./orbit-controls');
    const container = document.getElementById(this.sceneId)!;

    this.camera = new THREE.PerspectiveCamera(
      70,
      container.clientWidth / container.clientHeight,
      1,
      1000
    );
    this.camera.position.z = 400;

    this.scene = new THREE.Scene();

    this.scene.add(new THREE.AmbientLight(0x555555));

    const loader = new THREE.TextureLoader();

    var cubeFaces = this.scale == 50 ? BIG_CUBE_FACES : SMALL_CUBE_FACES;

    const cubeMaterials = cubeFaces.map(
      (face) =>
        new THREE.MeshBasicMaterial({
          map: loader.load(
            this.renderFace(
              Array.range(face.x[0], face.x[1] + 1),
              Array.range(face.y[0], face.y[1] + 1),
              face.rot
            )
          ),
          transparent: true,
          // side: THREE.DoubleSide,
        })
    );

    const geometry = new THREE.BoxGeometry(200, 200, 200);

    this.mesh = new THREE.Mesh(geometry, cubeMaterials);
    this.mesh.rotation.x += 70;
    this.mesh.rotation.y += 60;
    this.scene.add(this.mesh);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setClearColor(0x000000, 0);

    this.controls = new OC.OrbitControls(this.camera, this.renderer.domElement);

    container.appendChild(this.renderer.domElement);

    window.addEventListener('resize', this.onWindowResize);
  }

  onWindowResize() {
    const container = document.getElementById(this.sceneId)!;

    this.camera.aspect = container.clientWidth / container.clientHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(container.clientWidth, container.clientHeight);
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    this.controls.update();

    this.renderer.render(this.scene, this.camera);
  }
}
