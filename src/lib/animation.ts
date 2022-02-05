import { Object3D, Raycaster, Vector3, VectorKeyframeTrack } from "three";

// Keyframeの作成
export const getPositionKeyframe = (
  startPosition: Vector3,
  endPosition: Vector3,
  duration: number,
  objects: Object3D[]
): VectorKeyframeTrack => {
  // スケジュール
  const times = [0];
  // 初期位置
  const { x, y, z } = startPosition;
  const values = [x, y, z];
  // 始点と終点から方向ベクトルを算出
  const direction = endPosition
    .clone()
    .add(startPosition.clone().multiplyScalar(-1))
    .normalize();
  // Raycasterの生成
  const raycaster = new Raycaster();
  raycaster.set(startPosition, direction);
  // Raycasterとオブジェクトの交点を探す
  const intersects = raycaster.intersectObjects(objects, true);
  if (intersects.length > 0) {
    // 初期位置からの距離から交点位置を計算
    const intersect = intersects[0];
    const { distance } = intersect;
    const intersectPosition = startPosition
      .clone()
      .add(direction.multiplyScalar(distance));
    // 位置を設定
    const { x, y, z } = intersectPosition;
    values.splice(values.length, 0, x, y, z, x, y, z);
    // スケジュールを追加
    const rate = distance / startPosition.distanceTo(endPosition);
    times.push(duration * rate);
  } else {
    // 交点がなかった場合は直進
    const { x, y, z } = endPosition;
    values.splice(values.length, 0, x, y, z);
  }
  // 終了時刻を設定
  times.push(duration);
  return new VectorKeyframeTrack(".position", times, values);
};
