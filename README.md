# Skyline Kart

브라우저에서 바로 즐기는 3D 카트 레이싱 게임입니다. 게임 엔진 없이 Three.js로 직접 만들었고, 효과음과 BGM도 Web Audio API로 합성했습니다.

**▶ [플레이하기](https://carrot-50.github.io/skyline-kart/skyline-kart-dist/)**

## 조작

| 키 | 동작 |
|---|---|
| `↑` / `W` | 가속 |
| `↓` / `S` | 브레이크 · 후진 |
| `←` `→` / `A` `D` | 조향 |
| `Space` | 드리프트 |
| `E` | 아이템 사용 |
| `R` | 코스 복귀 |
| `Esc` | 일시정지 |

## 게임 방식

AI 5대와 3랩을 겨룹니다. **3위 안에 들면 다음 스테이지가 열립니다.**

| 스테이지 | 코스 | 난이도 | 길이 |
|---|---|---|---|
| 1 | 초원 서킷 | ★★☆☆☆ | 0.87 km |
| 2 | 사막 스피드 링 | ★★☆☆☆ | 0.98 km |
| 3 | 8자 롤러 코스터 | ★★★☆☆ | 1.01 km |
| 4 | 숲속 랠리 | ★★★☆☆ | 0.87 km |
| 5 | 산악 헤어핀 | ★★★★☆ | 1.11 km |
| 6 | 화산 챌린지 | ★★★★★ | 0.98 km |

### 주행

고속에서는 접지력이 떨어지도록 만들었습니다. 최고 속도로 그릴 수 있는 최소 회전반경이 약 28m인데 헤어핀은 그보다 좁아서, **감속하지 않으면 돌 수 없습니다.**

드리프트는 두 단계입니다. 짧게 물면 미니 터보(1.8초), 길게 버티면 슈퍼 터보(3초)가 터집니다. 슈퍼 터보는 최고 속도를 1.5배까지 끌어올립니다.

### 아이템

트랙에 놓인 상자를 먹으면 셋 중 하나가 나옵니다.

- **Booster** — 2초간 가속력과 최고 속도 상승
- **Slime** — 뒤에 미끄러운 장애물 설치, 밟으면 조향 불능
- **Bolt** — 도로를 따라 날아가 앞선 카트를 1.3초간 스핀아웃

AI도 똑같이 아이템을 쓰고, 똑같이 당합니다.

## 기술 구성

- **Vite** + **Three.js** + 순수 JavaScript
- 게임 엔진 · 물리 엔진 미사용
- 효과음과 BGM은 Web Audio API로 직접 합성
- 트랙은 중심선 제어점 하나에서 도로 · 커브 · 배리어 · 체크포인트 · AI 주행선 · 랩 진행도 · 미니맵 · 아이템 배치가 모두 파생

## 프로젝트 구조

```
src/
├─ main.js
├─ config/gameConfig.js       주행·AI·아이템·카메라 설정
├─ game/
│  ├─ Game.js                 장면 구성과 게임 루프
│  ├─ RaceManager.js          카운트다운·체크포인트·랩·순위
│  ├─ CollisionSystem.js      카트 간 충돌
│  ├─ InputManager.js         키보드 입력
│  └─ Progress.js             스테이지 해금 진행도
├─ track/
│  ├─ Track.js                중심선 기반 서킷 생성
│  ├─ trackLayouts.js         6개 코스 정의
│  └─ textures.js             텍스처 로더 (없으면 단색 폴백)
├─ vehicles/                  Kart · PlayerKart · AIKart
├─ items/                     아이템 상자 · Slime · Bolt
├─ effects/                   드리프트 파티클 · 잔상
├─ camera/FollowCamera.js
├─ audio/AudioManager.js
└─ ui/                        HUD · 미니맵 · 스테이지 선택
```

## 실행

```bash
npm install
npm run dev
```

## 빌드 · 배포

```bash
npm run build     # dist/ 생성
npm run deploy    # gh-pages 브랜치에 게시
```

## 라이선스

모든 캐릭터 · 차량 · 트랙 · UI · 아이템은 오리지널 제작물입니다.
