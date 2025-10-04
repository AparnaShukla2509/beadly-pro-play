import { useState, useEffect } from "react";
import { AbacusDragDrop } from "@/components/AbacusDragDrop";
import { GameControls, GameMode } from "@/components/GameControls";
import { TaskDisplay } from "@/components/TaskDisplay";
import { FeedbackDisplay } from "@/components/FeedbackDisplay";
import { toast } from "sonner";

const Index = () => {
  const [mode, setMode] = useState<GameMode>("normal");
  const [task, setTask] = useState("");
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [userAnswer, setUserAnswer] = useState(0);
  const [input1, setInput1] = useState(0);
  const [input2, setInput2] = useState(0);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [feedback, setFeedback] = useState<boolean | null>(null);

  useEffect(() => {
    generateNewTask();
  }, [mode]);

  const generateRandomNumber = () => {
    return Math.round((Math.random() * 9 + 1) * 100) / 100;
  };

  const generateNewTask = () => {
    const n1 = generateRandomNumber();
    const n2 = generateRandomNumber();
    
    setNum1(n1);
    setNum2(n2);
    setFeedback(null);

    if (mode === "normal") {
      setTask(n1.toFixed(2));
      setCorrectAnswer(n1);
      setUserAnswer(0);
    } else if (mode === "addition") {
      setTask(`${n1.toFixed(2)} + ${n2.toFixed(2)} = ?`);
      setCorrectAnswer(Math.round((n1 + n2) * 100) / 100);
      setInput1(n1);
      setInput2(n2);
      setUserAnswer(0);
    } else {
      const larger = Math.max(n1, n2);
      const smaller = Math.min(n1, n2);
      setTask(`${larger.toFixed(2)} - ${smaller.toFixed(2)} = ?`);
      setCorrectAnswer(Math.round((larger - smaller) * 100) / 100);
      setInput1(larger);
      setInput2(smaller);
      setUserAnswer(0);
    }

    toast.success("New task generated! 🎯");
  };

  const handleReset = () => {
    setUserAnswer(0);
    if (mode === "addition" || mode === "subtraction") {
      setInput1(0);
      setInput2(0);
    }
    setFeedback(null);
    toast.info("Reset! ↺");
  };

  const handleCheck = () => {
    const isCorrect = Math.abs(userAnswer - correctAnswer) < 0.01;
    setFeedback(isCorrect);

    if (isCorrect) {
      toast.success("🎉 Correct! Well done!");
    } else {
      toast.error("Try again! Keep practicing!");
    }

    setTimeout(() => {
      setFeedback(null);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background py-6 px-4 md:py-12">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-primary mb-2 md:mb-4">
            🧮 Abacus Game
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            Learn math with fun! Drag and drop beads onto the rods
          </p>
        </div>

        {/* Game Controls */}
        <div className="mb-8">
          <GameControls
            mode={mode}
            onModeChange={setMode}
            onReset={handleReset}
            onCheck={handleCheck}
            onNewTask={generateNewTask}
            showCheck={mode !== "normal" || userAnswer > 0}
          />
        </div>

        {/* Task Display */}
        <div className="mb-8">
          <TaskDisplay task={task} mode={mode} />
        </div>

        {/* Abacus Display */}
        <div className="space-y-8">
          {mode === "normal" && (
            <AbacusDragDrop
              value={userAnswer}
              onChange={setUserAnswer}
              label="Your Answer"
              showValue={true}
            />
          )}

          {mode === "addition" && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <AbacusDragDrop
                  value={input1}
                  onChange={setInput1}
                  readonly={false}
                  label={`First Number: ${num1.toFixed(2)}`}
                  showValue={true}
                />
                <AbacusDragDrop
                  value={input2}
                  onChange={setInput2}
                  readonly={false}
                  label={`Second Number: ${num2.toFixed(2)}`}
                  showValue={true}
                />
              </div>
              <div className="flex justify-center">
                <div className="text-3xl md:text-5xl font-bold text-primary my-2 md:my-4">=</div>
              </div>
              <AbacusDragDrop
                value={userAnswer}
                onChange={setUserAnswer}
                label="Your Answer"
                showValue={true}
                readonly={false}
              />
            </>
          )}

          {mode === "subtraction" && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <AbacusDragDrop
                  value={input1}
                  onChange={setInput1}
                  readonly={false}
                  label={`First Number: ${Math.max(num1, num2).toFixed(2)}`}
                  showValue={true}
                />
                <AbacusDragDrop
                  value={input2}
                  onChange={setInput2}
                  readonly={false}
                  label={`Second Number: ${Math.min(num1, num2).toFixed(2)}`}
                  showValue={true}
                />
              </div>
              <div className="flex justify-center">
                <div className="text-3xl md:text-5xl font-bold text-primary my-2 md:my-4">=</div>
              </div>
              <AbacusDragDrop
                value={userAnswer}
                onChange={setUserAnswer}
                label="Your Answer"
                showValue={true}
                readonly={false}
              />
            </>
          )}
        </div>
      </div>

      {/* Feedback Modal */}
      {feedback !== null && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setFeedback(null)} />
          <FeedbackDisplay isCorrect={feedback} correctAnswer={correctAnswer} />
        </>
      )}
    </div>
  );
};

export default Index;
