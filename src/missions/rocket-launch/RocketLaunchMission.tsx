import React, { useState } from 'react';
import { MissionShell } from '../engine/MissionShell';
import { RocketBuilder } from './RocketBuilder';
import { LaunchSimScene } from './LaunchSimScene';
import { RocketConfig } from './rocketPhysics';
import configData from './config.json';

interface RocketLaunchMissionProps {
  onExit: () => void;
}

export const RocketLaunchMission: React.FC<RocketLaunchMissionProps> = ({ onExit }) => {
  const [config, setConfig] = useState<RocketConfig>({
    capsuleId: 'orion-crew',
    tankId: 'tank-standard',
    engineId: 'engine-cluster',
    pitchAngleDeg: 25,
    throttlePercent: 100
  });

  return (
    <MissionShell
      missionId="rocket-launch"
      title="Rocket Launch & Orbital Insertion"
      category="Propulsion & Newton's Laws"
      badgeId="rocket-engineer"
      onExit={onExit}
      planComponent={onReady => (
        <RocketBuilder
          config={config}
          onChange={setConfig}
          onLaunch={onReady}
        />
      )}
      executeComponent={onSimComplete => (
        <LaunchSimScene
          config={config}
          onComplete={onSimComplete}
          onRestart={() => {}}
        />
      )}
      quizQuestions={configData.quiz}
    />
  );
};

