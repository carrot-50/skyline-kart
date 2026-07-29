import * as THREE from 'three';

import {
  CLEAR_RANK, STAGES, clearedCount, getRecord, isUnlocked,
} from '../game/Progress.js';

/** Samples a layout once so the card can draw its outline and show a length. */
function outline(layout, samples = 220) {
  const points = layout.points.map(
    ([x, z, y = 0]) => new THREE.Vector3(x * layout.scale, y, z * layout.scale),
  );
  const curve = new THREE.CatmullRomCurve3(points, true, 'catmullrom', 0.5);
  const spaced = curve.getSpacedPoints(samples).slice(0, samples);
  let length = 0;
  for (let index = 0; index < spaced.length; index += 1) {
    const next = spaced[(index + 1) % spaced.length];
    length += Math.hypot(next.x - spaced[index].x, next.z - spaced[index].z);
  }
  return { spaced, length };
}

function drawPreview(canvas, layout, shape, unlocked = true) {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const width = canvas.clientWidth * ratio;
  const height = canvas.clientHeight * ratio;
  if (width < 2 || height < 2) return;
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  const bounds = shape.spaced.reduce((box, point) => ({
    minX: Math.min(box.minX, point.x), maxX: Math.max(box.maxX, point.x),
    minZ: Math.min(box.minZ, point.z), maxZ: Math.max(box.maxZ, point.z),
  }), { minX: Infinity, maxX: -Infinity, minZ: Infinity, maxZ: -Infinity });

  const pad = 16 * ratio;
  const spanX = (bounds.maxX - bounds.minX) + layout.width * 2;
  const spanZ = (bounds.maxZ - bounds.minZ) + layout.width * 2;
  const scale = Math.min((width - pad * 2) / spanX, (height - pad * 2) / spanZ);
  const originX = width / 2 - ((bounds.minX + bounds.maxX) / 2) * scale;
  const originY = height / 2 - ((bounds.minZ + bounds.maxZ) / 2) * scale;

  const trace = () => {
    context.beginPath();
    shape.spaced.forEach((point, index) => {
      const x = originX + point.x * scale;
      const y = originY + point.z * scale;
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    });
    context.closePath();
  };

  context.clearRect(0, 0, width, height);
  context.globalAlpha = unlocked ? 1 : 0.25;
  context.lineJoin = 'round';
  context.lineCap = 'round';

  const road = Math.max(4 * ratio, layout.width * scale);
  trace();
  context.strokeStyle = '#e05b52';
  context.lineWidth = road + 4 * ratio;
  context.stroke();
  trace();
  context.strokeStyle = '#c9d4dd';
  context.lineWidth = road;
  context.stroke();

  // Checkpoints and item boxes, matching the legend on the reference sheet.
  const total = shape.spaced.length;
  for (let n = 0; n < 8; n += 1) {
    const point = shape.spaced[Math.round((n / 8) * total) % total];
    context.beginPath();
    context.arc(originX + point.x * scale, originY + point.z * scale, 2.6 * ratio, 0, Math.PI * 2);
    context.fillStyle = '#ffd43b';
    context.fill();
  }
  for (let n = 0; n < 5; n += 1) {
    const point = shape.spaced[Math.round(((n + 0.5) / 5) * total) % total];
    context.fillStyle = '#4dabf7';
    context.fillRect(
      originX + point.x * scale - 2.4 * ratio,
      originY + point.z * scale - 2.4 * ratio,
      4.8 * ratio, 4.8 * ratio,
    );
  }

  const start = shape.spaced[0];
  context.beginPath();
  context.arc(originX + start.x * scale, originY + start.z * scale, 4.4 * ratio, 0, Math.PI * 2);
  context.fillStyle = '#ffffff';
  context.fill();
  context.strokeStyle = '#1d2329';
  context.lineWidth = 1.6 * ratio;
  context.stroke();
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${(seconds - minutes * 60).toFixed(1).padStart(4, '0')}`;
}

export class TrackSelect {
  constructor(container, onChoose, focusIndex = 0) {
    this.element = document.createElement('div');
    this.element.className = 'track-select';
    this.element.innerHTML = `
      <header class="track-select__header">
        <h1>SKYLINE KART</h1>
        <p>스테이지 ${clearedCount()} / ${STAGES.length} 클리어 &nbsp;·&nbsp;
           3랩 &nbsp;·&nbsp; ${CLEAR_RANK}위 안에 들면 다음 스테이지 해금</p>
      </header>
      <button class="fullscreen-button" type="button" data-fullscreen>전체화면</button>
      <div class="track-select__grid"></div>
      <footer class="track-select__legend">
        <span><i class="legend-dot legend-dot--start"></i>출발/결승선</span>
        <span><i class="legend-dot legend-dot--check"></i>체크포인트</span>
        <span><i class="legend-dot legend-dot--item"></i>아이템 상자</span>
        <span><i class="legend-dot legend-dot--wall"></i>벽/가드레일</span>
      </footer>
    `;
    container.append(this.element);

    // Blog embeds are small; fullscreen needs allow="fullscreen" on the iframe.
    const fullscreen = this.element.querySelector('[data-fullscreen]');
    if (document.fullscreenEnabled) {
      fullscreen.addEventListener('click', () => {
        if (document.fullscreenElement) document.exitFullscreen();
        else document.documentElement.requestFullscreen?.();
      });
    } else {
      fullscreen.remove();
    }

    const grid = this.element.querySelector('.track-select__grid');
    STAGES.forEach((layout, index) => {
      const shape = outline(layout);
      const unlocked = isUnlocked(index);
      const record = getRecord(index);
      const card = document.createElement('button');
      card.type = 'button';
      card.className = `track-card${unlocked ? '' : ' track-card--locked'}`;
      card.dataset.theme = layout.theme.scenery;
      card.disabled = !unlocked;
      if (index === focusIndex) card.classList.add('track-card--next');
      card.innerHTML = `
        <div class="track-card__top">
          <span class="track-card__index">${unlocked ? index + 1 : '🔒'}</span>
          <div>
            <strong class="track-card__name">STAGE ${index + 1} · ${layout.name}</strong>
            <span class="track-card__subtitle">${
              unlocked ? layout.subtitle : '이전 스테이지를 클리어하면 열립니다'
            }</span>
          </div>
          ${record ? `<span class="track-card__badge">${record.rank}위 ${formatTime(record.time)}</span>` : ''}
        </div>
        <canvas class="track-card__map"></canvas>
        <dl class="track-card__stats">
          <div><dt>랩 수</dt><dd>3</dd></div>
          <div><dt>트랙 길이</dt><dd>${(shape.length / 1000).toFixed(2)} km</dd></div>
          <div><dt>난이도</dt><dd class="track-card__stars">${
            '★'.repeat(layout.difficulty) + '☆'.repeat(5 - layout.difficulty)
          }</dd></div>
        </dl>
        <p class="track-card__note">${unlocked ? layout.note : ''}</p>
      `;
      if (unlocked) {
        card.addEventListener('click', () => {
          this.element.remove();
          onChoose(layout, index);
        });
      }
      grid.append(card);
      requestAnimationFrame(() => drawPreview(card.querySelector('canvas'), layout, shape, unlocked));
    });
  }
}
