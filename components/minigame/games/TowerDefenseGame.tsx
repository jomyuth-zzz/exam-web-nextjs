"use client";

import { useEffect, useRef, useState } from "react";

/* ======================
   TYPES
====================== */
type Props = {
  onFinish: () => void;
};

type Enemy = {
  id: number;
  hp: number;
  pathIndex: number;
  progress: number;
};

type TowerType = "melee" | "range";

type Tower = {
  id: number;
  x: number;
  y: number;
  type: TowerType;
  range: number;
  damage: number;
  attackSpeed: number;
};

/* ======================
   CONFIG
====================== */
const GRID = 8;
const CELL = 38;

const TOTAL_TIME = 30;
const REQUIRED_KILLS = 6;

const ENEMY_HP = 35;
const ENEMY_SPEED = 0.18;

/* ===== PATH ===== */
const PATH = [
  { x: 0, y: 3 },
  { x: 1, y: 3 },
  { x: 2, y: 3 },
  { x: 3, y: 3 },
  { x: 3, y: 4 },
  { x: 3, y: 5 },
  { x: 4, y: 5 },
  { x: 5, y: 5 },
  { x: 6, y: 5 },
  { x: 7, y: 5 },
];

const TOWERS = {
  melee: { cost: 30, range: 1.4, damage: 6, speed: 250 },
  range: { cost: 45, range: 3.2, damage: 11, speed: 700 },
};

/* ======================
   COMPONENT
====================== */
export default function TowerDefenseGame({ onFinish }: Props) {
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [gold, setGold] = useState(80);
  const [kills, setKills] = useState(0);

  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [towers, setTowers] = useState<Tower[]>([]);
  const [selectedTower, setSelectedTower] =
    useState<TowerType | null>(null);

  const [hoverCell, setHoverCell] =
    useState<{ x: number; y: number } | null>(null);

  const enemyId = useRef(0);
  const towerId = useRef(0);
  const finished = useRef(false);

  /* ===== TIMER ===== */
  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft((v) => {
        if (v <= 1) {
          clearInterval(t);
          finish();
          return 0;
        }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  /* ===== SPAWN ===== */
  useEffect(() => {
    const spawn = setInterval(() => {
      setEnemies((e) => [
        ...e,
        {
          id: enemyId.current++,
          hp: ENEMY_HP,
          pathIndex: 0,
          progress: 0,
        },
      ]);
    }, 2200);
    return () => clearInterval(spawn);
  }, []);

  /* ===== MOVE ===== */
  useEffect(() => {
    const move = setInterval(() => {
      setEnemies((prev) =>
        prev
          .map((e) => {
            const p = e.progress + ENEMY_SPEED;
            if (p >= 1) {
              return {
                ...e,
                pathIndex: e.pathIndex + 1,
                progress: 0,
              };
            }
            return { ...e, progress: p };
          })
          .filter((e) => e.pathIndex < PATH.length - 1)
      );
    }, 100);
    return () => clearInterval(move);
  }, []);

  /* ===== ATTACK (FIXED: NO DOUBLE COUNT) ===== */
  useEffect(() => {
    const timer = setInterval(() => {
      setEnemies((prev) => {
        let killedThisTick = 0;

        const next = prev.map((enemy) => {
          const pos = PATH[enemy.pathIndex];

          const tower = towers.find((t) => {
            const d = Math.hypot(pos.x - t.x, pos.y - t.y);
            return d <= t.range;
          });

          if (!tower) return enemy;

          const hp = enemy.hp - tower.damage;

          if (hp <= 0) {
            killedThisTick += 1;
            return null;
          }

          return { ...enemy, hp };
        });

        if (killedThisTick > 0) {
          setKills((k) => k + killedThisTick);
          setGold((g) => g + killedThisTick * 6);
        }

        return next.filter(Boolean) as Enemy[];
      });
    }, 500);

    return () => clearInterval(timer);
  }, [towers]);

  useEffect(() => {
    if (kills >= REQUIRED_KILLS) finish();
  }, [kills]);

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    onFinish();
  };

  const placeTower = (x: number, y: number) => {
    if (!selectedTower) return;
    if (PATH.some((p) => p.x === x && p.y === y)) return;
    if (towers.some((t) => t.x === x && t.y === y)) return;

    const cfg = TOWERS[selectedTower];
    if (gold < cfg.cost) return;

    setGold((g) => g - cfg.cost);
    setTowers((t) => [
      ...t,
      {
        id: towerId.current++,
        x,
        y,
        type: selectedTower,
        range: cfg.range,
        damage: cfg.damage,
        attackSpeed: cfg.speed,
      },
    ]);
  };

  /* ===== UI ===== */
  return (
    <div className="space-y-2 text-center text-sm">
      <p>
        ⏳ {timeLeft}s | 🎯 {kills}/{REQUIRED_KILLS} | 💰 {gold}
      </p>

      <div
        className="mx-auto grid border"
        style={{
          width: GRID * CELL,
          gridTemplateColumns: `repeat(${GRID}, 1fr)`,
        }}
      >
        {Array.from({ length: GRID * GRID }).map((_, i) => {
          const x = i % GRID;
          const y = Math.floor(i / GRID);
          const tower = towers.find(
            (t) => t.x === x && t.y === y
          );
          const isPath = PATH.some(
            (p) => p.x === x && p.y === y
          );

          return (
            <div
              key={i}
              onClick={() => placeTower(x, y)}
              onMouseEnter={() => setHoverCell({ x, y })}
              onMouseLeave={() => setHoverCell(null)}
              className={`relative h-9 border flex flex-col items-center justify-center
                ${isPath ? "bg-gray-300" : "bg-green-100"}`}
            >
              {/* RANGE PREVIEW */}
              {hoverCell &&
                selectedTower &&
                hoverCell.x === x &&
                hoverCell.y === y && (
                  <div
                    className="absolute rounded-full bg-blue-400 opacity-20 pointer-events-none"
                    style={{
                      width:
                        TOWERS[selectedTower].range *
                        CELL *
                        2,
                      height:
                        TOWERS[selectedTower].range *
                        CELL *
                        2,
                      left:
                        CELL / 2 -
                        TOWERS[selectedTower].range *
                          CELL,
                      top:
                        CELL / 2 -
                        TOWERS[selectedTower].range *
                          CELL,
                    }}
                  />
                )}

              {tower && (
                <>
                  <span className="text-lg">
                    {tower.type === "melee"
                      ? "⚔️"
                      : "🏹"}
                  </span>
                  <span className="text-[10px] text-gray-600">
                    {Math.round(
                      tower.damage /
                        (tower.attackSpeed / 1000)
                    )}{" "}
                    DPS
                  </span>
                </>
              )}

              {isPath &&
                enemies
                  .filter(
                    (e) =>
                      PATH[e.pathIndex].x === x &&
                      PATH[e.pathIndex].y === y
                  )
                  .map((e) => (
                    <div
                      key={e.id}
                      className="absolute top-1 flex flex-col items-center"
                    >
                      <div className="w-3 h-3 bg-red-600 rounded-full" />
                      <div className="w-7 h-2 bg-red-200 mt-0.5 text-[9px] relative">
                        <div
                          className="h-full bg-red-600"
                          style={{
                            width: `${
                              (e.hp / ENEMY_HP) * 100
                            }%`,
                          }}
                        />
                        <span className="absolute inset-0 flex items-center justify-center text-white">
                          {e.hp}
                        </span>
                      </div>
                    </div>
                  ))}
            </div>
          );
        })}
      </div>

      {/* SHOP */}
      <div className="flex justify-center gap-4 pt-2">
        <button
          onClick={() => setSelectedTower("melee")}
          className="px-2 py-1 border rounded"
        >
          ⚔️ ใกล้ (30g)
        </button>
        <button
          onClick={() => setSelectedTower("range")}
          className="px-2 py-1 border rounded"
        >
          🏹 ไกล (45g)
        </button>
      </div>
    </div>
  );
}
