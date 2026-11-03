import { PALETTE } from './constants';
import { EggKind } from './types';

export interface WolfOptions {
  basketEggs: number;
  mood: 'idle' | 'happy' | 'sad';
  moving: boolean;
}

const pathRoundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) => {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
};

const fillStroke = (ctx: CanvasRenderingContext2D, fill: string, stroke: string, lineWidth = 2.5) => {
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
};

const ellipse = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radiusX: number,
  radiusY: number,
  rotation = 0,
) => {
  ctx.beginPath();
  ctx.ellipse(x, y, radiusX, radiusY, rotation, 0, Math.PI * 2);
};

export const drawHen = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  bounce: number,
) => {
  const bob = Math.sin(time * 2.2 + x * 0.02) * 1.2 - bounce * 5;

  ctx.save();
  ctx.translate(x, y + bob);

  ellipse(ctx, 0, 17, 30, 9);
  fillStroke(ctx, PALETTE.straw, PALETTE.inkSoft, 2);

  ctx.strokeStyle = PALETTE.inkSoft;
  ctx.lineWidth = 1.4;
  for (let index = -2; index <= 2; index += 1) {
    ctx.beginPath();
    ctx.moveTo(index * 9 - 7, 15);
    ctx.lineTo(index * 9 + 7, 20);
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.moveTo(-16, -4);
  ctx.lineTo(-34, -17);
  ctx.lineTo(-29, 1);
  ctx.lineTo(-18, 5);
  ctx.closePath();
  fillStroke(ctx, PALETTE.creamDark, PALETTE.ink, 2.2);

  ellipse(ctx, 0, 0, 22, 16);
  fillStroke(ctx, PALETTE.cream, PALETTE.ink, 2.6);

  ellipse(ctx, -2, 2, 12, 8);
  fillStroke(ctx, PALETTE.creamDark, PALETTE.inkSoft, 1.5);

  ctx.beginPath();
  ctx.arc(16, -14, 10, 0, Math.PI * 2);
  fillStroke(ctx, PALETTE.cream, PALETTE.ink, 2.4);

  ctx.beginPath();
  ctx.arc(11, -23, 3.5, 0, Math.PI * 2);
  ctx.arc(16, -25, 3.8, 0, Math.PI * 2);
  ctx.arc(21, -23, 3.5, 0, Math.PI * 2);
  fillStroke(ctx, PALETTE.red, PALETTE.ink, 1.2);

  ctx.beginPath();
  ctx.moveTo(25, -15);
  ctx.lineTo(35, -11);
  ctx.lineTo(25, -7);
  ctx.closePath();
  fillStroke(ctx, PALETTE.gold, PALETTE.ink, 1.6);

  ellipse(ctx, 24, -4, 3.2, 4.2);
  fillStroke(ctx, PALETTE.red, PALETTE.ink, 1.2);

  ctx.beginPath();
  ctx.arc(20, -17, 1.7, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.ink;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(20.6, -17.7, 0.6, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.white;
  ctx.fill();

  ctx.restore();
};

export const drawEgg = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  kind: EggKind,
  phase: number,
) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.sin(time * 3.4 + phase) * 0.12);

  if (kind === 'bomb') {
    ctx.beginPath();
    ctx.moveTo(2, -10);
    ctx.quadraticCurveTo(6, -18, 11, -21);
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(12, -22, 3.6, 0, Math.PI * 2);
    ctx.fillStyle = PALETTE.red;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(13, -23, 1.3, 0, Math.PI * 2);
    ctx.fillStyle = PALETTE.goldLight;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, 12.5, 0, Math.PI * 2);
    fillStroke(ctx, PALETTE.grayDark, PALETTE.ink, 2.6);

    ellipse(ctx, -4, -4, 3.5, 4.5, -0.5);
    ctx.fillStyle = PALETTE.gray;
    ctx.fill();
  } else {
    const golden = kind === 'gold';
    ellipse(ctx, 0, 0, 10, 13);
    fillStroke(ctx, golden ? PALETTE.goldLight : PALETTE.cream, PALETTE.ink, 2.4);

    ellipse(ctx, -3.3, -4, 2.8, 4.2, -0.45);
    ctx.fillStyle = PALETTE.white;
    ctx.fill();

    ctx.fillStyle = golden ? PALETTE.gold : PALETTE.creamDark;
    ctx.beginPath();
    ctx.arc(4, 1, 1.7, 0, Math.PI * 2);
    ctx.arc(-3, 6, 1.3, 0, Math.PI * 2);
    ctx.fill();

    if (golden) {
      ctx.strokeStyle = PALETTE.white;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-7, 4);
      ctx.lineTo(-4, 4);
      ctx.moveTo(-5.5, 2.5);
      ctx.lineTo(-5.5, 5.5);
      ctx.stroke();
    }
  }

  ctx.restore();
};

export const drawWolf = (
  ctx: CanvasRenderingContext2D,
  x: number,
  basketTop: number,
  time: number,
  options: WolfOptions,
) => {
  const walkBob = options.moving ? Math.sin(time * 13) * 1.8 : Math.sin(time * 2.4) * 1.2;
  const tailSwing = Math.sin(time * (options.moving ? 10 : 3)) * 0.22;

  ctx.save();
  ctx.translate(x, basketTop + walkBob);

  ellipse(ctx, 0, 51, 42, 8);
  ctx.fillStyle = 'rgba(38, 51, 31, 0.16)';
  ctx.fill();

  ctx.save();
  ctx.translate(-22, -35);
  ctx.rotate(tailSwing);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-30, -10, -36, -34);
  ctx.quadraticCurveTo(-18, -26, 5, -9);
  ctx.closePath();
  fillStroke(ctx, PALETTE.grayDark, PALETTE.ink, 2.3);
  ctx.restore();

  pathRoundRect(ctx, -25, -59, 50, 72, 18);
  fillStroke(ctx, PALETTE.gray, PALETTE.ink, 2.7);

  ellipse(ctx, 0, -20, 15, 24);
  fillStroke(ctx, PALETTE.creamDark, PALETTE.inkSoft, 1.6);

  ctx.beginPath();
  ctx.moveTo(-22, -88);
  ctx.lineTo(-19, -111);
  ctx.lineTo(-2, -91);
  ctx.closePath();
  fillStroke(ctx, PALETTE.grayDark, PALETTE.ink, 2.4);

  ctx.beginPath();
  ctx.moveTo(22, -88);
  ctx.lineTo(19, -111);
  ctx.lineTo(2, -91);
  ctx.closePath();
  fillStroke(ctx, PALETTE.grayDark, PALETTE.ink, 2.4);

  ctx.beginPath();
  ctx.moveTo(-17, -94);
  ctx.lineTo(-16, -105);
  ctx.lineTo(-7, -94);
  ctx.closePath();
  fillStroke(ctx, PALETTE.creamDark, PALETTE.inkSoft, 1.1);

  ctx.beginPath();
  ctx.moveTo(17, -94);
  ctx.lineTo(16, -105);
  ctx.lineTo(7, -94);
  ctx.closePath();
  fillStroke(ctx, PALETTE.creamDark, PALETTE.inkSoft, 1.1);

  ellipse(ctx, 0, -78, 27, 22);
  fillStroke(ctx, PALETTE.gray, PALETTE.ink, 2.7);

  ellipse(ctx, 0, -67, 16, 13);
  fillStroke(ctx, PALETTE.cream, PALETTE.ink, 2.2);

  ellipse(ctx, 0, -71, 6.2, 4.6);
  fillStroke(ctx, PALETTE.ink, PALETTE.ink, 1);

  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(0, -66);
  ctx.lineTo(0, -62);
  ctx.moveTo(0, -62);
  ctx.quadraticCurveTo(-5, -58, -9, -62);
  ctx.moveTo(0, -62);
  ctx.quadraticCurveTo(5, -58, 9, -62);
  ctx.stroke();

  const eyeY = -84;
  if (options.mood === 'happy') {
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(-11, eyeY + 2, 5, Math.PI * 1.12, Math.PI * 1.88);
    ctx.arc(11, eyeY + 2, 5, Math.PI * 1.12, Math.PI * 1.88);
    ctx.stroke();
  } else {
    const look = options.mood === 'sad' ? -2 : 0;
    [-11, 11].forEach((eyeX) => {
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, 5.2, 0, Math.PI * 2);
      fillStroke(ctx, PALETTE.white, PALETTE.ink, 1.6);

      ctx.beginPath();
      ctx.arc(eyeX + 1, eyeY + look, 2.1, 0, Math.PI * 2);
      ctx.fillStyle = PALETTE.ink;
      ctx.fill();
    });

    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (options.mood === 'sad') {
      ctx.moveTo(-17, eyeY - 8);
      ctx.lineTo(-6, eyeY - 4);
      ctx.moveTo(17, eyeY - 8);
      ctx.lineTo(6, eyeY - 4);
    } else {
      ctx.moveTo(-17, eyeY - 7);
      ctx.lineTo(-6, eyeY - 9);
      ctx.moveTo(17, eyeY - 7);
      ctx.lineTo(6, eyeY - 9);
    }
    ctx.stroke();
  }

  pathRoundRect(ctx, -44, -31, 19, 38, 8);
  fillStroke(ctx, PALETTE.gray, PALETTE.ink, 2.3);
  pathRoundRect(ctx, 25, -31, 19, 38, 8);
  fillStroke(ctx, PALETTE.gray, PALETTE.ink, 2.3);

  for (let index = 0; index < options.basketEggs; index += 1) {
    const eggX = (index - (options.basketEggs - 1) / 2) * 17;
    ellipse(ctx, eggX, -3, 8, 9);
    fillStroke(ctx, PALETTE.cream, PALETTE.ink, 1.8);
  }

  ctx.beginPath();
  ctx.moveTo(-42, 0);
  ctx.lineTo(42, 0);
  ctx.lineTo(32, 39);
  ctx.lineTo(-32, 39);
  ctx.closePath();
  fillStroke(ctx, '#b0894f', PALETTE.ink, 2.6);

  ctx.strokeStyle = PALETTE.inkSoft;
  ctx.lineWidth = 1.2;
  for (let lineY = 9; lineY <= 29; lineY += 10) {
    ctx.beginPath();
    ctx.moveTo(-38 + lineY * 0.12, lineY);
    ctx.lineTo(38 - lineY * 0.12, lineY);
    ctx.stroke();
  }
  for (let lineX = -24; lineX <= 24; lineX += 16) {
    ctx.beginPath();
    ctx.moveTo(lineX - 5, 3);
    ctx.lineTo(lineX + 4, 36);
    ctx.stroke();
  }

  pathRoundRect(ctx, -46, -7, 92, 14, 6);
  fillStroke(ctx, '#c49a5b', PALETTE.ink, 2.4);

  ctx.strokeStyle = PALETTE.white;
  ctx.lineWidth = 1.2;
  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  ctx.moveTo(-36, -3);
  ctx.lineTo(34, -3);
  ctx.stroke();
  ctx.globalAlpha = 1;

  ellipse(ctx, -40, -1, 6, 4.5);
  fillStroke(ctx, PALETTE.cream, PALETTE.ink, 1.5);
  ellipse(ctx, 40, -1, 6, 4.5);
  fillStroke(ctx, PALETTE.cream, PALETTE.ink, 1.5);

  ctx.restore();
};
