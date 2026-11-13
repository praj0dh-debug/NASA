import React, { useState } from 'react';
import { MissionShell } from '../engine/MissionShell';
import { Button } from '../../components/common/Button';
import { Play, RotateCcw, ArrowUp, CornerUpLeft, CornerUpRight, Disc, Zap, CheckCircle2, AlertTriangle, Sparkles, Layers } from 'lucide-react';
import { soundEffects } from '../../lib/soundEffects';

interface MarsRoverMissionProps {
  onExit: () => void;
}

type CommandType = 'FORWARD' | 'TURN_LEFT' | 'TURN_RIGHT' | 'LASER_SCAN' | 'DRILL_SAMPLE';

interface LevelConfig {
  id: number;
  title: string;
  gridSize: number;
  startX: number;
  startY: number;
  startDir: 0 | 1 | 2 | 3; // 0=N, 1=E, 2=S, 3=W
  targetX: number;
  targetY: number;
  obstacles: Array<{ x: number; y: number; type: 'boulder' | 'crater' }>;
  sampleName: string;
}

const LEVELS: LevelConfig[] = [
  {
    id: 1,
    title: "Level 1: Jezero Delta Landing Site",
    gridSize: 5,
    startX: 0,
    startY: 0,
    startDir: 1,
    targetX: 3,
    targetY: 1,
    obstacles: [
      { x: 1, y: 0, type: 'boulder' },
      { x: 2, y: 2, type: 'boulder' }
    ],
    sampleName: "Mudstone Clay Core"
  },
  {
    id: 2,
    title: "Level 2: Ancient Lakebed Crater Rim",
    gridSize: 5,
    startX: 0,
    startY: 4,
    startDir: 0,
    targetX: 4,
    targetY: 0,
    obstacles: [
      { x: 0, y: 2, type: 'boulder' },
      { x: 2, y: 3, type: 'crater' },
      { x: 2, y: 1, type: 'boulder' },
      { x: 3, y: 2, type: 'crater' }
    ],
    sampleName: "Silica-Rich Microbe Biosignature"
  }
];

export const MarsRoverMission: React.FC<MarsRoverMissionProps> = ({ onExit }) => {
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const currentLevel = LEVELS[currentLevelIdx];

  const [commands, setCommands] = useState<CommandType[]>([
    'FORWARD',
    'FORWARD',
    'TURN_RIGHT',
    'FORWARD',
    'LASER_SCAN',
    'DRILL_SAMPLE'
  ]);

  const [roverX, setRoverX] = useState(currentLevel.startX);
  const [roverY, setRoverY] = useState(currentLevel.startY);
  const [roverDir, setRoverDir] = useState<0 | 1 | 2 | 3>(currentLevel.startDir);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [sampleDrilled, setSampleDrilled] = useState(false);
  const [laserScanned, setLaserScanned] = useState(false);
  const [hitObstacle, setHitObstacle] = useState(false);
  const [simRunning, setSimRunning] = useState(false);

  const resetRover = () => {
    setRoverX(currentLevel.startX);
    setRoverY(currentLevel.startY);
    setRoverDir(currentLevel.startDir);
    setActiveStep(null);
    setSampleDrilled(false);
    setLaserScanned(false);
    setHitObstacle(false);
    setSimRunning(false);
  };

  const handleLevelChange = (idx: number) => {
    setCurrentLevelIdx(idx);
    const lvl = LEVELS[idx];
    setRoverX(lvl.startX);
    setRoverY(lvl.startY);
    setRoverDir(lvl.startDir);
    setActiveStep(null);
    setSampleDrilled(false);
    setLaserScanned(false);
    setHitObstacle(false);
    setSimRunning(false);
  };

  const addCommand = (cmd: CommandType) => {
    soundEffects.playClick();
    setCommands(prev => [...prev, cmd]);
  };

  const removeCommand = (idx: number) => {
    soundEffects.playClick();
    setCommands(prev => prev.filter((_, i) => i !== idx));
  };

  const runCodeSequence = () => {
    resetRover();
    setSimRunning(true);

    let currX = currentLevel.startX;
    let currY = currentLevel.startY;
    let currDir = currentLevel.startDir;
    let scanned = false;
    let drilled = false;

    commands.forEach((cmd, idx) => {
      setTimeout(() => {
        setActiveStep(idx);

        if (cmd === 'FORWARD') {
          soundEffects.playBeep(false);
          let nextX = currX;
          let nextY = currY;
          if (currDir === 0) nextY = Math.max(0, currY - 1);
          if (currDir === 1) nextX = Math.min(currentLevel.gridSize - 1, currX + 1);
          if (currDir === 2) nextY = Math.min(currentLevel.gridSize - 1, currY + 1);
          if (currDir === 3) nextX = Math.max(0, currX - 1);

          // Check obstacle collision
          if (currentLevel.obstacles.some(o => o.x === nextX && o.y === nextY)) {
            soundEffects.playWarning();
            setHitObstacle(true);
            setSimRunning(false);
            return;
          }

          currX = nextX;
          currY = nextY;
          setRoverX(currX);
          setRoverY(currY);
        } else if (cmd === 'TURN_RIGHT') {
          soundEffects.playClick();
          currDir = ((currDir + 1) % 4) as 0 | 1 | 2 | 3;
          setRoverDir(currDir);
        } else if (cmd === 'TURN_LEFT') {
          soundEffects.playClick();
          currDir = ((currDir + 3) % 4) as 0 | 1 | 2 | 3;
          setRoverDir(currDir);
        } else if (cmd === 'LASER_SCAN') {
          soundEffects.playSonicBoom();
          scanned = true;
          setLaserScanned(true);
        } else if (cmd === 'DRILL_SAMPLE') {
          if (currX === currentLevel.targetX && currY === currentLevel.targetY) {
            soundEffects.playSuccess();
            drilled = true;
            setSampleDrilled(true);
          } else {
            soundEffects.playWarning();
          }
        }

        if (idx === commands.length - 1) {
          setSimRunning(false);
        }
      }, (idx + 1) * 650);
    });
  };

  const dirSymbols = ['⬆️', '➡️', '⬇️', '⬅️'];

  const quizQuestions = [
    {
      id: "mr-q1",
      question: "Why must Mars rovers operate with autonomous software algorithms rather than live joystick control?",
      options: [
        "Radio signals traveling at the speed of light take 5 to 20 minutes each way between Earth and Mars",
        "Joysticks do not work in cold temperatures",
        "Because NASA engineers sleep during the day",
        "Mars has too much gravity for joysticks"
      ],
      correctIndex: 0,
      explanation: "Because of the vast distance (up to 400M km), the round-trip radio delay can be up to 40 minutes! The rover must calculate its own path to avoid cliffs."
    },
    {
      id: "mr-q2",
      question: "In computer programming, what is a sequential algorithm?",
      options: [
        "A random guess",
        "A step-by-step ordered list of instructions executed in precise order to solve a problem",
        "A computer virus",
        "A single hardware wire"
      ],
      correctIndex: 1,
      explanation: "An algorithm is an exact sequence of commands executed one after another to achieve a planned goal!"
    },
    {
      id: "mr-q3",
      question: "What instrument on Perseverance pulverizes and collects geological core samples for Mars Sample Return?",
      options: [
        "The rotary percussive coring drill located on the robotic turret arm",
        "A plastic spoon",
        "A water hose",
        "A leaf blower"
      ],
      correctIndex: 0,
      explanation: "The robotic arm drill cuts cylindrical rock cores and hermetically seals them inside titanium tubes."
    }
  ];

  return (
    <MissionShell
      missionId="mars-rover-code"
      title="Mars Rover Autonomous Coding"
      category="Robotics & Computer Science"
      badgeId="rover-navigator"
      onExit={onExit}
      planComponent={onReady => (
        <div className="bg-space-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold text-orange-400">PERSEVERANCE AUTO-NAV</span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-sky-400 font-semibold">{currentLevel.title}</span>
              </div>
              <h3 className="text-xl font-bold text-white font-display">
                Visual Block Sequence Programming
              </h3>
            </div>

            {/* Level Selector */}
            <div className="flex items-center gap-2 bg-space-950 p-1.5 rounded-2xl border border-slate-800">
              {LEVELS.map((lvl, idx) => (
                <button
                  key={lvl.id}
                  onClick={() => handleLevelChange(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    currentLevelIdx === idx
                      ? 'bg-orange-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Mission {lvl.id}
                </button>
              ))}
            </div>
          </div>

          {/* Block Palette */}
          <div className="p-4 bg-space-950 rounded-2xl border border-slate-800">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2.5 block">
              1. Click to Append Command Blocks to Sequence:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => addCommand('FORWARD')}
                className="px-3.5 py-2.5 bg-blue-600/30 hover:bg-blue-600/40 border border-blue-400/50 text-blue-200 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all"
              >
                <ArrowUp className="w-4 h-4 text-blue-300" /> MOVE FORWARD
              </button>
              <button
                type="button"
                onClick={() => addCommand('TURN_LEFT')}
                className="px-3.5 py-2.5 bg-purple-600/30 hover:bg-purple-600/40 border border-purple-400/50 text-purple-200 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all"
              >
                <CornerUpLeft className="w-4 h-4 text-purple-300" /> TURN LEFT 90°
              </button>
              <button
                type="button"
                onClick={() => addCommand('TURN_RIGHT')}
                className="px-3.5 py-2.5 bg-purple-600/30 hover:bg-purple-600/40 border border-purple-400/50 text-purple-200 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all"
              >
                <CornerUpRight className="w-4 h-4 text-purple-300" /> TURN RIGHT 90°
              </button>
              <button
                type="button"
                onClick={() => addCommand('LASER_SCAN')}
                className="px-3.5 py-2.5 bg-red-600/30 hover:bg-red-600/40 border border-red-400/50 text-red-200 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all"
              >
                <Zap className="w-4 h-4 text-red-300" /> SUPERCAM LASER
              </button>
              <button
                type="button"
                onClick={() => addCommand('DRILL_SAMPLE')}
                className="px-3.5 py-2.5 bg-amber-600/30 hover:bg-amber-600/40 border border-amber-400/50 text-amber-200 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all"
              >
                <Disc className="w-4 h-4 text-amber-300" /> DRILL & SEAL CORE
              </button>
            </div>
          </div>

          {/* Program Queue */}
          <div className="bg-space-950 p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono font-bold text-slate-300">
                ACTIVE PROGRAM PIPELINE ({commands.length} INSTRUCTIONS):
              </span>
              <button
                onClick={() => setCommands([])}
                className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
              >
                Clear Sequence
              </button>
            </div>

            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
              {commands.map((cmd, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-space-900 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white shadow-sm"
                >
                  <span className="text-slate-500 font-normal">#{idx + 1}</span>
                  <span className={cmd === 'FORWARD' ? 'text-blue-300' : cmd === 'DRILL_SAMPLE' ? 'text-amber-400' : cmd === 'LASER_SCAN' ? 'text-rose-400' : 'text-purple-300'}>
                    {cmd}
                  </span>
                  <button
                    onClick={() => removeCommand(idx)}
                    className="text-slate-500 hover:text-rose-400 font-bold ml-1"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-800">
            <Button onClick={onReady} variant="accent" size="lg">
              Upload Autonav Binary to Rover
            </Button>
          </div>
        </div>
      )}
      executeComponent={onSimComplete => (
        <div className="bg-space-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-bold text-orange-400">JEZERO CRATER SIMULATION</span>
              <h3 className="text-xl font-black text-white font-display">
                Real-Time Autonav Execution
              </h3>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={runCodeSequence}
                disabled={simRunning}
                variant="accent"
                icon={<Play className="w-4 h-4 fill-current" />}
              >
                Run Program
              </Button>
              <Button onClick={resetRover} variant="secondary" icon={<RotateCcw className="w-4 h-4" />}>
                Reset Position
              </Button>
            </div>
          </div>

          {/* Interactive Grid Map */}
          <div className="bg-gradient-to-b from-orange-950/30 to-space-950 border-2 border-orange-900/50 p-6 rounded-3xl flex flex-col items-center">
            <div className="grid grid-cols-5 gap-3 w-full max-w-md">
              {Array.from({ length: 25 }).map((_, i) => {
                const gx = i % 5;
                const gy = Math.floor(i / 5);
                const isRover = gx === roverX && gy === roverY;
                const isTarget = gx === currentLevel.targetX && gy === currentLevel.targetY;
                const obstacle = currentLevel.obstacles.find(o => o.x === gx && o.y === gy);

                return (
                  <div
                    key={i}
                    className={`aspect-square rounded-2xl border flex flex-col items-center justify-center text-xl relative transition-all duration-200 select-none ${
                      isRover
                        ? 'bg-amber-500/30 border-amber-400 shadow-xl ring-2 ring-amber-400 scale-105 z-10'
                        : isTarget
                        ? 'bg-emerald-950/70 border-emerald-500 animate-pulse'
                        : obstacle
                        ? 'bg-stone-900/90 border-stone-700'
                        : 'bg-space-900/80 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    {isRover && (
                      <div className="flex flex-col items-center">
                        <span className="text-2xl">🤖</span>
                        <span className="text-[10px] font-mono font-bold text-amber-300">
                          {dirSymbols[roverDir]}
                        </span>
                      </div>
                    )}
                    {!isRover && isTarget && (
                      <div className="flex flex-col items-center">
                        <span className="text-2xl">💎</span>
                        <span className="text-[9px] font-mono font-bold text-emerald-300">SAMPLE</span>
                      </div>
                    )}
                    {!isRover && obstacle && (
                      <div className="flex flex-col items-center">
                        <span className="text-2xl">{obstacle.type === 'boulder' ? '🪨' : '🌋'}</span>
                        <span className="text-[9px] font-mono text-stone-400">HAZARD</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Current Step Readout */}
            <div className="mt-4 text-xs font-mono text-slate-400">
              {activeStep !== null ? (
                <span>Executing Instruction #{activeStep + 1}: <strong className="text-amber-400">{commands[activeStep]}</strong></span>
              ) : (
                <span>Press 'Run Program' to test code traversal.</span>
              )}
            </div>
          </div>

          {/* Success Banner */}
          {sampleDrilled && (
            <div className="p-5 bg-emerald-950/70 border border-emerald-500/60 rounded-2xl flex flex-wrap items-center justify-between gap-4 animate-fadeIn">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-white text-sm">Target Geological Sample Recovered!</h4>
                  <p className="text-xs text-emerald-200">{currentLevel.sampleName} successfully hermetically sealed for Mars Sample Return.</p>
                </div>
              </div>
              <Button onClick={() => onSimComplete(100)} variant="primary" size="lg">
                Proceed to Computer Science Debrief
              </Button>
            </div>
          )}

          {/* Collision Warning */}
          {hitObstacle && (
            <div className="p-4 bg-rose-950/70 border border-rose-500/60 rounded-2xl flex items-center gap-3 text-rose-200 text-xs animate-fadeIn">
              <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0" />
              <div>
                <strong>Collision Alert:</strong> The rover encountered an impassable boulder hazard! Return to the code editor to adjust turns or distances.
              </div>
            </div>
          )}
        </div>
      )}
      quizQuestions={quizQuestions}
    />
  );
};
