/**
 * Nyan Cat Widescreen Screen Decorator & Exporter
 * PIXEL-ACCURATE REMAKE — Main rendering engine
 *
 * Color index mapping for all sprite grids:
 *   0 = transparent (skip)
 *   1 = outline       (#000000)
 *   2 = cat skin      (configurable, default #999999)
 *   3 = cat dark skin (configurable, default #666666)
 *   4 = crust/toast   (configurable, default #FFCC99)
 *   5 = frosting      (configurable, default #FF99CC)
 *   6 = sprinkle      (configurable, default #FF3399)
 *   7 = eye white     (#FFFFFF)
 *   8 = cheek pink    (#FF9999)
 */

// ===================================================================
// 1. CUSTOMIZATION PALETTES
// ===================================================================
const PALETTES = {
  skins: {
    classic: { name: 'Classic Grey', fill: '#999999', shadow: '#666666' },
    tabby:   { name: 'Orange Tabby', fill: '#ff9933', shadow: '#cc6600' },
    siamese: { name: 'Siamese',      fill: '#e6d8ad', shadow: '#8b5a2b' },
    void:    { name: 'Void Black',    fill: '#2a2a2a', shadow: '#111111' },
    albino:  { name: 'Albino White',  fill: '#fcfcfc', shadow: '#cccccc' }
  },
  poptarts: {
    strawberry: {
      name: 'Strawberry Pink',
      crust: '#FFCC99',
      frosting: '#FF99CC',
      sprinkle: '#FF3399'
    },
    blueberry: {
      name: 'Blueberry Blue',
      crust: '#e0b87a',
      frosting: '#5dade2',
      sprinkle: '#2471a3'
    },
    chocolate: {
      name: 'Chocolate Fudge',
      crust: '#8d6e63',
      frosting: '#4e342e',
      sprinkle: '#ffcc00'
    },
    custom: {
      name: 'Custom Theme',
      crust: '#d7ccc8',
      frosting: '#e1bee7',
      sprinkle: '#e91e63'
    }
  },
  rainbows: {
    classic: {
      name: 'Classic Rainbow',
      colors: ['#ff0000', '#ff9900', '#ffff00', '#33ff00', '#0099ff', '#6633ff']
    },
    neon: {
      name: 'Cyberpunk Neon',
      colors: ['#ff007f', '#ff00ff', '#00ffff', '#39ff14', '#ffff00', '#ff5f1f']
    },
    pastel: {
      name: 'Pastel Dreams',
      colors: ['#ffb3ba', '#ffdfba', '#ffffba', '#baffc9', '#bae1ff', '#e8c4ff']
    },
    monochrome: {
      name: 'Monochrome Wave',
      colors: ['#ffffff', '#dddddd', '#bbbbbb', '#888888', '#555555', '#222222']
    }
  }
};

// ===================================================================
// 2. PIXEL-ACCURATE SPRITE DATA
// ===================================================================

// --- Pop-Tart Body (23 wide × 18 tall) ---
const POPTART = [
  [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
  [0,1,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,1,0],
  [1,4,4,4,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,4,4,4,1],
  [1,4,4,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,4,4,1],
  [1,4,5,5,6,5,5,5,6,5,5,5,5,6,5,5,5,5,5,5,5,4,1],
  [1,4,5,5,5,5,5,5,5,5,5,6,5,5,5,5,6,5,5,5,5,4,1],
  [1,4,5,6,5,5,6,5,5,5,5,5,5,5,6,5,5,5,5,5,5,4,1],
  [1,4,5,5,5,5,5,5,5,6,5,5,5,5,5,5,5,6,5,5,5,4,1],
  [1,4,5,5,5,6,5,5,5,5,5,5,6,5,5,6,5,5,5,5,5,4,1],
  [1,4,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,6,5,5,4,1],
  [1,4,5,5,5,6,5,5,5,6,5,5,5,5,5,5,5,5,5,5,5,4,1],
  [1,4,5,5,5,5,5,5,5,5,5,5,5,6,5,5,5,5,5,5,5,4,1],
  [1,4,5,5,5,5,5,5,6,5,5,5,5,5,5,5,5,5,5,5,5,4,1],
  [1,4,5,5,5,6,5,5,5,5,5,5,5,5,5,5,6,5,5,5,5,4,1],
  [1,4,4,5,5,5,5,5,6,5,5,5,6,5,5,5,5,5,6,5,4,4,1],
  [1,4,4,4,5,5,5,5,5,5,5,5,5,5,6,5,5,5,5,4,4,4,1],
  [0,1,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,0,1],
  [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
];
// --- Cat Head – Eyes Open (16 wide × 13 tall) ---
const HEAD_OPEN = [
  [0,0,1,1,0,0,0,0,0,0,0,0,1,1,0,0],
  [0,1,2,2,1,0,0,0,0,0,0,1,2,2,1,0],
  [0,1,2,2,2,1,1,1,1,1,1,2,2,2,1,0],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,2,2,7,1,2,2,2,2,2,7,1,2,2,1],
  [1,2,2,2,1,1,2,2,2,1,2,1,1,2,2,1],
  [1,2,8,8,2,2,2,2,2,2,2,2,2,8,8,1],
  [1,2,8,8,2,1,2,2,1,2,2,1,2,8,8,1],
  [0,1,2,2,2,1,1,1,1,1,1,1,2,2,1,0],
  [0,0,1,2,2,2,2,2,2,2,2,2,2,1,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
];

// --- Cat Head – Eyes Blinking (16 wide × 13 tall) ---
const HEAD_BLINK = [
  [0,0,1,1,0,0,0,0,0,0,0,0,1,1,0,0],
  [0,1,2,2,1,0,0,0,0,0,0,1,2,2,1,0],
  [0,1,2,2,2,1,1,1,1,1,1,2,2,2,1,0],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,2,2,7,1,2,2,2,2,2,7,1,2,2,1],
  [1,2,2,2,1,1,2,2,2,1,2,1,1,2,2,1],
  [1,2,8,8,2,2,2,2,2,2,2,2,2,8,8,1],
  [1,2,8,8,2,1,2,2,1,2,2,1,2,8,8,1],
  [0,1,2,2,2,1,1,1,1,1,1,1,2,2,1,0],
  [0,0,1,2,2,2,2,2,2,2,2,2,2,1,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
];

// --- Leg Shapes (pixel-accurate, 4 distinct matrices) ---
// Naming convention: FRONT = 2 legs on right side, BACK = 2 legs on left side
//   _1 = outermost leg (right-most for FRONT, left-most for BACK)
//   _2 = innermost leg
const LEG_FRONT_1 = [
  [0,0,1,1,1],
  [0,1,1,2,1],
  [1,1,2,2,1],
  [0,1,1,1,1],
];

const LEG_FRONT_2 = [
  [1,1,1,1],
  [1,2,2,1],
  [1,2,2,1],
  [1,1,1,0],
];

const LEG_BACK_1 = [
  [1,1,1,1],
  [1,2,2,1],
  [1,2,2,1],
  [1,1,1,0],
];

const LEG_BACK_2 = [
  [0,0,1,1,1],
  [0,1,2,2,1],
  [1,2,2,2,1],
  [1,1,1,1,0],
];

// X offsets for 4 legs relative to poptart left column.
// Order (left → right): BACK_2, BACK_1, FRONT_2, FRONT_1
const LEG_DX = [0, 5, 13, 17];

// X offsets for head and legs per frame (4-frame cycle)
const HEAD_X_OFFSETS = [-1, 0, 1, 0];

// Leg movement follows the same circular pattern as the head:
//   Frame 0: left  (dx=-1, dy= 0)
//   Frame 1: up    (dx= 0, dy=-1)
//   Frame 2: right (dx=+1, dy= 0)
//   Frame 3: down  (dx= 0, dy=+1)  ← back to baseline
const LEG_X_OFFSETS = [-1, 0, 1, 0];
const LEG_Y_OFFSETS = [ 0,-1, 0, 1];

// Per-frame leg grids: [BACK_2, BACK_1, FRONT_2, FRONT_1]
// Each pair alternates between pose A and pose B across frames.
// Frames 0 & 2 swap poses; Frames 1 & 3 swap back.
const LEG_ANIM = [
  [LEG_BACK_2,  LEG_BACK_1,  LEG_FRONT_2, LEG_FRONT_1],  // Frame 0: pose A
  [LEG_BACK_1,  LEG_BACK_2,  LEG_FRONT_1, LEG_FRONT_2],  // Frame 1: pose B
  [LEG_BACK_2,  LEG_BACK_1,  LEG_FRONT_2, LEG_FRONT_1],  // Frame 2: pose A
  [LEG_BACK_1,  LEG_BACK_2,  LEG_FRONT_1, LEG_FRONT_2],  // Frame 3: pose B
];

// --- Tail Shapes ---
// Tail wave UP (6 wide × 6 tall)
const TAIL_UP = [
  [1,1,1,1,0,0],
  [1,2,2,1,1,0],
  [1,1,2,2,1,1],
  [0,1,1,2,2,1],
  [0,0,1,1,2,2],
  [0,0,0,1,1,1],
  [0,0,0,0,0,1],
];
// Tail wave MID / horizontal (5 wide × 4 tall)
const TAIL_MID = [
  [1,1,1,1,1,0,0],
  [1,2,2,2,1,1,1],
  [1,1,1,2,2,2,1],
  [0,0,1,1,1,1,2],
  [0,0,0,0,0,1,1],
];
// Tail wave DOWN (6 wide × 6 tall)
const TAIL_DOWN = [
  [0,0,0,0,0,1],
  [0,1,1,1,1,1],
  [1,1,2,2,2,2],
  [1,2,2,2,1,1],
  [0,1,1,1,1,0],
];
const TAIL_SHAPE_LIST = [TAIL_UP, TAIL_MID, TAIL_DOWN];

// Per-frame: which tail shape + offset from poptart top-left
const TAIL_ANIM = [
  { shape: 0, dx: -6, dy: 6 },   // Frame 0: up
  { shape: 1, dx: -5, dy: 8 },   // Frame 1: mid
  { shape: 2, dx: -6, dy: 9 },   // Frame 2: down
  { shape: 1, dx: -5, dy: 8 }    // Frame 3: mid
];

// --- Body Bobbing Offsets (in pixel units, applied vertically) ---
const BOB_OFFSETS = [0, -1, 0, 1];

// --- Positioning Constants ---
let HEAD_DX = 12;   // Head X offset from poptart left
let HEAD_DY = 0;    // Head Y offset relative to bottom-alignment baseline (0 = perfectly aligned at bottom)
const POPTART_W = 21; // Poptart pixel width
const POPTART_H = 12; // Poptart pixel height
const SPRITE_W = 34;  // Total sprite width (tail to head-right)
const SPRITE_H = 17;  // Total sprite height (ear-tips to leg-bottoms)


// ===================================================================
// 3. NYAN CAT MODEL CLASS
// ===================================================================
class NyanCatModel {
  constructor(options = {}) {
    this.scale = options.scale || 6;
    this.x = options.x || 100;       // Poptart left-edge X
    this.y = options.y || 150;       // Poptart top-edge Y (before bob)

    // Customization
    this.skinStyle = options.skinStyle || 'classic';
    this.poptartStyle = options.poptartStyle || 'strawberry';
    this.customSkinColor = null;
    this.customSkinShadow = null;
    this.customCrustColor = null;
    this.customFrostingColor = null;
    this.customSprinkleColor = null;

    // Animation state
    this.currentFrame = 0;
    this.blinkTimer = 0;
    this.isBlinking = false;
    this.currentBob = 0;  // Expose current bob for rainbow sync

    // Total sprite dimensions (for UI centering)
    this.width = SPRITE_W * this.scale;
    this.height = SPRITE_H * this.scale;
  }

  // Build the active color lookup table (index → hex string)
  getColorMap() {
    const skin = PALETTES.skins[this.skinStyle] || PALETTES.skins.classic;
    const pop  = PALETTES.poptarts[this.poptartStyle] || PALETTES.poptarts.strawberry;
    return {
      1: '#000000',                                      // outline
      2: this.customSkinColor    || skin.fill,           // skin
      3: this.customSkinShadow   || skin.shadow,         // dark skin
      4: this.customCrustColor   || pop.crust,           // crust
      5: this.customFrostingColor || pop.frosting,        // frosting
      6: this.customSprinkleColor || pop.sprinkle,        // sprinkle
      7: '#ffffff',                                       // eye white
      8: '#ff9999'                                        // cheek pink
    };
  }

  // Advance animation frame + blink logic
  update() {
    this.currentFrame = (this.currentFrame + 1) % 4;
    this.currentBob = BOB_OFFSETS[this.currentFrame] * this.scale;

    this.blinkTimer++;
    if (this.isBlinking) {
      if (this.blinkTimer > 4) {
        this.isBlinking = false;
        this.blinkTimer = 0;
      }
    } else {
      if (this.blinkTimer > 80 && Math.random() < 0.08) {
        this.isBlinking = true;
        this.blinkTimer = 0;
      }
    }
  }

  // Helper to find the actual height of visible (non-zero) rows in a grid
  getVisibleHeight(grid) {
    for (let r = grid.length - 1; r >= 0; r--) {
      if (grid[r].some(val => val !== 0)) {
        return r + 1;
      }
    }
    return grid.length;
  }

  // Generic grid renderer – draws a 2D number array at canvas position (ox,oy)
  drawGrid(ctx, grid, ox, oy, colorMap) {
    const s = this.scale;
    for (let r = 0; r < grid.length; r++) {
      const row = grid[r];
      for (let c = 0; c < row.length; c++) {
        const idx = row[c];
        if (idx === 0) continue;
        const hex = colorMap[idx];
        if (!hex) continue;
        ctx.fillStyle = hex;
        ctx.fillRect(ox + c * s, oy + r * s, s+0.5, s+0.5);
      }
    }
  }

  // Compose and render the complete Nyan Cat
  draw(ctx) {
    const colors = this.getColorMap();
    const s = this.scale;
    const frame = this.currentFrame;
    const bob = this.currentBob;

    // Poptart anchor position (with bob)
    const px = this.x;
    const py = this.y + bob;

    // --- 1. Draw Tail (behind everything) ---
    const ta = TAIL_ANIM[frame];
    const tailGrid = TAIL_SHAPE_LIST[ta.shape];
    this.drawGrid(ctx, tailGrid, px + ta.dx * s, py + ta.dy * s, colors);

    // --- 2. Draw Legs (below poptart, bob with body) ---
    // LEG_ANIM[frame] contains the actual grid for each of the 4 legs:
    // index order: [BACK_2, BACK_1, FRONT_2, FRONT_1] (left → right)
    // Both X and Y offsets mirror the circular head movement pattern.
    const legFrameGrids = LEG_ANIM[frame];
    const legOffX = LEG_X_OFFSETS[frame] * s;
    const legOffY = LEG_Y_OFFSETS[frame] * s;
    for (let i = 0; i < 4; i++) {
      const legGrid = legFrameGrids[i];
      this.drawGrid(
        ctx, legGrid,
        px + LEG_DX[i] * s + legOffX,
        py + (POPTART.length - 2)* s + legOffY ,
        colors
      );
    }

    // --- 3. Draw Pop-Tart Body (main visual, covers tail overlap) ---
    this.drawGrid(ctx, POPTART, px, py, colors);

    // --- 4. Draw Cat Head (on top, partially overlapping poptart right) ---
    const headGrid = this.isBlinking ? HEAD_BLINK : HEAD_OPEN;
    // Align bottom of head with bottom of poptart body dynamically (POPTART.length - visibleHeadHeight)
    // plus HEAD_DY acting as the fine-tuning vertical offset
    const visibleHeadHeight = this.getVisibleHeight(headGrid);
    const finalHeadDy = (POPTART.length - visibleHeadHeight) + HEAD_DY;
    this.drawGrid(ctx, headGrid, px + (HEAD_DX + HEAD_X_OFFSETS[frame]) * s, py + finalHeadDy * s, colors);
  }
}


// ===================================================================
// 4. SPARKLE STARFIELD BACKGROUND
// ===================================================================
class SparkleStarfield {
  constructor(width, height, density = 40) {
    this.width = width;
    this.height = height;
    this.maxStars = density;
    this.stars = [];
    this.init();
  }

  init() {
    this.stars = [];
    for (let i = 0; i < this.maxStars; i++) {
      this.stars.push(this.createStar(true));
    }
  }

  createStar(randomX = false) {
    const types = ['dot', 'cross', 'large'];
    return {
      x: randomX ? Math.random() * this.width : this.width + Math.random() * 40,
      y: Math.random() * this.height,
      speed: Math.random() * 3 + 2,
      type: types[Math.floor(Math.random() * types.length)],
      twinkleFrame: Math.floor(Math.random() * 6),
      color: Math.random() > 0.3 ? '#ffffff' : '#ffffcc'
    };
  }

  update(scrollSpeed = 4) {
    this.stars.forEach(star => {
      star.x -= star.speed * (scrollSpeed / 4);
      if (Math.random() < 0.15) {
        star.twinkleFrame = (star.twinkleFrame + 1) % 6;
      }
    });
    // Recycle off-screen stars
    this.stars = this.stars.filter(s => s.x > -20);
    while (this.stars.length < this.maxStars) {
      this.stars.push(this.createStar(false));
    }
  }

  draw(ctx, pixelSize = 4) {
    const s = pixelSize;
    this.stars.forEach(star => {
      ctx.fillStyle = star.color;
      if (star.type === 'dot') {
        ctx.fillRect(star.x, star.y, s, s);
      } else if (star.type === 'cross') {
        if (star.twinkleFrame % 2 === 0) {
          // Cross +
          ctx.fillRect(star.x,     star.y,     s, s);
          ctx.fillRect(star.x - s, star.y,     s, s);
          ctx.fillRect(star.x + s, star.y,     s, s);
          ctx.fillRect(star.x,     star.y - s, s, s);
          ctx.fillRect(star.x,     star.y + s, s, s);
        } else {
          ctx.fillRect(star.x, star.y, s, s);
        }
      } else { // large
        if (star.twinkleFrame < 3) {
          // Full diamond sparkle
          ctx.fillRect(star.x,       star.y,       s, s);
          ctx.fillRect(star.x - s,   star.y,       s, s);
          ctx.fillRect(star.x + s,   star.y,       s, s);
          ctx.fillRect(star.x,       star.y - s,   s, s);
          ctx.fillRect(star.x,       star.y + s,   s, s);
          ctx.fillRect(star.x - 2*s, star.y,       s, s);
          ctx.fillRect(star.x + 2*s, star.y,       s, s);
          ctx.fillRect(star.x,       star.y - 2*s, s, s);
          ctx.fillRect(star.x,       star.y + 2*s, s, s);
        } else {
          // Smaller cross
          ctx.fillRect(star.x,     star.y,     s, s);
          ctx.fillRect(star.x - s, star.y,     s, s);
          ctx.fillRect(star.x + s, star.y,     s, s);
          ctx.fillRect(star.x,     star.y - s, s, s);
          ctx.fillRect(star.x,     star.y + s, s, s);
        }
      }
    });
  }
}


// ===================================================================
// 5. RAINBOW TRAIL
// ===================================================================
class RainbowTrail {
  constructor() {}

  draw(ctx, catX, catY, frame, scale, rainbowStyle) {
    const palette = PALETTES.rainbows[rainbowStyle] || PALETTES.rainbows.classic;
    const colors = palette.colors;         // 6 colors
    const stripeH = 2 * scale;             // Each stripe is 2 pixel-units tall
    const segW    = 6 * scale;             // Width of each horizontal wave segment

    // Căn giữa cầu vồng theo trục Y của thân mèo (giả định thân mèo cao 18 pixel-units)
    const centerY = catY + (18 / 2) * scale; 

    // Điểm kết thúc của cầu vồng nối ngay sau đuôi mèo
    const endX = catX + 1 * scale;

    for (let x = 0; x < endX; x += segW) {
      // Xác định vị trí của khối segment hiện tại trên trục X
      const segmentIndex = Math.floor(x / segW);

      // Nhịp độ animation: Cứ mỗi 4 frame thì giá trị này mới tăng lên 1
      const animationStep = Math.floor(frame / 4);

      // Tạo hiệu ứng lượn sóng blocky: xen kẽ lên/xuống (0 hoặc 1)
      const isUp = Math.abs((segmentIndex - animationStep) % 2) === 0;
      
      // Tính độ lệch Y: nếu isUp = true thì lệch 0, ngược lại thì tụt xuống 1 pixel-unit
      const waveY = (isUp ? 0 : 1) * scale;
      
      const baseY = centerY - 6 * scale + waveY;

      for (let i = 0; i < 6; i++) {
        ctx.fillStyle = colors[i];
        ctx.fillRect(x, baseY + i * stripeH, segW + 1, stripeH);
      }
    }
  }
}


// ===================================================================
// 6. EXPORTS
// ===================================================================
if (typeof window !== 'undefined') {
  window.NyanCatModel = NyanCatModel;
  window.SparkleStarfield = SparkleStarfield;
  window.RainbowTrail = RainbowTrail;
  window.PALETTES = PALETTES;
  window.POPTART_H = POPTART_H;
  window.SPRITE_W = SPRITE_W;
  window.SPRITE_H = SPRITE_H;
}
