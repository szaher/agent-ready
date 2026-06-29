import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Quiz from "@/components/Quiz";
import type { QuizQuestion } from "@/types";

const questionsWithExplanation: QuizQuestion[] = [
  {
    question: "What does GIL stand for?",
    options: ["Global Interpreter Lock", "General Input Layer", "Graphics Interface Library"],
    correctIndex: 0,
    explanation: "The GIL is Python's Global Interpreter Lock.",
  },
];

const questionsWithoutExplanation: QuizQuestion[] = [
  {
    question: "What color is the sky?",
    options: ["Blue", "Green", "Red"],
    correctIndex: 0,
  },
];

const twoQuestions: QuizQuestion[] = [
  {
    question: "First question?",
    options: ["A", "B"],
    correctIndex: 0,
    explanation: "A is correct.",
  },
  {
    question: "Second question?",
    options: ["X", "Y"],
    correctIndex: 1,
    explanation: "Y is correct.",
  },
];

describe("Quiz", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the question", () => {
    render(<Quiz questions={questionsWithExplanation} onComplete={vi.fn()} />);
    expect(screen.getByText("What does GIL stand for?")).toBeDefined();
  });

  it("shows all options", () => {
    render(<Quiz questions={questionsWithExplanation} onComplete={vi.fn()} />);
    expect(screen.getByText("Global Interpreter Lock")).toBeDefined();
    expect(screen.getByText("General Input Layer")).toBeDefined();
  });

  it("calls onComplete with score after clicking See Results", () => {
    const onComplete = vi.fn();
    render(<Quiz questions={questionsWithExplanation} onComplete={onComplete} />);
    fireEvent.click(screen.getByText("Global Interpreter Lock"));
    fireEvent.click(screen.getByText("Submit"));
    fireEvent.click(screen.getByText("See Results"));
    expect(onComplete).toHaveBeenCalledWith(1);
  });

  it("shows explanation after submitting correct answer", () => {
    render(<Quiz questions={questionsWithExplanation} onComplete={vi.fn()} />);
    fireEvent.click(screen.getByText("Global Interpreter Lock"));
    fireEvent.click(screen.getByText("Submit"));
    expect(screen.getByText("The GIL is Python's Global Interpreter Lock.")).toBeDefined();
  });

  it("shows explanation after submitting incorrect answer", () => {
    render(<Quiz questions={questionsWithExplanation} onComplete={vi.fn()} />);
    fireEvent.click(screen.getByText("General Input Layer"));
    fireEvent.click(screen.getByText("Submit"));
    expect(screen.getByText("The GIL is Python's Global Interpreter Lock.")).toBeDefined();
  });

  it("does not render empty explanation block when explanation is absent", () => {
    render(<Quiz questions={questionsWithoutExplanation} onComplete={vi.fn()} />);
    fireEvent.click(screen.getByText("Blue"));
    fireEvent.click(screen.getByText("Submit"));
    const container = document.querySelector(".my-6");
    const explanationBlock = container?.querySelector("p.bg-\\[var\\(--bg-tertiary\\)\\]");
    expect(explanationBlock).toBeNull();
  });

  it("does not show explanation before submission", () => {
    render(<Quiz questions={questionsWithExplanation} onComplete={vi.fn()} />);
    fireEvent.click(screen.getByText("Global Interpreter Lock"));
    expect(screen.queryByText("The GIL is Python's Global Interpreter Lock.")).toBeNull();
  });

  it("shows Next button between questions and See Results on last question", () => {
    render(<Quiz questions={twoQuestions} onComplete={vi.fn()} />);
    fireEvent.click(screen.getByText("A"));
    fireEvent.click(screen.getByText("Submit"));
    expect(screen.getByText("A is correct.")).toBeDefined();
    expect(screen.getByText("Next")).toBeDefined();

    fireEvent.click(screen.getByText("Next"));
    expect(screen.getByText("Second question?")).toBeDefined();

    fireEvent.click(screen.getByText("Y"));
    fireEvent.click(screen.getByText("Submit"));
    expect(screen.getByText("Y is correct.")).toBeDefined();
    expect(screen.getByText("See Results")).toBeDefined();
  });
});
