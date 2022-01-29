<template>
  <div class="fixed w-full h-full top-0 left-0">
    <div ref="container" class="w-full h-full"></div>
    <div
      class="
        absolute
        top-0
        right-0
        bg-blue-900 bg-opacity-80
        text-white
        p-5
        py-6
      "
    >
      <label
        for="file"
        class="p-3 cursor-pointer border-2 rounded-lg border-white bg-blue-400"
        >ファイルを選択してください</label
      >
      <input type="file" id="file" class="hidden" @input="onFileInput" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import {
  AmbientLight,
  AnimationMixer,
  Color,
  GridHelper,
  VectorKeyframeTrack,
  Mesh,
  PerspectiveCamera,
  PointLight,
  Scene,
  SphereGeometry,
  Vector3,
  WebGLRenderer,
  AnimationClip,
  MeshLambertMaterial,
  Clock,
  LoopOnce,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import loader from "@/lib/FileLoader";
import {
  GRID_SIZE,
  BG_COLOR,
  LIGHT_POSITION,
  LIGHT_COLOR,
  INITIAL_CAMERA_POSITION,
  INITIAL_CAMERA_LOOK,
  AMBIENT_LIGHT_COLOR,
  SPHERE_RADIUS,
  SPHERE_SEGMENTS,
  ANIMATION_DURATION,
} from "@/lib/constants";

export default defineComponent({
  setup() {
    // 描画するDOMの指定
    const container = ref();
    // Three.js
    const scene = new Scene();
    const camera = new PerspectiveCamera();
    const renderer = new WebGLRenderer();
    const light = new PointLight();
    const ambientLight = new AmbientLight(AMBIENT_LIGHT_COLOR);
    const controls = new OrbitControls(camera, renderer.domElement);
    // 初期化
    const init = () => {
      if (container.value instanceof HTMLElement) {
        // DOMのサイズを取得
        const { clientWidth, clientHeight } = container.value;
        // 背景のグリッドの追加
        scene.add(new GridHelper(GRID_SIZE));
        scene.background = new Color(BG_COLOR);
        // ライトの設定
        light.color.setHex(LIGHT_COLOR);
        light.position.set(
          LIGHT_POSITION.x,
          LIGHT_POSITION.y,
          LIGHT_POSITION.z
        );
        scene.add(light);
        scene.add(ambientLight);
        // カメラの設定
        camera.aspect = clientWidth / clientHeight;
        camera.updateProjectionMatrix();
        camera.position.set(
          INITIAL_CAMERA_POSITION.x,
          INITIAL_CAMERA_POSITION.y,
          INITIAL_CAMERA_POSITION.z
        );
        camera.lookAt(INITIAL_CAMERA_LOOK);
        // rendererの設定
        renderer.setSize(clientWidth, clientHeight);
        renderer.setPixelRatio(clientWidth / clientHeight);
        container.value.appendChild(renderer.domElement);
        // OrbitControlsの右クリックイベントリスナーを無効化
        controls.enablePan = false;
        // イベントハンドラーの設定
        container.value.addEventListener("contextmenu", onContextMenu);
        // 描画
        animate();
      }
    };

    // 描画
    const animate = (callback?: () => void) => {
      const frame = () => {
        // カメラの視点変更
        controls.update();
        // コールバック関数を実行
        if (callback) callback();
        // 描画
        renderer.render(scene, camera);
        // 画面を更新
        requestAnimationFrame(frame);
      };
      frame();
    };

    // マウント時に初期化して描画
    onMounted(() => {
      init();
    });

    // Sphereの作成
    const createSphere = (): Mesh => {
      const geometry = new SphereGeometry(
        SPHERE_RADIUS,
        SPHERE_SEGMENTS.width,
        SPHERE_SEGMENTS.height
      );
      const material = new MeshLambertMaterial();
      return new Mesh(geometry, material);
    };

    // ファイル入力時のハンドラー
    const onFileInput = async ({ target }: Event) => {
      if (target instanceof HTMLInputElement && target.files) {
        // ファイル入力
        const file = target.files[0];
        const group = await loader(file);
        if (group) {
          // Sceneに追加
          scene.add(group);
        }
      }
    };

    // 右クリック時のハンドラー
    const onContextMenu = ({ clientX, clientY }: MouseEvent) => {
      if (container.value instanceof HTMLElement) {
        // 画面平面内の位置座標を取得
        const { clientWidth, clientHeight } = container.value;
        const relativeX = (clientWidth / 2 - clientX) / clientWidth;
        const relativeY = (clientHeight / 2 - clientY) / clientHeight;
        // 投げつけるオブジェクトを生成
        const ball = createSphere();
        scene.add(ball);
        // オブジェクトを初期位置に配置
        setObjectInitialPosition(ball.position, { relativeX, relativeY });
        // アニメーションを作成して起動
        moveObject(ball);
      }
    };

    // 投げつけるオブジェクトの初期値を設定
    const setObjectInitialPosition = (
      position: Vector3,
      { relativeX, relativeY }: { relativeX: number; relativeY: number }
    ) => {
      // カメラが向く方向ベクトルを取得
      const forward = new Vector3();
      camera.getWorldDirection(forward);
      forward.normalize();
      // カメラからの相対方向ベクトルを取得
      const { up } = camera; // カメラから見て上方向
      const left = up.clone().cross(forward); // カメラから見て左方向
      // 目的の位置へのカメラからの相対位置を計算
      left.multiplyScalar(relativeX * camera.getFilmWidth()); // 画面左方向
      const top = up.clone().multiplyScalar(relativeY * camera.getFilmHeight()); // 画面上方向
      forward // 画面正面方向
        .multiplyScalar(camera.near); // カメラの視錐台まで前進させる
      // 位置を設定
      position.copy(camera.position).add(left).add(top).add(forward);
    };

    // アニメーションの作成と起動
    const moveObject = (object: Mesh) => {
      // アニメーションの始点と終点を計算
      const startPosition = object.position; // 始点
      const { x, y, z } = startPosition;
      const endPosition = new Vector3(); // 終点
      camera.getWorldDirection(endPosition);
      endPosition.multiplyScalar(camera.far).add(startPosition); // カメラの向く方向に距離100だけ増加
      // Keyframeを作成
      const positionKF = new VectorKeyframeTrack(
        ".position",
        [0, ANIMATION_DURATION],
        [x, y, z, endPosition.x, endPosition.y, endPosition.z]
      );
      // Clipを作成
      const moveObjectClip = new AnimationClip(`move-object-${object.id}`, -1, [
        positionKF,
      ]);
      // Mixerを定義
      const mixer = new AnimationMixer(object);
      mixer.addEventListener("finished", () => {
        // 終了時にオブジェクトを削除
        scene.remove(object);
        object.geometry.dispose();
      });
      // Actionを定義
      const action = mixer.clipAction(moveObjectClip);
      action.setLoop(LoopOnce, 0);
      // Actionの実行
      action.play();
      // アニメーションを更新
      const clock = new Clock();
      animate(() => mixer.update(clock.getDelta()));
    };

    return {
      container,
      onFileInput,
    };
  },
});
</script>
