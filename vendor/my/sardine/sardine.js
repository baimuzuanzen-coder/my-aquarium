/**
 * 群れ専用オリジナルモデル「カタクチイワシ（Engraulis japonicus）」
 * three.js ES モジュール
 *
 * ―― 実物基準・座標系 ――
 * - 種名：カタクチイワシ（Engraulis japonicus）
 * - 体長：0.120m（12cm、options.length で変更可、比率維持）
 * - 体高：体長の約 0.16（0.0192m、腹側膨らみ 0.92 倍）、体幅：体長の約 0.11（0.0132m）
 * - 座標系：前方向 = +X、上 = +Y、左右 = ±Z（右手系 +Z が右側面）、原点 = 体中心
 * - 構造：28個の楕円（卵形扁平）断面リング（1リング 18点）による自作 BufferGeometry
 *   ＋ Shape/ExtrudeGeometry による薄い各鰭（尾鰭・背鰭・胸鰭左右・腹鰭左右・臀鰭）＋光沢ある両目
 */

import * as THREE from 'three';

const BASE_LENGTH = 0.12;
const SNOUT_X = BASE_LENGTH * 0.5; // +0.0600m
const SEG_AROUND = 18; // 1リング 18点（要件：12点以上）

/**
 * 断面リング数値表（28リング：要件 24 以上）
 * s: 鼻先(0.0)からの体長比 [0..1]
 * x = (0.5 - s) * BASE_LENGTH
 * cy: 上下オフセット (m)
 * ry: 半高さ (m) — 常に ry > rz（左右に扁平な楕円）
 * rz: 半幅 (m)
 *
 * 輪郭設計：
 * - 鼻先(s=0)から口元（下向き気味）→ 頭部 → 最大(s=0.35, 全高基準0.16L=0.0192m, 全幅0.11L=0.0132m)
 * - → 尾柄最細部(s=0.805〜0.825, 全高0.050L=0.0060m 維持) → 尾鰭付け根(s=0.84〜0.858)
 */
const BODY_RINGS = [
  { s: 0.005, cy:  0.0006, ry: 0.0012, rz: 0.0009 }, // 01: 吻端直後
  { s: 0.014, cy:  0.0004, ry: 0.0023, rz: 0.0017 }, // 02: 上顎先端部
  { s: 0.028, cy:  0.0002, ry: 0.0036, rz: 0.0026 }, // 03: 吻部（下顎側をスリムに）
  { s: 0.048, cy:  0.0000, ry: 0.0048, rz: 0.0034 }, // 04: 口裂前半
  { s: 0.072, cy: -0.0001, ry: 0.0059, rz: 0.0041 }, // 05: 眼前縁
  { s: 0.100, cy: -0.0002, ry: 0.0068, rz: 0.0046 }, // 06: 目の中心付近
  { s: 0.135, cy: -0.0002, ry: 0.0076, rz: 0.0052 }, // 07: 頬・眼後方
  { s: 0.175, cy: -0.0002, ry: 0.0083, rz: 0.0057 }, // 08: 鰓蓋中央
  { s: 0.215, cy: -0.0002, ry: 0.0088, rz: 0.0061 }, // 09: 鰓蓋後端（胸鰭付け根）
  { s: 0.255, cy: -0.0002, ry: 0.0092, rz: 0.0063 }, // 10: 肩部
  { s: 0.300, cy: -0.0002, ry: 0.0095, rz: 0.0065 }, // 11: 体前部
  { s: 0.350, cy: -0.0002, ry: 0.0096, rz: 0.0066 }, // 12: 最大体高(基準0.0192m=0.16L)・最大幅(0.0132m=0.11L)
  { s: 0.400, cy: -0.0002, ry: 0.0094, rz: 0.0064 }, // 13: 体中部前
  { s: 0.450, cy: -0.0002, ry: 0.0091, rz: 0.0061 }, // 14: 腹鰭付近
  { s: 0.500, cy: -0.0001, ry: 0.0085, rz: 0.0057 }, // 15: 背鰭前縁付近
  { s: 0.545, cy: -0.0001, ry: 0.0080, rz: 0.0052 }, // 16: 背鰭中央（55%付近）
  { s: 0.590, cy: -0.0001, ry: 0.0073, rz: 0.0046 }, // 17: 背鰭後端
  { s: 0.635, cy:  0.0000, ry: 0.0066, rz: 0.0040 }, // 18: 胴後部
  { s: 0.675, cy:  0.0000, ry: 0.0058, rz: 0.0034 }, // 19: 臀鰭前部
  { s: 0.715, cy:  0.0000, ry: 0.0050, rz: 0.0028 }, // 20: 臀鰭中部
  { s: 0.750, cy:  0.0000, ry: 0.0041, rz: 0.0022 }, // 21: 臀鰭後端
  { s: 0.780, cy:  0.0000, ry: 0.0034, rz: 0.0017 }, // 22: 尾柄入口
  { s: 0.805, cy:  0.0000, ry: 0.0030, rz: 0.0013 }, // 23: 尾柄（高さ 0.0060m = 0.05L 維持）
  { s: 0.825, cy:  0.0000, ry: 0.0029, rz: 0.0009 }, // 24: 尾柄最細・扁平化開始
  { s: 0.840, cy:  0.0000, ry: 0.0029, rz: 0.0005 }, // 25: 尾鰭付け根へ薄く差し込み
  { s: 0.850, cy:  0.0000, ry: 0.0025, rz: 0.0003 }, // 26: 尾鰭内部で収束
  { s: 0.857, cy:  0.0000, ry: 0.0016, rz: 0.0002 }, // 27: 尾端直前
  { s: 0.861, cy:  0.0000, ry: 0.0007, rz: 0.0001 }, // 28: 尾端キャップ直前
];

const SNOUT_POLE_X = SNOUT_X; // +0.0600m
const SNOUT_POLE_Y = 0.0006;
const TAIL_POLE_X = (0.5 - 0.863) * BASE_LENGTH; // -0.04356m

// 泳ぎの屈伸式・係数定数（ヘッド固定・尾にかけて増大する進行正弦波）
const SWIM_PARAMS = {
  baseFreqHz: 1.6,      // f(speed) = baseFreqHz + freqPerSpeed * speed
  freqPerSpeed: 2.6,
  ampRatio: 0.060,      // 尾端振幅 = BASE_LENGTH * ampRatio * min(speed, 2.0)
  maxSpeedForAmp: 2.0,
  wavelength: 0.92,     // 体長に対する波長比
  envHead: 0.015,       // 包絡線 E(s) = envHead + envLin * s + envPow * s^envExp
  envLin: 0.085,
  envPow: 0.900,
  envExp: 2.4,
};

function smoothstep01(t) {
  const c = THREE.MathUtils.clamp(t, 0, 1);
  return c * c * (3 - 2 * c);
}

/**
 * 断面形状（高さ > 幅の扁平卵形楕円）。背側がややふっくら、腹側を少し絞る。
 */
function crossSectionZ(sinT, cosT, rz) {
  const bellyTaper = cosT >= 0 ? 1.0 : 1.0 - 0.22 * Math.pow(-cosT, 1.35);
  return rz * sinT * bellyTaper;
}

/**
 * 体の BufferGeometry を断面リング方式で構築し、頂点カラーを付与する。
 */
function createBodyGeometry() {
  const ringCount = BODY_RINGS.length;
  const totalVerts = ringCount * SEG_AROUND + 2;

  const positions = new Float32Array(totalVerts * 3);
  const relYs = new Float32Array(totalVerts);
  const sCoords = new Float32Array(totalVerts);

  let vIdx = 0;
  for (let i = 0; i < ringCount; i++) {
    const r = BODY_RINGS[i];
    const baseX = (0.5 - r.s) * BASE_LENGTH;
    // 鼻先〜口元（s < 0.085）は下側をなだらかに後退させ、上顎が前に出て口が下向き気味の輪郭を作る
    const mouthSlope = 1.0 - smoothstep01((r.s - 0.008) / 0.075);

    for (let j = 0; j < SEG_AROUND; j++) {
      const theta = (j / SEG_AROUND) * Math.PI * 2;
      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);

      const lowerWeight = Math.pow(Math.max(0, 0.25 - cosT) / 1.25, 1.5);
      const lowerJawInset = 0.0014 * lowerWeight * mouthSlope;
      const x = baseX - lowerJawInset;
      // v5 小修正：腹側（下半分 cosT < 0）の張り出しを 0.92 倍に抑えてすっきりしたシルエットに
      const ventralScale = cosT >= 0 ? 1.0 : 0.92;
      const y = r.cy + r.ry * cosT * ventralScale;
      const z = crossSectionZ(sinT, cosT, r.rz);

      positions[vIdx * 3] = x;
      positions[vIdx * 3 + 1] = y;
      positions[vIdx * 3 + 2] = z;
      relYs[vIdx] = cosT;
      sCoords[vIdx] = r.s;
      vIdx++;
    }
  }

  const frontPoleIdx = vIdx++;
  positions[frontPoleIdx * 3] = SNOUT_POLE_X;
  positions[frontPoleIdx * 3 + 1] = SNOUT_POLE_Y;
  positions[frontPoleIdx * 3 + 2] = 0;
  relYs[frontPoleIdx] = 0.35;
  sCoords[frontPoleIdx] = 0.0;

  const backPoleIdx = vIdx++;
  positions[backPoleIdx * 3] = TAIL_POLE_X;
  positions[backPoleIdx * 3 + 1] = 0;
  positions[backPoleIdx * 3 + 2] = 0;
  relYs[backPoleIdx] = 0.0;
  sCoords[backPoleIdx] = 0.861;

  const indices = [];

  // 鼻先キャップ（外向き +X）
  for (let j = 0; j < SEG_AROUND; j++) {
    const jNext = (j + 1) % SEG_AROUND;
    indices.push(frontPoleIdx, j, jNext);
  }

  // リング間側面（外向き CCW）
  for (let i = 0; i < ringCount - 1; i++) {
    const rowA = i * SEG_AROUND;
    const rowB = (i + 1) * SEG_AROUND;
    for (let j = 0; j < SEG_AROUND; j++) {
      const jNext = (j + 1) % SEG_AROUND;
      const a = rowA + j;
      const b = rowA + jNext;
      const c = rowB + jNext;
      const d = rowB + j;
      indices.push(a, d, c);
      indices.push(a, c, b);
    }
  }

  // 尾端キャップ（外向き -X）
  const lastRow = (ringCount - 1) * SEG_AROUND;
  for (let j = 0; j < SEG_AROUND; j++) {
    const jNext = (j + 1) % SEG_AROUND;
    indices.push(backPoleIdx, lastRow + jNext, lastRow + j);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  // 頂点カラー：背側(0x274b5c) → 体側銀帯(0xd9e4e8) → 腹側(0xf2f5f5)
  const normals = geometry.attributes.normal;
  const colors = new Float32Array(totalVerts * 3);

  const dorsalDeep = new THREE.Color(0x1b3746);
  const dorsalBase = new THREE.Color(0x274b5c);
  const stripeRim = new THREE.Color(0x5b7f92);
  const silverBand = new THREE.Color(0xd9e4e8);
  const bellyColor = new THREE.Color(0xf2f5f5);
  const mouthShadow = new THREE.Color(0x526370);
  const tmpColor = new THREE.Color();

  for (let i = 0; i < totalVerts; i++) {
    const ny = normals.getY(i);
    const relY = relYs[i];
    const s = sCoords[i];

    // 頭部（鰓蓋まで）は背側の青緑帯がやや頭頂寄りに狭まり、頬が銀になる
    const headNarrow = s < 0.22 ? 0.16 * (1.0 - smoothstep01((s - 0.06) / 0.16)) : 0.0;
    const h = THREE.MathUtils.clamp(0.75 * relY + 0.25 * ny - headNarrow, -1, 1);

    if (h >= 0.44) {
      const t = smoothstep01((h - 0.44) / 0.46);
      tmpColor.lerpColors(dorsalBase, dorsalDeep, t);
    } else if (h >= 0.28) {
      // 青緑の背から体側銀帯への境界
      const t = smoothstep01((h - 0.28) / 0.16);
      tmpColor.lerpColors(stripeRim, dorsalBase, t);
    } else if (h >= 0.16) {
      // 銀帯上縁のわずかな青銀ライン
      const t = smoothstep01((h - 0.16) / 0.12);
      tmpColor.lerpColors(silverBand, stripeRim, t);
    } else if (h >= -0.18) {
      // 体側中央の銀の縦帯
      tmpColor.copy(silverBand);
    } else {
      // 銀帯下側から腹側の銀白色へ
      const t = smoothstep01((-0.18 - h) / 0.30);
      tmpColor.lerpColors(silverBand, bellyColor, t);
    }

    // 下向きの小さな口裂付近をほんのり暗めにして口元を明瞭にする
    if (s > 0.01 && s < 0.105 && relY > -0.78 && relY < -0.22) {
      const sMask = smoothstep01((s - 0.01) / 0.015) * (1.0 - smoothstep01((s - 0.065) / 0.04));
      const yMask = Math.exp(-Math.pow((relY + 0.46) / 0.18, 2));
      tmpColor.lerp(mouthShadow, 0.38 * sMask * yMask);
    }

    // 尾鰭付け根直前（s > 0.815）は少し落ち着いた暗銀青にして尾鰭との継ぎ目を自然に馴染ませる
    if (s > 0.815) {
      const tailBlend = smoothstep01((s - 0.815) / 0.045);
      tmpColor.lerp(stripeRim, 0.45 * tailBlend);
    }

    colors[i * 3] = tmpColor.r;
    colors[i * 3 + 1] = tmpColor.g;
    colors[i * 3 + 2] = tmpColor.b;
  }

  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return geometry;
}

/**
 * 2D Shape を XY 平面上に作り、Z 軸方向に薄い ExtrudeGeometry（深さ <= 0.0012）を生成する。
 * 前 = +X、上 = +Y の座標系にそのまま一致する。
 */
function createThinXYFin(shape, depth = 0.0008, curveSegments = 8) {
  const geom = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: false,
    curveSegments,
  });
  geom.translate(0, 0, -depth * 0.5);
  geom.computeVertexNormals();
  return geom;
}

/**
 * 尾鰭（深い二又フォーク型）：付け根 x=-0.0385m（体内にめり込み）〜 先端 x=-0.0600m（体長 0.12m 末端）
 */
function createTailFinGeometry() {
  const s = new THREE.Shape();
  s.moveTo(-0.0385, -0.0026);
  s.lineTo(-0.0410, -0.0031);
  s.quadraticCurveTo(-0.0505, -0.0076, -0.0596, -0.0108);
  s.quadraticCurveTo(-0.0602, -0.0108, -0.0598, -0.0098);
  s.quadraticCurveTo(-0.0540, -0.0046, -0.0490,  0.0000);
  s.quadraticCurveTo(-0.0540,  0.0046, -0.0598,  0.0098);
  s.quadraticCurveTo(-0.0602,  0.0108, -0.0596,  0.0108);
  s.quadraticCurveTo(-0.0505,  0.0076, -0.0410,  0.0031);
  s.lineTo(-0.0385,  0.0026);
  s.closePath();
  return createThinXYFin(s, 0.0008, 10);
}

/**
 * 背鰭（体長 55% 付近、小さな三角）：基底 x=+0.0015m 〜 -0.0140m、高さ最大 y=+0.0132m
 */
function createDorsalFinGeometry() {
  const s = new THREE.Shape();
  s.moveTo(0.0015, 0.0076);  // 体表面に 2mm めり込む
  s.quadraticCurveTo(-0.0020, 0.0114, -0.0046, 0.0132);
  s.quadraticCurveTo(-0.0054, 0.0134, -0.0064, 0.0126);
  s.quadraticCurveTo(-0.0102, 0.0098, -0.0142, 0.0072);
  s.lineTo(-0.0140, 0.0054); // 体表面に 2mm めり込む
  s.closePath();
  return createThinXYFin(s, 0.0007, 8);
}

/**
 * 臀鰭（体の後方腹側の小さな低い鰭）
 */
function createAnalFinGeometry() {
  const s = new THREE.Shape();
  s.moveTo(-0.0195, -0.0040); // スリム化した腹側体内にしっかりめり込む
  s.lineTo(-0.0320, -0.0022);
  s.lineTo(-0.0322, -0.0052);
  s.quadraticCurveTo(-0.0260, -0.0063, -0.0226, -0.0080);
  s.quadraticCurveTo(-0.0212, -0.0080, -0.0202, -0.0066);
  s.closePath();
  return createThinXYFin(s, 0.0006, 6);
}

/**
 * 胸鰭（小さな扇形、付け根を体側内側にめり込ませ斜め後方外下向きへ配置）
 * sideSign: +1 = 右側面(+Z), -1 = 左側面(-Z)
 */
function createPectoralFinGeometry(sideSign) {
  // XY 平面で +X が根元方向、-X が後方へ伸びる扇形を作成し、モデル空間へ回転・配置をベイクする
  const s = new THREE.Shape();
  s.moveTo(0.0022, 0.0012);
  s.quadraticCurveTo(-0.0042, 0.0024, -0.0110, 0.0004);
  s.quadraticCurveTo(-0.0120, -0.0006, -0.0108, -0.0020);
  s.quadraticCurveTo(-0.0045, -0.0036, 0.0022, -0.0014);
  s.closePath();

  const geom = new THREE.ExtrudeGeometry(s, {
    depth: 0.0005,
    bevelEnabled: false,
    curveSegments: 8,
  });
  geom.translate(0, 0, -0.00025);

  // 下縁を外側へ少し傾け、先端を斜め下に下げ、後方先端を外側(sideSign * +Z)へ開く
  geom.rotateX(sideSign * -0.55);
  geom.rotateZ(-0.18);
  geom.rotateY(sideSign * 0.21);

  // 鰓蓋直後の下部（x = +0.0335m, y = -0.0041m, z = ±0.0041m）へ配置（スリム化後体側へ密着）
  geom.translate(0.0335, -0.0041, sideSign * 0.0041);
  geom.computeVertexNormals();
  return geom;
}

/**
 * 腹鰭（体長 45% 付近腹側の小さな対鰭）
 */
function createPelvicFinGeometry(sideSign) {
  const s = new THREE.Shape();
  s.moveTo(0.0012, 0.0014);
  s.lineTo(-0.0014, 0.0010);
  s.quadraticCurveTo(-0.0052, -0.0010, -0.0072, -0.0024);
  s.quadraticCurveTo(-0.0064, -0.0029, -0.0042, -0.0022);
  s.quadraticCurveTo(-0.0008, -0.0010, 0.0012, 0.0002);
  s.closePath();

  const geom = new THREE.ExtrudeGeometry(s, {
    depth: 0.00045,
    bevelEnabled: false,
    curveSegments: 6,
  });
  geom.translate(0, 0, -0.000225);
  geom.rotateX(sideSign * 0.30);
  geom.rotateY(sideSign * 0.14);
  geom.translate(0.0055, -0.0068, sideSign * 0.0013);
  geom.computeVertexNormals();
  return geom;
}

/**
 * 基準座標・基準法線を保存して毎フレーム頂点単位の正弦波屈伸を適用するヘルパー
 */
function prepareBendableMesh(mesh) {
  const posAttr = mesh.geometry.getAttribute('position');
  const normAttr = mesh.geometry.getAttribute('normal');
  const basePos = new Float32Array(posAttr.array);
  const baseNorm = new Float32Array(normAttr.array);
  return { mesh, posAttr, normAttr, basePos, baseNorm };
}

/**
 * 泳ぎ屈伸の横ずれ量 Δz(x0, phase, tailAmp) と傾斜 d(Δz)/dx0 を計算する
 */
function evaluateSwimWave(x0, phase, tailAmp) {
  const s = THREE.MathUtils.clamp((SNOUT_X - x0) / BASE_LENGTH, 0, 1);
  const env = SWIM_PARAMS.envHead + SWIM_PARAMS.envLin * s + SWIM_PARAMS.envPow * Math.pow(s, SWIM_PARAMS.envExp);
  const arg = phase - (2 * Math.PI * s) / SWIM_PARAMS.wavelength;
  const dz = tailAmp * env * Math.sin(arg);

  // s に関する導関数 d(env)/ds と d(arg)/ds から dz/dx0 = -(1/L) * d(dz)/ds を解析的に算出
  const dEnvDs = SWIM_PARAMS.envLin + SWIM_PARAMS.envPow * SWIM_PARAMS.envExp * Math.pow(Math.max(s, 1e-6), SWIM_PARAMS.envExp - 1);
  const dDzDs = tailAmp * (dEnvDs * Math.sin(arg) - env * (2 * Math.PI / SWIM_PARAMS.wavelength) * Math.cos(arg));
  const slope = -dDzDs / BASE_LENGTH;

  return { dz, slope };
}

/**
 * 群れ用オリジナル カタクチイワシ モデルを生成する。
 *
 * @param {object} [options]
 * @param {number} [options.length=0.12] 体長 (m)。基準 0.12m からの比率で全体をスケール
 * @param {number} [options.phase=0] 個体別の初期位相 (rad)
 * @param {number} [options.metalness=0.55] 体マテリアルの metalness
 * @param {number} [options.roughness=0.38] 体マテリアルの roughness
 * @returns {{ object: THREE.Group, update: (t: number, speed?: number) => void }}
 */
export function createSardine(options = {}) {
  const opts = options || {};
  const length = typeof opts.length === 'number' && opts.length > 0 ? opts.length : BASE_LENGTH;
  const phaseOffset = typeof opts.phase === 'number' ? opts.phase : 0;
  const metalness = typeof opts.metalness === 'number' ? opts.metalness : 0.55;
  const roughness = typeof opts.roughness === 'number' ? opts.roughness : 0.38;

  const object = new THREE.Group();
  object.name = 'sardine';

  // 体マテリアル（頂点カラー：青緑の背・銀の体側帯・銀白の腹）
  const bodyMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    metalness,
    roughness,
  });

  // 鰭マテリアル（半透明感のある灰青、depthWrite: false で体との重なり破綻を防止）
  const finMat = new THREE.MeshStandardMaterial({
    color: 0x7a96a8,
    transparent: true,
    opacity: 0.85,
    roughness: 0.45,
    metalness: 0.12,
    depthWrite: false,
  });

  // 1. 体メッシュ（断面リング方式）
  const bodyMesh = new THREE.Mesh(createBodyGeometry(), bodyMat);
  bodyMesh.name = 'body';
  object.add(bodyMesh);

  // 2. 各鰭メッシュ（全てモデル原点基準の座標にベイク済み）
  const tailFinMesh = new THREE.Mesh(createTailFinGeometry(), finMat);
  tailFinMesh.name = 'tailFin';
  tailFinMesh.renderOrder = 2;
  object.add(tailFinMesh);

  const dorsalFinMesh = new THREE.Mesh(createDorsalFinGeometry(), finMat);
  dorsalFinMesh.name = 'dorsalFin';
  dorsalFinMesh.renderOrder = 2;
  object.add(dorsalFinMesh);

  const analFinMesh = new THREE.Mesh(createAnalFinGeometry(), finMat);
  analFinMesh.name = 'analFin';
  analFinMesh.renderOrder = 2;
  object.add(analFinMesh);

  const pectoralFinR = new THREE.Mesh(createPectoralFinGeometry(1), finMat);
  pectoralFinR.name = 'pectoralFinR';
  pectoralFinR.renderOrder = 2;
  object.add(pectoralFinR);

  const pectoralFinL = new THREE.Mesh(createPectoralFinGeometry(-1), finMat);
  pectoralFinL.name = 'pectoralFinL';
  pectoralFinL.renderOrder = 2;
  object.add(pectoralFinL);

  const pelvicFinR = new THREE.Mesh(createPelvicFinGeometry(1), finMat);
  pelvicFinR.name = 'pelvicFinR';
  pelvicFinR.renderOrder = 2;
  object.add(pelvicFinR);

  const pelvicFinL = new THREE.Mesh(createPelvicFinGeometry(-1), finMat);
  pelvicFinL.name = 'pelvicFinL';
  pelvicFinL.renderOrder = 2;
  object.add(pelvicFinL);

  // 3. 目（両側に落ち着いた光沢の黒い球を頭部側面に配置）
  // v5 小修正：ビーズ感を消すため半径を 0.0034 → 0.0023、roughness を 0.08 → 0.30 に調整
  const eyeRadius = 0.0023;
  const eyeGeom = new THREE.SphereGeometry(eyeRadius, 16, 12);
  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0x0a0d12,
    roughness: 0.30,
    metalness: 0.15,
  });
  const baseEyeX = 0.0480; // 鼻先から 0.012m（体長 10%）
  const baseEyeY = 0.0014;
  const baseEyeZ = 0.0028; // 頭幅(±0.0045m)の内側に約2/3を埋め、外側±0.0051mまで露出

  const eyeR = new THREE.Mesh(eyeGeom, eyeMat);
  eyeR.name = 'eyeR';
  eyeR.position.set(baseEyeX, baseEyeY, baseEyeZ);
  object.add(eyeR);

  const eyeL = new THREE.Mesh(eyeGeom, eyeMat);
  eyeL.name = 'eyeL';
  eyeL.position.set(baseEyeX, baseEyeY, -baseEyeZ);
  object.add(eyeL);

  // 体長スケール適用（比率を完全に維持）
  const scale = length / BASE_LENGTH;
  object.scale.setScalar(scale);

  // 頂点屈伸対象の全ジオメトリの基準状態を保持
  const bendables = [
    prepareBendableMesh(bodyMesh),
    prepareBendableMesh(tailFinMesh),
    prepareBendableMesh(dorsalFinMesh),
    prepareBendableMesh(analFinMesh),
    prepareBendableMesh(pectoralFinR),
    prepareBendableMesh(pectoralFinL),
    prepareBendableMesh(pelvicFinR),
    prepareBendableMesh(pelvicFinL),
  ];

  // メタデータ（デバッグ・検証参照用）
  object.userData.sardineSpec = {
    baseLength: BASE_LENGTH,
    length,
    ringCount: BODY_RINGS.length,
    ringSegments: SEG_AROUND,
    eyeRadius,
    metalness,
    roughness,
    swimParams: { ...SWIM_PARAMS },
  };

  /**
   * 毎フレーム呼び出して体の屈伸による遊泳アニメーションを更新する。
   * 基準頂点位置から直接正弦波の横ずれ（Z軸）を計算し、全体回転の疑似泳ぎは行わない。
   *
   * @param {number} t 経過時間（秒）
   * @param {number} [speed=1.0] 遊泳の強さ（0〜2 程度）
   */
  function update(t, speed = 1.0) {
    const timeSec = Number.isFinite(t) ? t : 0;
    const spd = Math.max(0, Number.isFinite(speed) ? speed : 1.0);

    const freqHz = SWIM_PARAMS.baseFreqHz + SWIM_PARAMS.freqPerSpeed * spd;
    const phase = 2 * Math.PI * freqHz * timeSec + phaseOffset;
    const tailAmp = BASE_LENGTH * SWIM_PARAMS.ampRatio * Math.min(spd, SWIM_PARAMS.maxSpeedForAmp);

    for (let b = 0; b < bendables.length; b++) {
      const item = bendables[b];
      const posArr = item.posAttr.array;
      const normArr = item.normAttr.array;
      const basePos = item.basePos;
      const baseNorm = item.baseNorm;
      const count = item.posAttr.count;

      for (let i = 0; i < count; i++) {
        const idx = i * 3;
        const x0 = basePos[idx];
        const y0 = basePos[idx + 1];
        const z0 = basePos[idx + 2];

        const { dz, slope } = evaluateSwimWave(x0, phase, tailAmp);

        // 体の弧長伸縮を抑えるための微細なX軸引き込みと横ずれZ
        posArr[idx] = x0;
        posArr[idx + 1] = y0;
        posArr[idx + 2] = z0 + dz;

        // 屈伸斜度に合わせて法線も傾け、銀色の体側の光の揺らめきを再現
        const nx0 = baseNorm[idx];
        const ny0 = baseNorm[idx + 1];
        const nz0 = baseNorm[idx + 2];
        const nx = nx0 - slope * nz0;
        const ny = ny0;
        const nz = nz0 + slope * nx0;
        const nLen = Math.hypot(nx, ny, nz) || 1.0;
        normArr[idx] = nx / nLen;
        normArr[idx + 1] = ny / nLen;
        normArr[idx + 2] = nz / nLen;
      }

      item.posAttr.needsUpdate = true;
      item.normAttr.needsUpdate = true;
      item.mesh.geometry.boundingBox = null;
      item.mesh.geometry.boundingSphere = null;
    }

    // 頭部位置の微小な横ずれ・傾きに両目を追従させる
    const eyeWave = evaluateSwimWave(baseEyeX, phase, tailAmp);
    eyeR.position.set(baseEyeX, baseEyeY, baseEyeZ + eyeWave.dz);
    eyeL.position.set(baseEyeX, baseEyeY, -baseEyeZ + eyeWave.dz);
    eyeR.rotation.y = -Math.atan(eyeWave.slope);
    eyeL.rotation.y = -Math.atan(eyeWave.slope);
  }

  return { object, update };
}
