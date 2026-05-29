/**
 * Nyan Cat Widescreen Screen Decorator & Exporter
 * PIXEL-ACCURATE REMAKE — Core Rendering Engine & Sprites (React ES Module)
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
export const PALETTES = {
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
// 2. PIXEL-ACCURATE DEFAULT SPRITE DATA
// ===================================================================

export const DEFAULT_SPRITES = {
  // Pop-Tart Body (23 wide × 18 tall, rendered as POPTART_W x POPTART_H i.e. 21x12 inner window of pixel values)
  POPTART: [
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
    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0]
  ],
  HEAD_OPEN: [
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
    [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0]
  ],
  HEAD_BLINK: [
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
    [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0]
  ],
  LEG_DOWN: [[1,1,1],[1,2,1],[1,2,1]],
  LEG_FRONT: [[1,1,1],[1,2,1],[0,1,1]],
  LEG_BACK: [[1,1,1],[1,2,1],[1,1,0]],
  TAIL_UP: [
    [1,1,1,1,0,0],
    [1,2,2,1,1,0],
    [1,1,2,2,1,1],
    [0,1,1,2,2,1],
    [0,0,1,1,2,2],
    [0,0,0,1,1,1],
    [0,0,0,0,0,1]
  ],
  TAIL_MID: [
    [1,1,1,1,1,0,0],
    [1,2,2,2,1,1,1],
    [1,1,1,2,2,2,1],
    [0,0,1,1,1,1,2],
    [0,0,0,0,0,1,1]
  ],
  TAIL_DOWN: [
    [0,0,0,0,0,1],
    [0,1,1,1,1,1],
    [1,1,2,2,2,2],
    [1,2,2,2,1,1],
    [0,1,1,1,1,0]
  ]
};

// Positioning configs for drawing
export const LEG_DX = [3, 7, 13, 17];
export const LEG_X_OFFSETS = [-1, 1, -1, 1];
export const HEAD_X_OFFSETS = [-1, 0, 1, 0];
export const LEG_ANIM = [
  [1, 2, 2, 1],  // Frame 0: alternating kicks (1 = LEG_FRONT, 2 = LEG_BACK)
  [0, 0, 0, 0],  // Frame 1: all down (0 = LEG_DOWN)
  [2, 1, 1, 2],  // Frame 2: reverse alternation
  [0, 0, 0, 0]   // Frame 3: all down
];

export const TAIL_ANIM = [
  { shape: 'TAIL_UP', dx: -6, dy: 6 },
  { shape: 'TAIL_MID', dx: -5, dy: 8 },
  { shape: 'TAIL_DOWN', dx: -6, dy: 9 },
  { shape: 'TAIL_MID', dx: -5, dy: 8 }
];

export const BOB_OFFSETS = [0, -1, 0, 1];

export const POPTART_W = 21;
export const POPTART_H = 12;
export const SPRITE_W = 34;
export const SPRITE_H = 17;

// ===================================================================
// 3. NYAN CAT MODEL CLASS
// ===================================================================
export class NyanCatModel {
  constructor(options = {}) {
    this.scale = options.scale || 6;
    this.x = options.x || 100;
    this.y = options.y || 150;

    // Customization
    this.skinStyle = options.skinStyle || 'classic';
    this.poptartStyle = options.poptartStyle || 'strawberry';
    
    // Custom color hexes (for palette editor integration)
    this.customSkinColor = null;
    this.customSkinShadow = null;
    this.customCrustColor = null;
    this.customFrostingColor = null;
    this.customSprinkleColor = null;

    // Active animation frame
    this.currentFrame = 0;
    this.blinkTimer = 0;
    this.isBlinking = false;
    this.currentBob = 0;

    // Dimensions
    this.width = SPRITE_W * this.scale;
    this.height = SPRITE_H * this.scale;
    
    // Custom parts mapping object (holds 2D array mappings)
    this.customPartsMapping = options.customPartsMapping || {};
    this.customParts = options.customParts || {};
    this.bindings = options.bindings || {};
    this.liveEditingPalette = null;
    this.headDx = options.headDx !== undefined ? options.headDx : 12;
    this.headDy = options.headDy !== undefined ? options.headDy : 0;
  }

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

  getVisibleHeight(grid) {
    if (!grid || !grid.length) return 0;
    for (let r = grid.length - 1; r >= 0; r--) {
      if (grid[r] && grid[r].some(val => val !== 0)) {
        return r + 1;
      }
    }
    return grid.length;
  }

  drawGrid(ctx, grid, ox, oy, colorMap) {
    if (!grid) return;
    const s = this.scale;
    for (let r = 0; r < grid.length; r++) {
      const row = grid[r];
      if (!row) continue;
      for (let c = 0; c < row.length; c++) {
        const idx = row[c];
        if (idx === 0) continue;
        const hex = colorMap[idx];
        if (!hex) continue;
        ctx.fillStyle = hex;
        ctx.fillRect(ox + c * s, oy + r * s, s + 0.5, s + 0.5);
      }
    }
  }

  draw(ctx) {
    const colors = this.getColorMap();
    const s = this.scale;
    const frame = this.currentFrame;
    const bob = this.currentBob;

    const px = this.x;
    const py = this.y + bob;

    // Helper to get color map for a specific slot/part
    const getColorsForSlot = (slotKey) => {
      // Prioritize live editing palette if it matches the slot we are rendering
      if (this.liveEditingPalette && this.liveEditingPalette.palette) {
        // Find if this live editing part key matches our slot key via bindings
        const bindingKey = this.bindings ? this.bindings[slotKey] : null;
        if (bindingKey === this.liveEditingPalette.key) {
          return { ...colors, ...this.liveEditingPalette.palette };
        }
      }
      
      const partKey = this.bindings ? this.bindings[slotKey] : null;
      if (partKey && partKey !== 'default' && this.customParts && this.customParts[partKey]) {
        const customPart = this.customParts[partKey];
        if (customPart.palette) {
          return { ...colors, ...customPart.palette };
        }
      }
      return colors;
    };

    // --- 1. Draw Tail ---
    const ta = TAIL_ANIM[frame];
    const tailGrid = this.customPartsMapping[ta.shape] || DEFAULT_SPRITES[ta.shape];
    const tailColors = getColorsForSlot(ta.shape);
    this.drawGrid(ctx, tailGrid, px + ta.dx * s, py + ta.dy * s, tailColors);

    // --- 2. Draw Legs ---
    const legAnim = LEG_ANIM[frame];
    const legKeys = ['LEG_DOWN', 'LEG_FRONT', 'LEG_BACK'];
    const legXOffsets = [-1, 1, -1, 1];
    for (let i = 0; i < 4; i++) {
      const key = legKeys[legAnim[i]];
      const legGrid = this.customPartsMapping[key] || DEFAULT_SPRITES[key];
      const legColors = getColorsForSlot(key);
      this.drawGrid(ctx, legGrid, px + (LEG_DX[i] + legXOffsets[frame]) * s, py + DEFAULT_SPRITES.POPTART.length * s, legColors);
    }

    // --- 3. Draw Pop-Tart Body ---
    const popGrid = this.customPartsMapping.POPTART || DEFAULT_SPRITES.POPTART;
    const popColors = getColorsForSlot('POPTART');
    this.drawGrid(ctx, popGrid, px, py, popColors);

    // --- 4. Draw Cat Head ---
    const activeHeadKey = this.isBlinking ? 'HEAD_BLINK' : 'HEAD_OPEN';
    const headGrid = this.customPartsMapping[activeHeadKey] || DEFAULT_SPRITES[activeHeadKey];
    const headColors = getColorsForSlot(activeHeadKey);
    
    const visibleHeadHeight = this.getVisibleHeight(headGrid);
    const finalHeadDy = (DEFAULT_SPRITES.POPTART.length - visibleHeadHeight) + this.headDy;
    const headXOffsets = [-1, 0, 1, 0];
    this.drawGrid(ctx, headGrid, px + (this.headDx + headXOffsets[frame]) * s, py + finalHeadDy * s, headColors);
  }
}

// ===================================================================
// 4. SPARKLE STARFIELD BACKGROUND
// ===================================================================
export class SparkleStarfield {
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
          ctx.fillRect(star.x,     star.y,     s, s);
          ctx.fillRect(star.x - s, star.y,     s, s);
          ctx.fillRect(star.x + s, star.y,     s, s);
          ctx.fillRect(star.x,     star.y - s, s, s);
          ctx.fillRect(star.x,     star.y + s, s, s);
        } else {
          ctx.fillRect(star.x, star.y, s, s);
        }
      } else {
        if (star.twinkleFrame < 3) {
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
export class RainbowTrail {
  draw(ctx, catX, catY, frame, scale, rainbowStyle) {
    const palette = PALETTES.rainbows[rainbowStyle] || PALETTES.rainbows.classic;
    const colors = palette.colors;
    const stripeH = 2 * scale;
    const segW    = 3 * scale;

    const centerY = catY + (DEFAULT_SPRITES.POPTART.length / 2) * scale;
    const endX = catX + 1 * scale;

    for (let x = 0; x < endX; x += segW) {
      const waveY = Math.sin(x * 0.025 - frame * 0.4) * 2 * scale;
      const baseY = centerY - 6 * scale + waveY;

      for (let i = 0; i < 6; i++) {
        ctx.fillStyle = colors[i];
        ctx.fillRect(x, baseY + i * stripeH, segW + 1, stripeH);
      }
    }
  }
}
