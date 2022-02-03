import { createSphere, setObjectInitialPosition } from "./createObjects";
import { PerspectiveCamera, Scene, Mesh } from "three";
import loader from "@/lib/fileLoader";

// ファイル入力時のハンドラー
export const onFileInput = async (
  { target }: Event,
  scene: Scene
): Promise<void> => {
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
export function onContextMenu(
  this: {
    container?: HTMLElement;
    scene: Scene;
    camera: PerspectiveCamera;
    callback: (object: Mesh) => void;
  },
  { clientX, clientY }: MouseEvent
): void {
  if (this.container instanceof HTMLElement) {
    // 画面平面内の位置座標を取得
    const { clientWidth, clientHeight } = this.container;
    const relativeX = (clientWidth / 2 - clientX) / clientWidth;
    const relativeY = (clientHeight / 2 - clientY) / clientHeight;
    // 投げつけるオブジェクトを生成
    const ball = createSphere();
    this.scene.add(ball);
    // オブジェクトを初期位置に配置
    setObjectInitialPosition(
      ball.position,
      { relativeX, relativeY },
      this.camera
    );
    // アニメーションを作成して起動
    this.callback(ball);
  }
}
