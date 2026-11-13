import React, { useState } from 'react';
import { CheckCircle2, XCircle, ArrowRight, Award, HelpCircle } from 'lucide-react';
import { Button } from './Button';
import { soundEffects } from '../../lib/soundEffects';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface QuizWidgetProps {
  questions: QuizQuestion[];
  onComplete: (score: number) => void;
  missionTitle: string;
}

export const QuizWidget: React.FC<QuizWidgetProps> = ({
  questions,
  onComplete,
  missionTitle
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [scoreList, setScoreList] = useState<boolean[]>([]);
  const [quizFinished, setQuizFinished] = useState(false);

  const currentQuestion = questions[currentIndex];

  const handleSelectOption = (index: number) => {
    if (isAnswerSubmitted) return;
    soundEffects.playClick();
    setSelectedAnswer(index);
  };

  const handleCheckAnswer = () => {
    if (selectedAnswer === null) return;
    const isCorrect = selectedAnswer === currentQuestion.correctIndex;
    setIsAnswerSubmitted(true);
    setScoreList(prev => [...prev, isCorrect]);

    if (isCorrect) {
      soundEffects.playSuccess();
    } else {
      soundEffects.playWarning();
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
    } else {
      // Quiz finished
      setQuizFinished(true);
      const totalCorrect = scoreList.filter(Boolean).length;
      const finalScore = Math.round((totalCorrect / questions.length) * 100);
      onComplete(finalScore);
    }
  };

  if (quizFinished) {
    const totalCorrect = scoreList.filter(Boolean).length;
    const finalScore = Math.round((totalCorrect / questions.length) * 100);
    const passed = finalScore >= 70;

    return (
      <div className="bg-space-900/90 border border-slate-700 rounded-3xl p-8 max-w-xl mx-auto text-center shadow-2xl backdrop-blur-md">
        <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-6 shadow-xl ${
          passed ? 'bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950' : 'bg-space-800 text-rose-400 border border-rose-500/30'
        }`}>
          {passed ? <Award className="w-10 h-10 animate-bounce" /> : <HelpCircle className="w-10 h-10" />}
        </div>

        <h3 className="text-2xl font-black text-white font-display mb-2">
          {passed ? "Mission Debrief Passed!" : "Telemetry Review Needed"}
        </h3>
        <p className="text-slate-400 text-sm mb-6">
          {passed
            ? `Outstanding performance, Cadet! You scored ${finalScore}% and proved mastery of the mission's core science concepts.`
            : `You scored ${finalScore}%. Review the science briefing and try the simulation once more to unlock your badge!`}
        </p>

        <div className="flex justify-center items-center gap-6 p-4 bg-space-950/60 rounded-2xl border border-slate-800 mb-6">
          <div>
            <div className="text-xs text-slate-400 uppercase font-semibold">Correct</div>
            <div className="text-2xl font-mono font-bold text-emerald-400">{totalCorrect} / {questions.length}</div>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div>
            <div className="text-xs text-slate-400 uppercase font-semibold">Mastery Score</div>
            <div className={`text-2xl font-mono font-bold ${passed ? 'text-amber-400' : 'text-rose-400'}`}>{finalScore}%</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-space-900/90 border border-slate-700/80 rounded-3xl p-6 md:p-8 max-w-2xl mx-auto shadow-2xl backdrop-blur-md">
      {/* Quiz Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
        <div>
          <span className="text-xs font-mono font-semibold uppercase text-sky-400 tracking-wider">
            Evaluation Phase — Question {currentIndex + 1} of {questions.length}
          </span>
          <h3 className="text-lg font-bold text-slate-200 mt-0.5">{missionTitle} Review</h3>
        </div>
        <div className="flex gap-1.5">
          {questions.map((_, idx) => (
            <div
              key={idx}
              className={`w-3 h-3 rounded-full transition-all ${
                idx < currentIndex
                  ? scoreList[idx] ? 'bg-emerald-500' : 'bg-rose-500'
                  : idx === currentIndex
                  ? 'bg-sky-400 ring-2 ring-sky-300 ring-offset-2 ring-offset-space-900'
                  : 'bg-slate-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-white leading-snug">
          {currentQuestion.question}
        </h4>
      </div>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {currentQuestion.options.map((option, idx) => {
          let optionStyle = "bg-space-800/80 border-slate-700 text-slate-200 hover:border-slate-500 hover:bg-space-750";

          if (isAnswerSubmitted) {
            if (idx === currentQuestion.correctIndex) {
              optionStyle = "bg-emerald-950/70 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500";
            } else if (idx === selectedAnswer) {
              optionStyle = "bg-rose-950/70 border-rose-500 text-rose-200";
            } else {
              optionStyle = "opacity-40 border-slate-800 text-slate-400";
            }
          } else if (selectedAnswer === idx) {
            optionStyle = "bg-sky-950 border-sky-400 text-sky-100 ring-2 ring-sky-400/50";
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelectOption(idx)}
              disabled={isAnswerSubmitted}
              className={`w-full text-left p-4 rounded-2xl border transition-all duration-150 flex items-center justify-between font-medium cursor-pointer ${optionStyle}`}
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-space-900 border border-slate-700 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="text-sm">{option}</span>
              </div>

              {isAnswerSubmitted && idx === currentQuestion.correctIndex && (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              )}
              {isAnswerSubmitted && idx === selectedAnswer && idx !== currentQuestion.correctIndex && (
                <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation Banner */}
      {isAnswerSubmitted && (
        <div className={`p-4 rounded-2xl mb-6 border ${
          selectedAnswer === currentQuestion.correctIndex
            ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200'
            : 'bg-rose-950/50 border-rose-500/40 text-rose-200'
        }`}>
          <div className="font-bold text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
            {selectedAnswer === currentQuestion.correctIndex ? (
              <><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Correct Analysis!</>
            ) : (
              <><XCircle className="w-4 h-4 text-rose-400" /> Scientific Correction</>
            )}
          </div>
          <p className="text-xs leading-relaxed opacity-90">{currentQuestion.explanation}</p>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
        {!isAnswerSubmitted ? (
          <Button
            onClick={handleCheckAnswer}
            disabled={selectedAnswer === null}
            variant="accent"
          >
            Submit Answer
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            variant="primary"
            icon={<ArrowRight className="w-4 h-4" />}
          >
            {currentIndex + 1 < questions.length ? "Next Question" : "Complete Debrief"}
          </Button>
        )}
      </div>
    </div>
  );
};

