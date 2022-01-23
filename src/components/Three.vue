<template>
  <div ref="container" class="fixed w-full h-full top-0 left-0">
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
  Color,
  FileLoader,
  GridHelper,
  PerspectiveCamera,
  PointLight,
  Scene,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import loader from "@/lib/FileLoader";

export default defineComponent({
  setup() {
    // 描画するDOMの指定
    const container = ref();
    // Three.js
    const scene = new Scene();
    const camera = new PerspectiveCamera();
    const renderer = new WebGLRenderer();
    const light = new PointLight();
    const controls = new OrbitControls(camera, renderer.domElement);
    // 初期化
    const init = () => {
      if (container.value instanceof HTMLElement) {
        // DOMのサイズを取得
        const { clientWidth, clientHeight } = container.value;
        // 背景のグリッドの追加
        scene.add(new GridHelper(50));
        scene.background = new Color(0xcccccc);
        // ライトの設定
        light.color.setHex(0xffffff);
        light.position.set(10, 10, 0);
        scene.add(light);
        // カメラの設定
        camera.aspect = clientWidth / clientHeight;
        camera.updateProjectionMatrix();
        camera.position.set(10, 10, 0);
        camera.lookAt(0, 0, 0);
        // rendererの設定
        renderer.setSize(clientWidth, clientHeight);
        renderer.setPixelRatio(clientWidth / clientHeight);
        container.value.appendChild(renderer.domElement);
        // 描画
        animate();
      }
    };
    // 描画
    const animate = () => {
      const frame = () => {
        // カメラの視点変更
        controls.update();
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

    return {
      container,
      onFileInput,
    };
  },
});
</script>
