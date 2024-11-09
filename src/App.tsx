import React, { useEffect, useState, useCallback } from "react";
import "./App.css";

function App() {
  const [gridSize, setGridSize] = useState<number>(8);
  const [shuffledNumbers, setShuffledNumbers] = useState<number[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [matchedValues, setMatchedValues] = useState<number[]>([]);
  const [totalTries, setTotalTries] = useState<number>(0);
  const [isDisabled, setIsDisabled] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  type TimeLimits = { [key: number]: number };
  const [bestScore, setBestScore] = useState<number | null>(null);

  useEffect(() => {
    const timeLimits: TimeLimits = { 8: 60, 16: 90, 32: 120, 64: 180 };
    setTimeLeft(timeLimits[gridSize]);
    const bestScore = localStorage.getItem("bestScore");
    const parsedBestScore = bestScore ? JSON.parse(bestScore) : {};
    const score = parsedBestScore[gridSize] || null;
    setBestScore(score);
  }, [gridSize]);

  useEffect(() => {
    const timer: any = timeLeft > 0 && setInterval(() => setTimeLeft((t) => t - 1), 1000);
    if (timeLeft === 0) alert("Time's up! Try again.");
    return () => clearInterval(timer);
  }, [timeLeft]);

  const shuffleArray = (array: number[]) => array.sort(() => Math.random() - 0.5);

  const resetGame = useCallback(() => {
    const numberPairs = Array.from({ length: gridSize / 2 }, (_, i) => i + 1);
    setShuffledNumbers(shuffleArray([...numberPairs, ...numberPairs]));
    setSelectedIndices([]);
    setMatchedValues([]);
    setTotalTries(0);
    setIsDisabled(false);
  }, [gridSize]);

  useEffect(() => {
    resetGame();
  }, [gridSize, resetGame]);

  const onCardClick = (index: number) => {
    if (isDisabled || selectedIndices.includes(index)) return;

    const newSelected = [...selectedIndices, index];
    setSelectedIndices(newSelected);

    if (newSelected.length === 2) {
      setTotalTries((prev) => prev + 1);
      setIsDisabled(true);

      const [firstIndex, secondIndex] = newSelected;
      if (shuffledNumbers[firstIndex] === shuffledNumbers[secondIndex]) {
        setMatchedValues((prev) => [...prev, shuffledNumbers[firstIndex]]);
        setTimeout(() => {
          setSelectedIndices([]);
          setIsDisabled(false);
        }, 500);
      } else {
        setTimeout(() => {
          setSelectedIndices([]);
          setIsDisabled(false);
        }, 500);
      }
    }
  };

  useEffect(() => {
    if (matchedValues.length === gridSize / 2) {
      alert("Congratulations, you won!");
      const timeLimits: TimeLimits = { 8: 60, 16: 90, 32: 120, 64: 180 };
      const utilizedTime = timeLimits[gridSize] - timeLeft;
      const bestScoreInStorage = localStorage.getItem("bestScore");
      let parsedBestScore = bestScoreInStorage ? JSON.parse(bestScoreInStorage) : {};
      if (!parsedBestScore[gridSize] || utilizedTime < parsedBestScore[gridSize]) {
        parsedBestScore[gridSize] = utilizedTime;
        localStorage.setItem("bestScore", JSON.stringify(parsedBestScore));
        setBestScore(utilizedTime);
        alert(`New Best Score: ${utilizedTime} secs!`);
      }
      setTimeLeft(0);
    }
  }, [matchedValues, gridSize, timeLeft, bestScore]);

  const retryGame = () => {
    setTotalTries(0);
    setSelectedIndices([]);
    setMatchedValues([]);
    resetGame();
  };

  return (
    <>
      <select onChange={(e) => setGridSize(Number(e.target.value))}>
        <option value={8}>Easy (8)</option>
        <option value={16}>Medium (16)</option>
        <option value={32}>Hard (32)</option>
        <option value={64}>Very Hard (64)</option>
      </select>
      <button
        className="flex-none group relative text-base sm:text-sm -ml-2 my-1 inline-flex items-center bg-clip-padding rounded-l-[20px] rounded-r-[8px] border h-8 pl-3 pr-[10px] bg-white/40 border-white/90 shadow hover:text-violet-600 hover:bg-violet-50/40 transition-colors duration-300"
        onClick={retryGame}
      >
        Retry
      </button>
      <div className={`grid ${gridSize === 64 ? "grid-cols-8" : gridSize > 16 ? "grid-cols-8" : "grid-cols-4"}`}>
        {shuffledNumbers.map((val, i) => (
          <MemoizedCard
            key={i}
            val={val}
            index={i}
            isClicked={selectedIndices.includes(i)}
            isCompleted={matchedValues.includes(val)}
            handleCardClick={onCardClick}
          />
        ))}
      </div>
      <p>Time Left: {timeLeft}s</p>
      <p>Total Tries: {totalTries}</p>
      {bestScore && <p>Best Score: {bestScore} secs</p>}
      {matchedValues.length === gridSize / 2 && <p>Congratulations, you won!</p>}
    </>
  );
}

interface CardProps {
  val: number;
  index: number;
  isClicked: boolean;
  isCompleted: boolean;
  handleCardClick: (index: number) => void;
}

const Card = React.memo(({ val, isClicked, handleCardClick, index, isCompleted }: CardProps) => (
  <div
    role="button"
    onClick={() => handleCardClick(index)}
    className={`rounded text-black h-12 w-12 ml-5 mt-5 p-3 ${isCompleted ? "bg-green-200" : "bg-slate-50"} active:scale-95 active:shadow-lg focus:outline-none`}
  >
    {isCompleted || isClicked ? val : "?"}
  </div>
));

const MemoizedCard = React.memo(Card);

export default App;
