import React, { useState } from 'react';
import { ArrowLeft, Check, Play, BookOpen, RotateCcw, Award, Sparkles, Layers, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button } from '../../components/common/Button';
import { QuizWidget, QuizQuestion } from '../../components/common/QuizWidget';
import { useProgress } from '../../context/ProgressContext';
import { soundEffects } from '../../lib/soundEffects';

export type MissionPhase = 'plan' | 'execute' | 'evaluate';

interface MissionShellProps {
  missionId: string;
  title: string;
  category: string;
  badgeId: string;
  onExit: () => void;
  planComponent: (onReadyToExecute: () => void) => React.ReactNode;
  executeComponent: (onSimulationComplete: (simScore: number) => void, onRestartToPlan?: () => void) => React.ReactNode;
  quizQuestions: QuizQuestion[];
}

export const MissionShell: React.FC<MissionShellProps> = ({
  missionId,
  title,
  category,
  badgeId,
  onExit,
  planComponent,
  executeComponent,
  quizQuestions
}) => {
  const [currentPhase, setCurrentPhase] = useState<MissionPhase>('plan');
  const [simScore, setSimScore] = useState<number>(0);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [earnedBadgeAlert, setEarnedBadgeAlert] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const { completeMission, startMission } = useProgress();

  React.useEffect(() => {
    startMission(missionId);
  }, [missionId]);

  const handleStartExecution = () => {
    soundEffects.playBeep(true);
    setCurrentPhase('execute');
  };

  const handleSimFinished = (score: number) => {
    setSimScore(score);
    setCurrentPhase('evaluate');
  };

  const handleQuizCompleted = async (quizScoreVal: number) => {
    if (isSaving) return;
    setIsSaving(true);

    const combinedScore = Math.round(simScore * 0.4 + quizScoreVal * 0.6);
    setFinalScore(combinedScore);

    try {
      const result = await completeMission(missionId, combinedScore);

      if (result.newlyEarnedBadge) {
        soundEffects.playSuccess();
        setEarnedBadgeAlert(true);
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestart = () => {
    setCurrentPhase('plan');
    setSimScore(0);
    setFinalScore(null);
    setEarnedBadgeAlert(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Top Mission Header & Phase Stepper in BeanMachine Glass Style */}
      <nav aria-label="Mission Phase Navigation" className="bg-[#12153f]/90 border border-[#2e336d]/70 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3.5">
          <button
            onClick={onExit}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0a0b2e]/80 hover:bg-[#1a1e5a] border border-[#2e336d]/70 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-md"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Mission Deck</span>
          </button>

          <div className="h-6 w-px bg-[#1f245c]" aria-hidden="true" />

          <div>
            <div className="text-[11px] font-mono text-purple-300 font-bold uppercase tracking-wider">
              {category}
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-white">{title}</h1>
          </div>
        </div>

        {/* 3-Step Plan-Execute-Evaluate Stepper in BeanMachine Pill Style */}
        <div className="flex items-center gap-2 bg-[#0a0b2e]/90 p-1.5 rounded-xl border border-[#1f245c]/80">
          {[
            { id: 'plan', label: '1. Plan & Build', icon: Layers },
            { id: 'execute', label: '2. Execute Sim', icon: Play },
            { id: 'evaluate', label: '3. Scientific Debrief', icon: BookOpen }
          ].map((step, idx) => {
            const Icon = step.icon;
            const isActive = currentPhase === step.id;
            const isCompleted =
              (step.id === 'plan' && currentPhase !== 'plan') ||
              (step.id === 'execute' && currentPhase === 'evaluate');

            return (
              <button
                key={step.id}
                onClick={() => setCurrentPhase(step.id as MissionPhase)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500 text-space-950 shadow-md shadow-emerald-500/20'
                    : isCompleted
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5" aria-hidden="true" /> : <Icon className="w-3.5 h-3.5" aria-hidden="true" />}
                <span className="hidden sm:inline">{step.label}</span>
                <span className="sm:hidden">{idx + 1}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Mission Content Area */}
      <section aria-label="Mission Workspace" className="relative">
        {currentPhase === 'plan' && planComponent(handleStartExecution)}

        {currentPhase === 'execute' && executeComponent(handleSimFinished, handleRestart)}

        {currentPhase === 'evaluate' && (
          <div className="space-y-6">
            <QuizWidget
              questions={quizQuestions}
              onComplete={handleQuizCompleted}
              missionTitle={title}
            />

            {finalScore !== null && (
              <div className="bg-[#12153f]/90 border border-[#2e336d]/70 rounded-2xl p-8 text-center max-w-xl mx-auto shadow-2xl backdrop-blur-xl animate-fadeIn">
                {earnedBadgeAlert ? (
                  <div className="space-y-3 mb-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold border border-emerald-500/40">
                      <Sparkles className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                      NEW NASA BADGE UNLOCKED!
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                      Congratulations Astronaut!
                    </h2>
                    <p className="text-slate-300 text-sm">
                      Your flight data has been validated by mission control. You have earned the certified badge for this scenario.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 mb-6">
                    <h2 className="text-xl font-bold text-white">
                      Final Mission Assessment: {finalScore}%
                    </h2>
                    <p className="text-slate-400 text-xs">
                      {finalScore >= 70
                        ? "Qualified! Next mission trajectory is now unlocked on your flight map."
                        : "Score under 70%. Review your booster assembly and retake to earn the badge."}
                    </p>
                  </div>
                )}

                <div className="flex justify-center gap-3">
                  <Button variant="secondary" onClick={handleRestart} icon={<RotateCcw className="w-4 h-4" />}>
                    Replay Mission
                  </Button>
                  <Button variant="bean" onClick={onExit} icon={<ArrowLeft className="w-4 h-4" />}>
                    Return to Map
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
