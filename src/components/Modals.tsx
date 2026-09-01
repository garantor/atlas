import { useState } from 'react';
import { useAtlas, useSelectedFarm } from '@/state/useAtlas';
import '@/styles/cards.css';

// ─── Card Detail Modal ──────────────────────────────────────────────────────
export function CardDetailModal() {
  const { cardDetailId, setCardDetail } = useAtlas();
  const farm = useSelectedFarm();

  if (!cardDetailId || !farm) return null;
  const card = farm.educationalCards.find(c => c.id === cardDetailId);
  if (!card) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-labelledby="card-modal-title" aria-modal>
      <div
        className="modal-backdrop"
        onClick={() => setCardDetail(null)}
      />
      <div className="modal-content">
        <div className="modal-header">
          <div>
            <h2 id="card-modal-title">
              {card.icon} {card.title}
            </h2>
          </div>
          <button
            className="modal-close"
            onClick={() => setCardDetail(null)}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          {/* Body text */}
          <div className="modal-section">
            <p>{card.body}</p>
          </div>

          {/* Formula */}
          {card.formula && (
            <div className="modal-section">
              <h3>Key Formula</h3>
              <div className="formula-box">
                <code style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                  {card.formula}
                </code>
              </div>
            </div>
          )}

          {/* Data table */}
          {card.dataTable && (
            <div className="modal-section">
              <h3>Key Data</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    {card.dataTable.headers.map((h, i) => (
                      <th key={i}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {card.dataTable.rows.map((row, ri) => (
                    <tr key={ri}>
                      {row.map((cell, ci) => (
                        <td key={ci}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Related crops */}
          {card.relatedCropIds.length > 0 && (
            <div className="modal-section">
              <h3>Related Species</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {card.relatedCropIds.map(id => (
                  <span key={id} className="tag tag-green" style={{ fontSize: '11px' }}>
                    {id.replace(/-/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Lesson Modal ────────────────────────────────────────────────────────────
export function LessonModal() {
  const { lessonOpen, setLessonOpen } = useAtlas();
  const farm = useSelectedFarm();
  const [stepIndex, setStepIndex] = useState(0);

  if (!lessonOpen || !farm || farm.lessonSteps.length === 0) return null;

  const steps = farm.lessonSteps;
  const step = steps[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === steps.length - 1;

  return (
    <div className="modal-overlay" role="dialog" aria-labelledby="lesson-modal-title" aria-modal>
      <div className="modal-backdrop" onClick={() => setLessonOpen(false)} />
      <div className="modal-content" style={{ maxWidth: 580 }}>
        <div className="modal-header">
          <h2 id="lesson-modal-title">📖 {farm.name} — Guided Tour</h2>
          <button className="modal-close" onClick={() => setLessonOpen(false)} aria-label="Close">×</button>
        </div>

        {/* Progress dots */}
        <div className="lesson-progress">
          <div className="lesson-progress-dots">
            {steps.map((_, i) => (
              <button
                key={i}
                className={`lesson-dot ${i < stepIndex ? 'done' : i === stepIndex ? 'current' : ''}`}
                onClick={() => setStepIndex(i)}
                aria-label={`Step ${i + 1}`}
              />
            ))}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
            {stepIndex + 1} / {steps.length}
          </span>
        </div>

        {/* Step content */}
        <div className="lesson-step">
          <div className="lesson-step-num">Step {step.stepNum}</div>
          <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-serif)' }}>{step.title}</h3>
          <div className="lesson-illustration">{step.illustration}</div>
          <p style={{ fontSize: '14px', lineHeight: 1.7 }}>{step.body}</p>
        </div>

        {/* Navigation */}
        <div className="lesson-nav">
          <button
            className="btn btn-ghost"
            onClick={() => setStepIndex(i => Math.max(0, i - 1))}
            disabled={isFirst}
          >
            ← Previous
          </button>
          {isLast ? (
            <button className="btn btn-primary" onClick={() => { setLessonOpen(false); setStepIndex(0); }}>
              Finish Tour ✓
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => setStepIndex(i => Math.min(steps.length - 1, i + 1))}>
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Quiz Modal ───────────────────────────────────────────────────────────────
export function QuizModal() {
  const { quizOpen, setQuizOpen } = useAtlas();
  const farm = useSelectedFarm();
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  if (!quizOpen || !farm || farm.quizQuestions.length === 0) return null;

  const q = farm.quizQuestions[qIdx];
  const isLast = qIdx === farm.quizQuestions.length - 1;

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === q.correctIndex) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (isLast) {
      setDone(true);
    } else {
      setQIdx(i => i + 1);
      setSelected(null);
    }
  };

  const handleClose = () => {
    setQuizOpen(false);
    setQIdx(0);
    setSelected(null);
    setScore(0);
    setDone(false);
  };

  if (done) {
    const pct = Math.round((score / farm.quizQuestions.length) * 100);
    return (
      <div className="modal-overlay" role="dialog" aria-modal>
        <div className="modal-backdrop" onClick={handleClose} />
        <div className="modal-content" style={{ maxWidth: 500 }}>
          <div className="modal-header">
            <h2>🧠 Quiz Complete!</h2>
            <button className="modal-close" onClick={handleClose} aria-label="Close">×</button>
          </div>
          <div className="quiz-score">
            <div className="quiz-score-value">{pct}%</div>
            <p style={{ fontSize: '16px', color: 'var(--ink)' }}>
              {score} of {farm.quizQuestions.length} correct
            </p>
            <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
              {pct === 100 ? '🌟 Perfect score! Master agroecologist.' :
               pct >= 70 ? '🌱 Great understanding of this ecosystem!' :
               '🔬 Keep exploring — the atlas has more to reveal.'}
            </p>
            <button className="btn btn-primary" onClick={handleClose}>Back to Atlas</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" role="dialog" aria-labelledby="quiz-modal-title" aria-modal>
      <div className="modal-backdrop" onClick={handleClose} />
      <div className="modal-content" style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <h2 id="quiz-modal-title">🧠 Farm Atlas Quiz</h2>
          <button className="modal-close" onClick={handleClose} aria-label="Close">×</button>
        </div>

        <div className="quiz-question">
          <div style={{ fontSize: '11px', color: 'var(--green-primary)', marginBottom: '8px', fontWeight: 600 }}>
            Question {qIdx + 1} of {farm.quizQuestions.length}
          </div>
          {q.question}
        </div>

        <div className="quiz-options">
          {q.options.map((opt, idx) => {
            let cls = '';
            if (selected !== null) {
              if (idx === q.correctIndex) cls = 'correct';
              else if (idx === selected) cls = 'wrong';
            }
            return (
              <button
                key={idx}
                className={`quiz-option ${cls}`}
                onClick={() => handleSelect(idx)}
                disabled={selected !== null}
                id={`quiz-option-${idx}`}
              >
                <span className="quiz-option-letter">
                  {['A', 'B', 'C', 'D'][idx]}
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        {selected !== null && (
          <div style={{ padding: '0 var(--space-6) var(--space-4)', fontSize: '13px' }}>
            <div className={selected === q.correctIndex ? 'compat-success' : 'compat-warning'}
              style={{ margin: 0 }}>
              <span>{selected === q.correctIndex ? '✓' : '✗'}</span>
              <span>{q.explanation}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button className="btn btn-primary" onClick={handleNext}>
                {isLast ? 'See Results' : 'Next Question →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
