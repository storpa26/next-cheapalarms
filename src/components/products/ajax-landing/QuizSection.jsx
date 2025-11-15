import Link from "next/link";
import { useMemo, useState } from "react";

const questions = [
  {
    id: "brain",
    prompt: "Which part is the brain that talks to every sensor?",
    options: [
      { value: "hub", label: "Hub 2" },
      { value: "siren", label: "Outdoor siren" },
      { value: "panic", label: "Panic button" },
    ],
    answer: "hub",
    explanation: "Hub 2 is the command center. Sirens and panic buttons are helpers.",
  },
  {
    id: "glass",
    prompt: "What should you add if you worry about windows smashing?",
    options: [
      { value: "glass", label: "Glass listener" },
      { value: "motion", label: "Hallway motion" },
      { value: "relay", label: "Automation relay" },
    ],
    answer: "glass",
    explanation: "Glass listeners hear the break instantly, even if no door opens.",
  },
  {
    id: "backup",
    prompt: "Why do we keep 4G backup on?",
    options: [
      { value: "faster", label: "Makes Wi‑Fi faster" },
      { value: "offline", label: "Sends alerts when Wi‑Fi naps" },
      { value: "lights", label: "Turns on lights" },
    ],
    answer: "offline",
    explanation: "4G makes sure alarm messages still leave when internet drops.",
  },
  {
    id: "placement",
    prompt: "Where would you stick a panic button?",
    options: [
      { value: "counter", label: "Store counter" },
      { value: "mailbox", label: "Mailbox outside" },
      { value: "attic", label: "Hidden attic" },
    ],
    answer: "counter",
    explanation: "Keep it within reach of the person who might need quick help.",
  },
  {
    id: "pets",
    prompt: "You have pets and a backyard. Which combo makes sense?",
    options: [
      { value: "petOutdoor", label: "Pet-friendly motion + yard sensor" },
      { value: "keypad", label: "Extra keypad" },
      { value: "glassOnly", label: "Glass listener only" },
    ],
    answer: "petOutdoor",
    explanation: "Indoor pet-friendly PIR plus outdoor motion covers both zones.",
  },
];

export default function QuizSection() {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});

  const score = useMemo(
    () => Object.values(answers).filter((ans) => ans.isCorrect).length,
    [answers],
  );

  const activeQuestion = questions[current];
  const progressPercent = Math.round(((current + 1) / questions.length) * 100);

  function handleAnswer(option) {
    if (answers[activeQuestion.id]) return;
    const isCorrect = option === activeQuestion.answer;
    setAnswers((prev) => ({
      ...prev,
      [activeQuestion.id]: { value: option, isCorrect },
    }));
  }

  function nextQuestion() {
    if (current < questions.length - 1) {
      setCurrent((prev) => prev + 1);
    }
  }

  function restartQuiz() {
    setAnswers({});
    setCurrent(0);
  }

  const answeredCurrent = answers[activeQuestion.id];

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-4xl px-6">
        <div className="rounded-[32px] border border-slate-200 bg-slate-50 p-10 shadow-xl">
          <div className="flex flex-col gap-3 text-center">
            <p className="text-sm uppercase tracking-[0.4em] text-slate-400">Optional quiz</p>
            <h2 className="text-3xl font-semibold text-slate-900">Did the story stick?</h2>
            <p className="text-sm text-slate-600">
              5 tiny questions. Collect badges and make sure Hub 2 makes total sense.
            </p>
          </div>
          <div className="mt-8">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
              <span>
                Question {current + 1} / {questions.length}
              </span>
              <span>Score: {score}/{questions.length}</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-blue-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-inner">
            <p className="text-sm font-semibold text-emerald-600">Security Sense Check</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">{activeQuestion.prompt}</h3>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {activeQuestion.options.map((option) => {
                const selected = answeredCurrent?.value === option.value;
                const isCorrect =
                  answeredCurrent &&
                  selected &&
                  answeredCurrent?.value === activeQuestion.answer;
                const isWrong =
                  answeredCurrent && selected && answeredCurrent?.value !== activeQuestion.answer;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleAnswer(option.value)}
                    className={`rounded-2xl border px-4 py-4 text-left text-sm font-semibold transition ${
                      selected
                        ? isCorrect
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-rose-400 bg-rose-50 text-rose-700"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
            {answeredCurrent ? (
              <div className="mt-6 rounded-2xl bg-slate-900/90 p-4 text-sm text-white">
                <p className="font-semibold">
                  {answeredCurrent.isCorrect ? "Nice! ✅" : "Almost! 🤔"}
                </p>
                <p className="text-white/80">{activeQuestion.explanation}</p>
              </div>
            ) : null}
            <div className="mt-6 flex flex-wrap gap-3">
              {current < questions.length - 1 ? (
                <button
                  type="button"
                  onClick={nextQuestion}
                  disabled={!answeredCurrent}
                  className={`rounded-full px-5 py-2 text-sm font-semibold ${
                    answeredCurrent
                      ? "bg-slate-900 text-white hover:bg-slate-800"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  Next question →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={restartQuiz}
                  disabled={!answeredCurrent}
                  className={`rounded-full px-5 py-2 text-sm font-semibold ${
                    answeredCurrent
                      ? "bg-emerald-500 text-slate-900 hover:bg-emerald-400"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  Restart quiz
                </button>
              )}
              <Link
                href="/products/sample"
                className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 hover:border-slate-300"
              >
                Jump to builder
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

