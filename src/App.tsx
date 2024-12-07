import React, { useEffect, useState, useCallback } from "react";
import "./App.css";
import FlipSound from "./assets/click.mp3";

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
  const timeLimits: TimeLimits = { 8: 60, 12: 90, 20: 120, 32: 180 };
  useEffect(() => {
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
    setTimeLeft(timeLimits[gridSize]);
  }, [gridSize]);

  useEffect(() => {
    resetGame();
  }, [gridSize, resetGame]);

  const onCardClick = (index: number) => {
    if (isDisabled || selectedIndices.includes(index)) return;
    const flipAudio = new Audio(FlipSound);
    flipAudio.play();
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
        }, 400);
      } else {
        setTimeout(() => {
          setSelectedIndices([]);
          setIsDisabled(false);
        }, 400);
      }
    }
  };

  useEffect(() => {
    if (matchedValues.length === gridSize / 2 && !gameWon) {
      setGameWon(true);
      alert("Congratulations, you won!");
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
    <div className=" w-[100vw] min-h-screen bg-[#F2F9FE] overflow-x-hidden relative">
      <p className="ZenDots-Regular text-center text-4xl p-5">Memgam</p>
      <div className="flex justify-center items-center">
        <div>
          <div className="absolute inset-0 bg-gradient-[100deg] from-sky-300/10 via-indigo-300/10 to-pink-300/10 [-webkit-mask-image:linear-gradient(to_bottom,rgba(255,255,255,1)_75%,rgba(255,255,255,0))]"></div>
          <div className="w-full rotate-3 absolute -inset-x-12 top-6 h-12 bg-gradient-to-r from-sky-300 via-indigo-300 to-pink-300 blur-3xl"></div>

          <div className="relative bg-clip-padding border rounded-xl bg-white/40 border-white/90 shadow transition-colors duration-300 p-6">
            <div className="grid grid-cols-4">
              <div
                onClick={() => setGridSize(8)}
                className={`h-10 col-span-1 text-center last:border-none border-r border-r-slate-300 flex justify-center items-center`}
                role="button"
              >
                <div
                  className={`px-5 py-2 rounded-full flex justify-center items-center rounded-lg ${gridSize === 8 ? "shadow-lg shadow-green-800/5 bg-green-100" : ""}`} // Apply the rounded background to the child div
                >
                  Easy
                </div>
              </div>

              <div
                onClick={() => setGridSize(12)}
                className={`h-10 col-span-1 text-center last:border-none border-r border-r-slate-300 flex justify-center items-center`}
                role="button"
              >
                <div
                  className={`px-5 py-2 rounded-full flex justify-center items-center  ${gridSize === 12 ? "shadow-lg shadow-blue-800/5 bg-blue-100" : ""}`} // Apply the rounded background to the child div
                >
                  Medium
                </div>
              </div>

              <div
                onClick={() => setGridSize(20)}
                className={`h-10 col-span-1 text-center last:border-none border-r border-r-slate-300 flex justify-center items-center`}
                role="button"
              >
                <div
                  className={`px-5 py-2 rounded-full flex justify-center items-center rounded-lg ${gridSize === 20 ? "shadow-lg shadow-yellow-800/5 bg-yellow-200" : ""}`} // Apply the rounded background to the child div
                >
                  Hard
                </div>
              </div>

              <div
                onClick={() => setGridSize(32)}
                className={`h-10 col-span-1 text-center last:border-none flex justify-center items-center`}
                role="button"
              >
                <div
                  className={`px-5 py-2 rounded-full flex justify-center items-center rounded-lg ${gridSize === 32 ? "shadow-lg shadow-red-800/5 bg-red-300" : ""}`} // Apply the rounded background to the child div
                >
                  Very Hard
                </div>
              </div>
            </div>

          
            <button
              className="flex-none group relative text-base sm:text-sm -ml-2 my-1 inline-flex items-center bg-clip-padding rounded-l-[20px] rounded-r-[8px] border h-8 pl-3 pr-[10px] bg-white/40 border-white/90 shadow hover:text-violet-600 hover:bg-violet-50/40 transition-colors duration-300"
              onClick={retryGame}
            >
              Retry
            </button>
            <div className={`grid grid-cols-4 ${gridSize > 16 ? "sm:grid-cols-8" : "sm:grid-cols-4"} gap-4 p-4 mt-4`}>
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

const MemoizedCard = React.memo(({ val, isClicked, handleCardClick, index, isCompleted }: CardProps) => {
  // Determine the appropriate Tailwind classes based on card state
  const baseClasses =
    "Doto-Bold rounded-lg h-12 w-12 sm:h-16 sm:w-16 flex items-center justify-center text-3xl font-extrabold transition-transform transform active:scale-95";

  const stateClasses = isCompleted
    ? "bg-[#54faa6] shadow-lg shadow-green-500/50" // Completed state (first color)
    : isClicked
    ? "bg-yellow-200 shadow-lg shadow-yellow-400/50" // Clicked state (second color)
    : "bg-blue-100 shadow-lg shadow-blue-300/50"; // Normal state (third color)

  return (
    <div
      role="button"
      onClick={() => handleCardClick(index)}
      className={`${baseClasses} ${stateClasses}  cursor-pointer m-5 transition-transform duration-100`}
      style={{
        transform: isCompleted || isClicked ? "rotateY(0deg)" : "rotateY(360deg)", // Apply rotation when clicked
        transformOrigin: "center", // Ensure rotation happens around the center
      }}
    >
      {isCompleted || isClicked ? val : "?"}
    </div>
  );
}); 

export default App;
