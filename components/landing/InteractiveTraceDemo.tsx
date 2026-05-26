'use client';

import { useState } from 'react';
import { BtnGhostLink } from '@/components/shared';

const STEPS = [
  { id: 'choose', label: 'Choose', title: 'Pick a category' },
  { id: 'write', label: 'Write', title: 'Say what matters' },
  { id: 'deliver', label: 'Deliver', title: 'Set the moment' },
  { id: 'receive', label: 'Receive', title: 'They open it' },
] as const;

type StepId = (typeof STEPS)[number]['id'];

const CATEGORIES = [
  { icon: '◐', label: 'Confession' },
  { icon: '♫', label: 'Song' },
  { icon: '△', label: 'Midnight' },
  { icon: '◎', label: 'First look' },
];

export function InteractiveTraceDemo() {
  const [step, setStep] = useState<StepId>('choose');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [delivery, setDelivery] = useState('now');

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  const goNext = () => {
    const next = STEPS[stepIndex + 1];
    if (next) setStep(next.id);
    else setStep('choose');
  };

  return (
    <section className="landing-section landing-interactive-demo">
      <p className="landing-eyebrow">Try it — no signup</p>
      <h2 className="landing-heading">
        Choose, write, deliver, <em>receive.</em>
      </h2>
      <p className="landing-body landing-body--center" style={{ marginBottom: 32 }}>
        Tap through how leaving a trace feels. This is a preview — nothing is sent.
      </p>

      <div className="interactive-demo">
        <div className="interactive-demo__tabs" role="tablist">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={step === s.id}
              className={`interactive-demo__tab${step === s.id ? ' interactive-demo__tab--on' : ''}${i < stepIndex ? ' interactive-demo__tab--done' : ''}`}
              onClick={() => setStep(s.id)}
            >
              <span className="interactive-demo__tab-num">{i + 1}</span>
              {s.label}
            </button>
          ))}
        </div>

        <div className="interactive-demo__panel glass-card">
          <p className="interactive-demo__panel-title">{STEPS[stepIndex].title}</p>

          {step === 'choose' && (
            <div className="interactive-demo__grid">
              {CATEGORIES.map((c) => (
                <button
                  key={c.label}
                  type="button"
                  className={`interactive-demo__chip${category.label === c.label ? ' interactive-demo__chip--on' : ''}`}
                  onClick={() => setCategory(c)}
                >
                  <span aria-hidden>{c.icon}</span>
                  {c.label}
                </button>
              ))}
            </div>
          )}

          {step === 'write' && (
            <div className="interactive-demo__compose">
              <p className="interactive-demo__meta">
                {category.icon} {category.label} · Ghost
              </p>
              <p className="interactive-demo__quote">
                I never told you how much that night meant to me.
              </p>
            </div>
          )}

          {step === 'deliver' && (
            <div className="interactive-demo__delivery">
              {[
                { id: 'now', label: 'Arrive now' },
                { id: '7d', label: 'In 7 days' },
                { id: 'comfort', label: 'Open when needed' },
              ].map((d) => (
                <button
                  key={d.id}
                  type="button"
                  className={`interactive-demo__delivery-opt${delivery === d.id ? ' interactive-demo__delivery-opt--on' : ''}`}
                  onClick={() => setDelivery(d.id)}
                >
                  {d.label}
                </button>
              ))}
            </div>
          )}

          {step === 'receive' && (
            <div className="interactive-demo__inbox">
              <p className="interactive-demo__inbox-badge">New trace</p>
              <p className="interactive-demo__quote">
                Someone left you a {category.label.toLowerCase()}.
              </p>
              <p className="interactive-demo__inbox-meta">
                {delivery === 'now' ? 'Delivered now' : delivery === '7d' ? 'Arrives in 7 days' : 'Comfort capsule'} · Anonymous
              </p>
            </div>
          )}

          <button type="button" className="interactive-demo__next" onClick={goNext}>
            {step === 'receive' ? 'Start over' : 'Next step →'}
          </button>
        </div>
      </div>

      <div className="landing-cta-row">
        <BtnGhostLink href="/sign-up">Create your profile</BtnGhostLink>
      </div>
    </section>
  );
}
