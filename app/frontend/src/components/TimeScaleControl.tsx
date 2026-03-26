/**
 * Time scale control (+/- zoom buttons)
 * Monthly ↔ Weekly ↔ Daily
 */

interface TimeScaleControlProps {
  currentLevel: number;
  onLevelChange: (level: number) => void;
}

const LEVEL_LABELS = ['Monthly', 'Weekly', 'Daily'];
const MIN_LEVEL = 0;
const MAX_LEVEL = 2;

export default function TimeScaleControl({ currentLevel, onLevelChange }: TimeScaleControlProps) {
  const canZoomOut = currentLevel > MIN_LEVEL;
  const canZoomIn = currentLevel < MAX_LEVEL;

  const handleZoomOut = () => {
    if (canZoomOut) {
      onLevelChange(currentLevel - 1);
    }
  };

  const handleZoomIn = () => {
    if (canZoomIn) {
      onLevelChange(currentLevel + 1);
    }
  };

  return (
    <div className="time-scale-control" title="Adjust timescale">
      <button
        className="scale-btn"
        onClick={handleZoomOut}
        disabled={!canZoomOut}
        title="Zoom out"
      >
        −
      </button>
      <span className="scale-label">{LEVEL_LABELS[currentLevel]}</span>
      <button
        className="scale-btn"
        onClick={handleZoomIn}
        disabled={!canZoomIn}
        title="Zoom in"
      >
        +
      </button>
    </div>
  );
}
