import { useAtlas, useSelectedFarm } from '@/state/useAtlas';
import '@/styles/cards.css';

export function EducationalCards() {
  const farm = useSelectedFarm();
  const { setCardDetail, setLessonOpen, setQuizOpen } = useAtlas();

  if (!farm) return null;

  return (
    <div className="edu-section">
      <div className="edu-section-header">
        <h3>📚 Farm Science</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          {farm.lessonSteps.length > 0 && (
            <button
              id="open-lesson-btn"
              className="btn btn-primary btn-sm"
              onClick={() => setLessonOpen(true)}
            >
              📖 Guided Tour
            </button>
          )}
          {farm.quizQuestions.length > 0 && (
            <button
              id="open-quiz-btn"
              className="btn btn-ghost btn-sm"
              onClick={() => setQuizOpen(true)}
            >
              🧠 Quiz
            </button>
          )}
        </div>
      </div>

      <div className="edu-grid" style={{ padding: 0, gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
        {farm.educationalCards.map(card => (
          <button
            key={card.id}
            id={`edu-card-${card.id}`}
            className="edu-card"
            onClick={() => setCardDetail(card.id)}
            style={{ textAlign: 'left', cursor: 'pointer' }}
          >
            <div className="edu-card-header">
              <div className={`edu-card-icon ${card.category}`}>
                {card.icon}
              </div>
              <span className="tag tag-green" style={{ fontSize: '10px' }}>
                {card.category}
              </span>
            </div>
            <div className="edu-card-body">
              <div className="edu-card-title">{card.title}</div>
              <div className="edu-card-excerpt">{card.excerpt}</div>
            </div>
            <div className="edu-card-footer">
              <span className="edu-card-read">
                Read more <span>→</span>
              </span>
              {card.formula && (
                <span className="tag tag-amber" style={{ fontSize: '9px' }}>
                  Formula
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
