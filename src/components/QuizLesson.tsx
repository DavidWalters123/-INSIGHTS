import React, { useState } from 'react';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import type { Quiz, QuizAttempt } from '../types';
import { auth, db } from '../lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

interface QuizLessonProps {
  quiz: Quiz;
  onComplete: (attempt: QuizAttempt) => void;
}

export default function QuizLesson({ quiz, onComplete }: QuizLessonProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const calculateScore = () => {
    let correct = 0;
    selectedAnswers.forEach((answer, index) => {
      if (answer === quiz.questions[index].correct_answer) {
        correct++;
      }
    });
    return Math.round((correct / quiz.questions.length) * 100);
  };

  const handleSubmit = async () => {
    if (!auth.currentUser) return;
    
    setIsSubmitting(true);
    try {
      const score = calculateScore();
      const attemptData: Partial<QuizAttempt> = {
        quiz_id: quiz.id,
        user_id: auth.currentUser.uid,
        score,
        completed_at: serverTimestamp(),
        answers: quiz.questions.map((_, index) => ({
          question_id: quiz.questions[index].id,
          selected_answer: selectedAnswers[index]
        }))
      };

      const docRef = await addDoc(collection(db, 'quiz_attempts'), attemptData);
      const attempt = { id: docRef.id, ...attemptData } as QuizAttempt;
      
      onComplete(attempt);
      setShowResults(true);
      
      if (score >= quiz.passing_score) {
        toast.success('Congratulations! You passed the quiz!');
      } else {
        toast.error('You did not meet the passing score. Try again!');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Failed to submit quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQ = quiz.questions[currentQuestion];

  if (showResults) {
    return (
      <div className="bg-surface border border-surface-light rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Quiz Results</h2>
        <div className="mb-6">
          <div className="text-4xl font-bold text-primary mb-2">
            {calculateScore()}%
          </div>
          <p className="text-gray-400">
            Passing score: {quiz.passing_score}%
          </p>
        </div>

        <div className="space-y-6">
          {quiz.questions.map((question, index) => {
            const isCorrect = selectedAnswers[index] === question.correct_answer;
            return (
              <div key={question.id} className="space-y-2">
                <div className="flex items-start space-x-2">
                  {isCorrect ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-1" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 mt-1" />
                  )}
                  <div>
                    <p className="text-white font-medium">{question.question}</p>
                    <div className="mt-2 space-y-1">
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className={`p-2 rounded ${
                            optionIndex === question.correct_answer
                              ? 'bg-green-500/10 text-green-500'
                              : optionIndex === selectedAnswers[index]
                              ? 'bg-red-500/10 text-red-500'
                              : 'text-gray-400'
                          }`}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                    {question.explanation && (
                      <p className="mt-2 text-sm text-gray-400">
                        {question.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-surface-light rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">
          Question {currentQuestion + 1} of {quiz.questions.length}
        </h2>
        <div className="text-sm text-gray-400">
          Passing score: {quiz.passing_score}%
        </div>
      </div>

      <div className="space-y-6">
        <p className="text-lg text-white">{currentQ.question}</p>

        <div className="space-y-3">
          {currentQ.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              className={`w-full p-3 text-left rounded-lg border ${
                selectedAnswers[currentQuestion] === index
                  ? 'border-primary bg-primary/10 text-white'
                  : 'border-surface-light text-gray-300 hover:border-primary/50'
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="flex justify-between pt-4">
          <button
            onClick={() => setCurrentQuestion(currentQuestion - 1)}
            disabled={currentQuestion === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-surface-light rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {currentQuestion === quiz.questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={selectedAnswers.length !== quiz.questions.length || isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Quiz
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
              disabled={selectedAnswers[currentQuestion] === undefined}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}