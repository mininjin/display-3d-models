import { SPHERE_RADIUS, SPHERE_SEGMENTS } from "./constants";
import {
  Mesh,
  MeshLambertMaterial,
  PerspectiveCamera,
  SphereGeometry,
  Vector3,
} from "three";

// Sphereの作成
export const createSphere = (): Mesh => {
  const geometry = new SphereGeometry(
    SPHERE_RADIUS,
    SPHERE_SEGMENTS.width,
    SPHERE_SEGMENTS.height
  );
  const material = new MeshLambertMaterial();
  return new Mesh(geometry, material);
};

// 投げつけるオブジェクトの初期値を設定
export const setObjectInitialPosition = (
  position: Vector3,
  { relativeX, relativeY }: { relativeX: number; relativeY: number },
  camera: PerspectiveCamera
): void => {
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
