import React, { useState } from 'react';
import { ArrowLeft, Check, Play, BookOpen, RotateCcw, Award, Sparkles, Layers } from 'lucide-react';
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
  executeComponent: (onSimulationComplete: (simScore: number) => void) => React.ReactNode;
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

  const handleQuizCompleted = (quizScoreVal: number) => {
    // Weighted final score: 40% simulation performance + 60% scientific debrief mastery
    const combinedScore = Math.round(simScore * 0.4 + quizScoreVal * 0.6);
    setFinalScore(combinedScore);

    const result = completeMission(missionId, combinedScore);

    if (result.newlyEarnedBadge) {
      soundEffects.playSuccess();
      setEarnedBadgeAlert(true);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
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
      {/* Top Navigation & Phase Stepper */}
      <div className="bg-space-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={onExit}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Mission Deck
          </Button>

          <div className="h-6 w-px bg-slate-800" />

          <div>
            <div className="text-[11px] font-mono text-sky-400 font-bold uppercase tracking-wider">
              {category}
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white font-display">{title}</h2>
          </div>
        </div>

        {/* 3-Step Plan-Execute-Evaluate Stepper */}
        <div className="flex items-center gap-2 sm:gap-3 bg-space-950 px-3 py-1.5 rounded-2xl border border-slate-800">
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
              <div
                key={step.id}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                    : isCompleted
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-500'
                }`}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{step.label}</span>
                <span className="sm:hidden">{idx + 1}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Mission Content Area */}
      <div className="relative">
        {currentPhase === 'plan' && planComponent(handleStartExecution)}

        {currentPhase === 'execute' && executeComponent(handleSimFinished)}

        {currentPhase === 'evaluate' && (
          <div className="space-y-6">
            <QuizWidget
              questions={quizQuestions}
              onComplete={handleQuizCompleted}
              missionTitle={title}
            />

            {finalScore !== null && (
              <div className="bg-space-900 border border-slate-800 rounded-3xl p-6 text-center max-w-xl mx-auto shadow-2xl">
                {earnedBadgeAlert ? (
                  <div className="space-y-3 mb-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-bold border border-amber-500/40">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      NEW NASA BADGE UNLOCKED!
                    </div>
                    <h3 className="text-2xl font-black text-white font-display">
                      Congratulations Astronaut!
                    </h3>
                    <p className="text-slate-300 text-sm">
                      Your flight data has been validated by mission control. You have earned the certified badge for this scenario.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 mb-6">
                    <h3 className="text-xl font-bold text-white font-display">
                      Final Mission Assessment: {finalScore}%
                    </h3>
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
                  <Button variant="accent" onClick={onExit} icon={<ArrowLeft className="w-4 h-4" />}>
                    Return to Map
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

