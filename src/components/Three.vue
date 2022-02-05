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
      <input
        type="file"
        id="file"
        class="hidden"
        @input="onFileInput($event, scene, objects)"
      />
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
  Mesh,
  PerspectiveCamera,
  PointLight,
  Scene,
  Vector3,
  WebGLRenderer,
  AnimationClip,
  Clock,
  LoopOnce,
  Object3D,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import {
  GRID_SIZE,
  BG_COLOR,
  LIGHT_POSITION,
  LIGHT_COLOR,
  INITIAL_CAMERA_POSITION,
  INITIAL_CAMERA_LOOK,
  AMBIENT_LIGHT_COLOR,
  ANIMATION_DURATION,
} from "@/lib/constants";
import { onContextMenu, onFileInput } from "@/lib/handlers";
import { getPositionKeyframe } from "@/lib/animation";

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
    const objects: Object3D[] = [];

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
        container.value.addEventListener(
          "contextmenu",
          onContextMenu.bind({
            container: container.value,
            scene,
            camera,
            callback: moveObject,
          })
        );
        // イベントハンドラーの設定
        window.addEventListener("resize", onResize);
        // 描画
        animate();
      }
    };

    // 画面リサイズ時のハンドラー
    const onResize = () => {
      if (container.value instanceof HTMLElement) {
        // サイズの取得
        const { clientWidth, clientHeight } = container.value;
        // カメラのアスペクト比を更新
        camera.aspect = clientWidth / clientHeight;
        camera.updateProjectionMatrix();
        // Rendererのサイズ調整
        renderer.setSize(clientWidth, clientHeight);
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

    // アニメーションの作成と起動
    const moveObject = (object: Mesh): void => {
      // アニメーションの始点と終点を計算
      const startPosition = object.position; // 始点
      const endPosition = new Vector3(); // 終点
      camera.getWorldDirection(endPosition);
      // カメラの向く方向にカメラの描画距離だけ増加
      endPosition.multiplyScalar(camera.far).add(startPosition);
      // Keyframeを作成
      const positionKF = getPositionKeyframe(
        startPosition,
        endPosition,
        ANIMATION_DURATION,
        objects
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
      scene,
      onFileInput,
      objects,
    };
  },
});
</script>
