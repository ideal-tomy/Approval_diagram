/** @typedef {readonly [number, number, number]} Camera */
/** @typedef {"match" | "hold" | "approval" | "standard"} DeviceId */

/** @type {{ title: string; caption: string; duration: number; camera: Camera; stars: readonly DeviceId[] }[]} */
export const scenes = [
  {
    title: "照合を開く",
    caption: "図面と証明書を並べて、差分を3つに分けます。",
    duration: 5500,
    camera: [284, 175, 1.15],
    stars: ["match"],
  },
  {
    title: "保留へ",
    caption: "一致した項目は下り、人が見るものだけが残ります。",
    duration: 4500,
    camera: [556, 175, 0.9],
    stars: ["match", "hold"],
  },
  {
    title: "保留理由",
    caption: "材質記号とロット番号が、保留に並びます。",
    duration: 5500,
    camera: [828, 175, 1.12],
    stars: ["hold"],
  },
  {
    title: "承認へ",
    caption: "確認した根拠を、承認記録へ残します。",
    duration: 4500,
    camera: [1100, 175, 0.9],
    stars: ["hold", "approval"],
  },
  {
    title: "承認記録",
    caption: "何を見て承認したかが、後から追えます。",
    duration: 5500,
    camera: [1372, 175, 1.12],
    stars: ["approval"],
  },
  {
    title: "基準へ",
    caption: "見つかった不足は、検査基準へ戻します。",
    duration: 4500,
    camera: [1644, 175, 0.9],
    stars: ["approval", "standard"],
  },
  {
    title: "基準改定",
    caption: "ロット番号を必須にして、同じ漏れを防ぎます。",
    duration: 5500,
    camera: [1916, 175, 1.12],
    stars: ["standard"],
  },
];

export const totalDuration = scenes.reduce((sum, scene) => sum + scene.duration, 0);

/**
 * @param {number} time
 */
export function storyFrame(time) {
  let elapsed = ((time % totalDuration) + totalDuration) % totalDuration;
  let index = 0;
  while (index < scenes.length - 1 && elapsed >= scenes[index].duration) {
    elapsed -= scenes[index++].duration;
  }
  const previous = scenes[index === 0 ? 0 : index - 1];
  const next = scenes[index];
  const t = Math.min(1, elapsed / 1200);
  const ease = t * t * (3 - 2 * t);
  const camera = /** @type {Camera} */ (
    next.camera.map((value, i) => previous.camera[i] + (value - previous.camera[i]) * ease)
  );
  return {
    index,
    elapsed,
    camera,
    stars: next.stars,
    previousStars: previous.stars,
    ease,
  };
}
