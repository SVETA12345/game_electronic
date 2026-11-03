import {
  CATCH_Y,
  FIELD_HEIGHT,
  FIELD_WIDTH,
  GROUND_Y,
  HEN_Y,
  LANE_CENTERS,
  LANE_COUNT,
  LEVEL_STEP,
  MAX_LEVEL,
  PALETTE,
  PLAYER_Y,
  SCORE_PER_EGG,
  SCORE_PER_GOLD,
  SPAWN_Y,
  START_LIVES,
} from './constants';
import { drawEgg, drawHen, drawWolf } from './sprites';
import { Egg, EggKind, EngineCallbacks, FloatingLabel, GameMode, GamePhase, Particle } from './types';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);

export class GameEngine {
  phase: GamePhase = 'idle';

  private callbacks: EngineCallbacks;

  private mode: GameMode = 'classic';

  private score = 0;

  private lives = START_LIVES;

  private level = 1;

  private playerLane = 1;

  private playerX = LANE_CENTERS[1];

  private targetX = LANE_CENTERS[1];

  private eggs: Egg[] = [];

  private particles: Particle[] = [];

  private labels: FloatingLabel[] = [];

  private henBounce = [0, 0, 0, 0];

  private time = 0;

  private spawnTimer = 1;

  private shake = 0;

  private flash = 0;

  private basketEggs = 0;

  private mood: 'idle' | 'happy' | 'sad' = 'idle';

  private moodTimer = 0;

  private nextId = 1;

  constructor(callbacks: EngineCallbacks) {
    this.callbacks = callbacks;
  }

  setMode(mode: GameMode) {
    this.mode = mode;
  }

  start() {
    this.score = 0;
    this.lives = START_LIVES;
    this.level = 1;
    this.playerLane = 1;
    this.playerX = LANE_CENTERS[1];
    this.targetX = LANE_CENTERS[1];
    this.eggs = [];
    this.particles = [];
    this.labels = [];
    this.henBounce = [0, 0, 0, 0];
    this.spawnTimer = 0.65;
    this.shake = 0;
    this.flash = 0;
    this.basketEggs = 0;
    this.mood = 'idle';
    this.moodTimer = 0;
    this.phase = 'running';

    this.callbacks.onScore(this.score);
    this.callbacks.onLives(this.lives);
    this.callbacks.onLevel(this.level);
    this.callbacks.onSound('start');
  }

  toMenu() {
    this.phase = 'idle';
    this.score = 0;
    this.lives = START_LIVES;
    this.level = 1;
    this.playerLane = 1;
    this.playerX = LANE_CENTERS[1];
    this.targetX = LANE_CENTERS[1];
    this.eggs = [];
    this.particles = [];
    this.labels = [];
    this.henBounce = [0, 0, 0, 0];
    this.shake = 0;
    this.flash = 0;
    this.basketEggs = 0;
    this.mood = 'idle';
    this.moodTimer = 0;

    this.callbacks.onScore(0);
    this.callbacks.onLives(START_LIVES);
    this.callbacks.onLevel(1);
  }

  pause() {
    if (this.phase === 'running') {
      this.phase = 'paused';
    }
  }

  resume() {
    if (this.phase === 'paused') {
      this.phase = 'running';
    }
  }

  moveLeft() {
    this.move(-1);
  }

  moveRight() {
    this.move(1);
  }

  tick(deltaSeconds: number) {
    const delta = clamp(deltaSeconds, 0, 0.05);

    if (this.phase === 'idle') {
      this.time += delta;
      this.decayHenBounce(delta);
      return;
    }

    if (this.phase !== 'running') {
      return;
    }

    this.time += delta;
    this.update(delta);
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, FIELD_WIDTH, FIELD_HEIGHT);
    this.drawBackground(ctx);

    ctx.save();
    if (this.shake > 0) {
      const power = this.shake * 8;
      ctx.translate(randomBetween(-power, power), randomBetween(-power, power));
    }

    this.drawLaneGuides(ctx);
    this.drawHens(ctx);
    this.drawEggs(ctx);
    this.drawPlayer(ctx);
    this.drawParticles(ctx);
    this.drawLabels(ctx);
    ctx.restore();

    this.drawScreenEffects(ctx);
  }

  private move(direction: number) {
    if (this.phase !== 'running') {
      return;
    }
    this.playerLane = clamp(this.playerLane + direction, 0, LANE_COUNT - 1);
    this.targetX = LANE_CENTERS[this.playerLane];
  }

  private update(delta: number) {
    const easing = Math.min(1, delta * 14);
    this.playerX += (this.targetX - this.playerX) * easing;
    if (Math.abs(this.targetX - this.playerX) < 0.2) {
      this.playerX = this.targetX;
    }

    this.decayHenBounce(delta);

    if (this.moodTimer > 0) {
      this.moodTimer -= delta;
      if (this.moodTimer <= 0) {
        this.mood = 'idle';
      }
    }

    this.spawnTimer -= delta;
    if (this.spawnTimer <= 0) {
      this.spawnEgg();
    }

    this.updateEggs(delta);
    this.updateParticles(delta);
    this.updateLabels(delta);

    this.shake = Math.max(0, this.shake - delta * 3.2);
    this.flash = Math.max(0, this.flash - delta * 2.4);
  }

  private decayHenBounce(delta: number) {
    for (let index = 0; index < this.henBounce.length; index += 1) {
      this.henBounce[index] = Math.max(0, this.henBounce[index] - delta * 4.5);
    }
  }

  private spawnEgg() {
    const bombChance = this.mode === 'classic' ? Math.min(0.32, 0.06 + (this.level - 1) * 0.035) : 0;
    const goldChance = 0.07;
    const roll = Math.random();

    let kind: EggKind = 'egg';
    if (bombChance > 0 && roll < bombChance) {
      kind = 'bomb';
    } else if (roll < bombChance + goldChance) {
      kind = 'gold';
    }

    const lane = this.pickLane();
    const speed = 112 + (this.level - 1) * 13 + Math.random() * 34;

    this.eggs.push({
      id: this.nextId,
      lane,
      y: SPAWN_Y,
      speed,
      kind,
      wobble: randomBetween(-2.4, 2.4),
      phase: Math.random() * Math.PI * 2,
      checked: false,
    });
    this.nextId += 1;
    this.henBounce[lane] = 1;

    const baseInterval = Math.max(0.42, 1.06 - (this.level - 1) * 0.07);
    this.spawnTimer = baseInterval * randomBetween(0.82, 1.2);
  }

  private pickLane() {
    const freeLanes: number[] = [];
    for (let lane = 0; lane < LANE_COUNT; lane += 1) {
      const busy = this.eggs.some((egg) => egg.lane === lane && egg.y < SPAWN_Y + 95);
      if (!busy) {
        freeLanes.push(lane);
      }
    }

    const pool = freeLanes.length > 0 ? freeLanes : [0, 1, 2, 3];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  private updateEggs(delta: number) {
    for (let index = this.eggs.length - 1; index >= 0; index -= 1) {
      const egg = this.eggs[index];
      egg.y += egg.speed * delta;

      if (!egg.checked && egg.y + 12 >= CATCH_Y) {
        if (egg.lane === this.playerLane) {
          this.eggs.splice(index, 1);
          this.collectEgg(egg);
          continue;
        }
        egg.checked = true;
      }

      if (egg.y > FIELD_HEIGHT + 16) {
        this.eggs.splice(index, 1);
        if (egg.kind === 'bomb') {
          this.spawnBurst(LANE_CENTERS[egg.lane], FIELD_HEIGHT - 12, PALETTE.gray, 5, false);
        } else {
          this.loseEgg(egg);
        }
      }
    }
  }

  private collectEgg(egg: Egg) {
    const x = LANE_CENTERS[egg.lane];

    if (egg.kind === 'bomb') {
      this.spawnBurst(x, CATCH_Y - 14, PALETTE.inkSoft, 16, true);
      this.addLabel(x, CATCH_Y - 34, '-1 ЖИЗНЬ', PALETTE.redDark);
      this.shake = 0.45;
      this.flash = 0.55;
      this.mood = 'sad';
      this.moodTimer = 0.9;
      this.callbacks.onSound('bomb');
      this.loseLife();
      return;
    }

    const golden = egg.kind === 'gold';
    const points = golden ? SCORE_PER_GOLD : SCORE_PER_EGG;
    this.score += points;
    this.basketEggs = Math.min(3, this.basketEggs + 1);
    this.mood = 'happy';
    this.moodTimer = 0.45;

    this.callbacks.onScore(this.score);
    this.callbacks.onSound(golden ? 'gold' : 'catch');

    this.spawnBurst(x, CATCH_Y - 8, golden ? PALETTE.gold : PALETTE.cream, golden ? 18 : 10, false);
    this.addLabel(x, CATCH_Y - 38, `+${points}`, golden ? PALETTE.gold : PALETTE.ink);
    this.updateLevel();
  }

  private loseEgg(egg: Egg) {
    const x = LANE_CENTERS[egg.lane];
    const golden = egg.kind === 'gold';

    this.spawnBurst(x, FIELD_HEIGHT - 10, golden ? PALETTE.gold : PALETTE.red, golden ? 6 : 8, false);
    this.addLabel(x, GROUND_Y - 18, golden ? 'УПУСТИЛ' : '-1', golden ? PALETTE.gold : PALETTE.redDark);

    if (golden) {
      this.callbacks.onSound('goldmiss');
      return;
    }

    this.shake = 0.24;
    this.flash = 0.3;
    this.mood = 'sad';
    this.moodTimer = 0.8;
    this.callbacks.onSound('miss');
    this.loseLife();
  }

  private loseLife() {
    this.lives = Math.max(0, this.lives - 1);
    this.callbacks.onLives(this.lives);

    if (this.lives <= 0) {
      this.finishGame();
    }
  }

  private updateLevel() {
    const nextLevel = Math.min(MAX_LEVEL, 1 + Math.floor(this.score / LEVEL_STEP));
    if (nextLevel <= this.level) {
      return;
    }

    this.level = nextLevel;
    this.basketEggs = 0;
    this.flash = 0.18;
    this.callbacks.onLevel(this.level);

    if (this.level >= MAX_LEVEL) {
      this.finishGame(true);
      return;
    }

    this.callbacks.onSound('level');
    this.addLabel(FIELD_WIDTH / 2, 156, `УРОВЕНЬ ${this.level}`, PALETTE.ink);
  }

  private finishGame(won = false) {
    if (this.phase === 'over') {
      return;
    }

    this.phase = 'over';
    this.mood = won ? 'happy' : 'sad';
    this.callbacks.onGameOver(this.score, won);
    this.callbacks.onSound(won ? 'win' : 'gameover');
  }

  private spawnBurst(x: number, y: number, color: string, count: number, heavy: boolean) {
    for (let index = 0; index < count; index += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = randomBetween(heavy ? 60 : 35, heavy ? 210 : 145);
      const life = randomBetween(0.32, heavy ? 0.85 : 0.62);

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (heavy ? 40 : 15),
        size: randomBetween(2, heavy ? 5.5 : 4.2),
        life,
        maxLife: life,
        color,
        gravity: heavy ? 420 : 300,
      });
    }
  }

  private addLabel(x: number, y: number, text: string, color: string) {
    this.labels.push({
      x,
      y,
      text,
      color,
      life: 0.85,
      maxLife: 0.85,
    });
  }

  private updateParticles(delta: number) {
    for (let index = this.particles.length - 1; index >= 0; index -= 1) {
      const particle = this.particles[index];
      particle.life -= delta;
      if (particle.life <= 0) {
        this.particles.splice(index, 1);
        continue;
      }

      particle.x += particle.vx * delta;
      particle.y += particle.vy * delta;
      particle.vy += particle.gravity * delta;
    }
  }

  private updateLabels(delta: number) {
    for (let index = this.labels.length - 1; index >= 0; index -= 1) {
      const label = this.labels[index];
      label.life -= delta;
      if (label.life <= 0) {
        this.labels.splice(index, 1);
        continue;
      }
      label.y -= 24 * delta;
    }
  }

  private drawBackground(ctx: CanvasRenderingContext2D) {
    const gradient = ctx.createLinearGradient(0, 0, 0, FIELD_HEIGHT);
    gradient.addColorStop(0, PALETTE.screenLight);
    gradient.addColorStop(0.62, PALETTE.screen);
    gradient.addColorStop(1, PALETTE.screenDeep);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, FIELD_WIDTH, FIELD_HEIGHT);

    const glow = ctx.createRadialGradient(FIELD_WIDTH / 2, 32, 12, FIELD_WIDTH / 2, 32, 290);
    glow.addColorStop(0, 'rgba(255, 255, 255, 0.18)');
    glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, FIELD_WIDTH, FIELD_HEIGHT);

    ctx.fillStyle = 'rgba(38, 51, 31, 0.032)';
    for (let lineY = 0; lineY < FIELD_HEIGHT; lineY += 4) {
      ctx.fillRect(0, lineY, FIELD_WIDTH, 1);
    }

    ctx.fillStyle = 'rgba(38, 51, 31, 0.02)';
    for (let lineX = 0; lineX < FIELD_WIDTH; lineX += 6) {
      ctx.fillRect(lineX, 0, 1, FIELD_HEIGHT);
    }

    ctx.fillStyle = '#9bb97e';
    ctx.fillRect(0, GROUND_Y, FIELD_WIDTH, FIELD_HEIGHT - GROUND_Y);

    ctx.strokeStyle = PALETTE.inkSoft;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(FIELD_WIDTH, GROUND_Y);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(38, 51, 31, 0.28)';
    ctx.lineWidth = 1.6;
    for (let index = 0; index < 24; index += 1) {
      const grassX = index * 26 + (index % 3) * 7;
      const height = 5 + (index % 4) * 3;
      ctx.beginPath();
      ctx.moveTo(grassX, GROUND_Y + 8);
      ctx.lineTo(grassX - 4, GROUND_Y + 8 - height);
      ctx.moveTo(grassX, GROUND_Y + 8);
      ctx.lineTo(grassX + 3, GROUND_Y + 8 - height + 2);
      ctx.stroke();
    }
  }

  private drawLaneGuides(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.strokeStyle = 'rgba(38, 51, 31, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 12]);
    for (let lane = 1; lane < LANE_COUNT; lane += 1) {
      const guideX = (FIELD_WIDTH / LANE_COUNT) * lane;
      ctx.beginPath();
      ctx.moveTo(guideX, 122);
      ctx.lineTo(guideX, GROUND_Y - 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawHens(ctx: CanvasRenderingContext2D) {
    for (let lane = 0; lane < LANE_COUNT; lane += 1) {
      drawHen(ctx, LANE_CENTERS[lane], HEN_Y, this.time, this.henBounce[lane]);
    }
  }

  private drawEggs(ctx: CanvasRenderingContext2D) {
    this.eggs.forEach((egg) => {
      const x = LANE_CENTERS[egg.lane] + Math.sin(this.time * 2.2 + egg.phase) * egg.wobble;
      drawEgg(ctx, x, egg.y, this.time, egg.kind, egg.phase);
    });
  }

  private drawPlayer(ctx: CanvasRenderingContext2D) {
    const moving = Math.abs(this.targetX - this.playerX) > 1.5;
    drawWolf(ctx, this.playerX, PLAYER_Y, this.time, {
      basketEggs: this.basketEggs,
      mood: this.mood,
      moving,
    });
  }

  private drawParticles(ctx: CanvasRenderingContext2D) {
    this.particles.forEach((particle) => {
      ctx.globalAlpha = Math.max(0, particle.life / particle.maxLife);
      ctx.fillStyle = particle.color;
      ctx.fillRect(particle.x - particle.size / 2, particle.y - particle.size / 2, particle.size, particle.size);
    });
    ctx.globalAlpha = 1;
  }

  private drawLabels(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '800 17px "Courier New", monospace';

    this.labels.forEach((label) => {
      ctx.globalAlpha = Math.max(0, label.life / label.maxLife);
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(169, 195, 140, 0.85)';
      ctx.strokeText(label.text, label.x, label.y);
      ctx.fillStyle = label.color;
      ctx.fillText(label.text, label.x, label.y);
    });

    ctx.restore();
    ctx.globalAlpha = 1;
  }

  private drawScreenEffects(ctx: CanvasRenderingContext2D) {
    const vignette = ctx.createRadialGradient(
      FIELD_WIDTH / 2,
      FIELD_HEIGHT / 2,
      FIELD_HEIGHT * 0.25,
      FIELD_WIDTH / 2,
      FIELD_HEIGHT / 2,
      FIELD_WIDTH * 0.72,
    );
    vignette.addColorStop(0, 'rgba(38, 51, 31, 0)');
    vignette.addColorStop(1, 'rgba(38, 51, 31, 0.16)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, FIELD_WIDTH, FIELD_HEIGHT);

    if (this.flash > 0) {
      ctx.fillStyle = `rgba(191, 84, 54, ${this.flash * 0.28})`;
      ctx.fillRect(0, 0, FIELD_WIDTH, FIELD_HEIGHT);
    }

    if (this.phase === 'running' && this.lives === 1) {
      const pulse = 0.14 + Math.sin(this.time * 8) * 0.08;
      ctx.strokeStyle = `rgba(191, 84, 54, ${pulse})`;
      ctx.lineWidth = 7;
      ctx.strokeRect(4, 4, FIELD_WIDTH - 8, FIELD_HEIGHT - 8);
    }
  }
  public getPlayerX(): number {
    return this.playerX;
  }
}
