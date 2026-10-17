'use client';

import { useEffect, useReducer } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/ui/Button';
import { TranslatedText } from '@/shared/ui/TranslatedText';
import { MAGIC_SAMPLE, ONBOARDING_STEPS } from './steps';
import styles from './OnboardingFlow.module.scss';

interface State {
  index: number;
  xp: number;
  answers: Record<string, string>;
}

type Action = { type: 'answer'; stepId: string; value: string; xp: number } | { type: 'next'; xp: number };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'answer':
      return {
        index: state.index + 1,
        xp: state.xp + action.xp,
        answers: { ...state.answers, [action.stepId]: action.value },
      };
    case 'next':
      return { ...state, index: state.index + 1, xp: state.xp + action.xp };
  }
}

export function OnboardingFlow() {
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, { index: 0, xp: 0, answers: {} });
  const step = ONBOARDING_STEPS[state.index];

  // Fim do fluxo: navegação é efeito colateral, nunca no corpo do render.
  // (Persistir `state.answers` no backend é tarefa da Fase 1.)
  useEffect(() => {
    if (!step) router.push('/operador');
  }, [step, router]);

  if (!step) return null;

  const pct = Math.round((state.index / ONBOARDING_STEPS.length) * 100);

  return (
    <div className={styles.root}>
      <div className={styles.progress} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div style={{ width: `${pct}%` }} />
      </div>
      <div className={styles.meta}>
        <span>
          Passo {state.index + 1} de {ONBOARDING_STEPS.length}
        </span>
        <span>{state.xp} XP</span>
      </div>

      <h1>{step.title}</h1>

      {step.options ? (
        <div className={styles.options}>
          {step.options.map((option) => (
            <Button
              key={option}
              variant="ghost"
              onClick={() => dispatch({ type: 'answer', stepId: step.id, value: option, xp: step.xp })}
            >
              {option}
            </Button>
          ))}
        </div>
      ) : (
        <>
          <TranslatedText simple={MAGIC_SAMPLE.simple} official={MAGIC_SAMPLE.official} />
          <Button onClick={() => dispatch({ type: 'next', xp: step.xp })}>Entendi, continuar</Button>
        </>
      )}
    </div>
  );
}
