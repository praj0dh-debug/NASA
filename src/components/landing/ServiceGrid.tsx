import React from 'react';
import { Rocket, Radio, Moon, Cpu } from 'lucide-react';

/**
 * ServiceGrid — Core STEM Flight Disciplines matching the 4-column BeanMachine aesthetic,
 * fully dedicated to Junior Astronaut training areas.
 */

interface DisciplineItem {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color: string;
  glowColor: string;
}

const disciplines: DisciplineItem[] = [
  {
    icon: <Rocket className="w-6 h-6" />,
    title: 'Propulsion & Orbit',
    subtitle: 'Rocket staging & Newton’s laws',
    color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    glowColor: 'hover:shadow-indigo-500/20',
  },
  {
    icon: <Radio className="w-6 h-6" />,
    title: 'Life Support Ops',
    subtitle: 'Orbital station power & oxygen grids',
    color: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    glowColor: 'hover:shadow-purple-500/20',
  },
  {
    icon: <Moon className="w-6 h-6" />,
    title: 'Lunar Geology',
    subtitle: 'Artemis habitats & sample analysis',
    color: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    glowColor: 'hover:shadow-sky-500/20',
  },
  {
    icon: <Cpu className="w-6 h-6" />,
    title: 'Autonomous Robotics',
    subtitle: 'Mars rover block programming',
    color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    glowColor: 'hover:shadow-emerald-500/20',
  },
];

export const ServiceGrid: React.FC = () => {
  return (
    <section
      id="disciplines"
      className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8"
      aria-label="STEM flight training disciplines"
      data-testid="service-grid"
    >
      <div className="max-w-5xl mx-auto text-center">
        {/* Description paragraph matching BeanMachine layout, focused on Junior Astronaut STEM */}
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed mb-16 sm:mb-20">
          The Junior Astronaut STEM Academy prepares elementary cadets (Ages 5–11) for space exploration.
          Through hands-on aerospace simulators, real flight physics calculations, and scientific debriefings aligned with
          Next Generation Science Standards (NGSS), students earn certified NASA badges and master the foundations of spaceflight.
        </p>

        {/* Section heading */}
        <h2
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-12 sm:mb-16"
          data-testid="service-heading"
        >
          Flight Training Disciplines
        </h2>

        {/* 4-Column Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {disciplines.map(item => (
            <div
              key={item.title}
              className={`group flex flex-col items-center gap-4 p-6 sm:p-8 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${item.glowColor} cursor-default`}
              data-testid={`service-card-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {/* Icon container */}
              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl border flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${item.color}`}
              >
                {item.icon}
              </div>

              {/* Title */}
              <h3 className="text-white font-semibold text-sm sm:text-base">
                {item.title}
              </h3>

              {/* Subtitle */}
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed text-center">
                {item.subtitle}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
