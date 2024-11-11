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
  const [gameWon, setGameWon] = useState<boolean>(false);
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
    const timer: any = timeLeft > 0 && !gameWon && setInterval(() => setTimeLeft((t) => t - 1), 1000);
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
    setGameWon(false);
    const timeLimits: TimeLimits = { 8: 60, 16: 90, 32: 120, 64: 180 };
    setTimeLeft(timeLimits[gridSize]);
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
    if (matchedValues.length === gridSize / 2 && !gameWon) {
      setGameWon(true);
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
    }
  }, [matchedValues, gridSize, timeLeft]);

  const retryGame = () => {
    setTotalTries(0);
    setSelectedIndices([]);
    setMatchedValues([]);
    resetGame();
    setGameWon(false);
  };

  return (
    <div className="flex w-[100vw] h-[100vh] bg-[#F2F9FE] justify-center items-center">
      <div className="">
        <div className="absolute inset-0 bg-gradient-[100deg] from-sky-300/10 via-indigo-300/10 to-pink-300/10 [-webkit-mask-image:linear-gradient(to_bottom,rgba(255,255,255,1)_75%,rgba(255,255,255,0))]"></div>
        <div className="w-full rotate-3 absolute -inset-x-12 top-6 h-12 bg-gradient-to-r from-sky-300 via-indigo-300 to-pink-300 blur-3xl"></div>
        <div className="relative bg-clip-padding border rounded-xl bg-white/40 border-white/90 shadow hover:text-violet-600 hover:bg-violet-50/40 transition-colors duration-300">
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
        </div>
      </div>
    </div>
  );
}

interface CardProps {
  val: number;
  index: number;
  isClicked: boolean;
  isCompleted: boolean;
  handleCardClick: (index: number) => void;
}

const Card = React.memo(({ val, isClicked, handleCardClick, index, isCompleted }: CardProps) => {
  // Determine the appropriate Tailwind classes based on card state
  const baseClasses = "rounded-lg h-16 w-16 flex items-center justify-center text-lg font-bold transition-transform transform active:scale-95";

  const stateClasses = isCompleted
    ? "bg-green-400 shadow-lg shadow-green-500/30" // Completed state (first color)
    : isClicked
    ? "bg-yellow-200 shadow-lg shadow-yellow-400/50" // Clicked state (second color)
    : "bg-blue-100 shadow-lg shadow-blue-300/50"; // Normal state (third color)

  return (
    <div role="button" onClick={() => handleCardClick(index)} className={`${baseClasses} ${stateClasses} cursor-pointer m-5`}>
      {isCompleted || isClicked ? val : "?"}
    </div>
  );
});

const MemoizedCard = React.memo(Card);

export default App;
