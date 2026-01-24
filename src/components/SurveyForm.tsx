'use client';

import { useState } from 'react';
import { Survey, Question, Answer, ParticipationStatus } from '@/lib/types';
import styles from './SurveyForm.module.css';

interface SurveyFormProps {
    survey: Survey;
    onSubmit: (respondentName: string, answers: Answer[]) => Promise<void>;
}

export default function SurveyForm({ survey, onSubmit }: SurveyFormProps) {
    const [respondentName, setRespondentName] = useState('');
    const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleParticipationChange = (questionId: string, value: ParticipationStatus) => {
        setAnswers((prev) => ({ ...prev, [questionId]: value }));
    };

    const handleTextChange = (questionId: string, value: string) => {
        setAnswers((prev) => ({ ...prev, [questionId]: value }));
    };

    const handleMultipleChoiceChange = (questionId: string, option: string, checked: boolean) => {
        setAnswers((prev) => {
            const current = (prev[questionId] as string[]) || [];
            if (checked) {
                return { ...prev, [questionId]: [...current, option] };
            } else {
                return { ...prev, [questionId]: current.filter((o) => o !== option) };
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            const answerArray: Answer[] = Object.entries(answers).map(([questionId, value]) => ({
                questionId,
                value,
            }));

            await onSubmit(respondentName, answerArray);
            setIsSuccess(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : '送信に失敗しました');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className={styles.successContainer}>
                <div className={styles.successIcon}>✅</div>
                <h2 className={styles.successTitle}>回答を送信しました！</h2>
                <p className={styles.successMessage}>
                    ご協力ありがとうございました。
                </p>
            </div>
        );
    }

    const renderQuestion = (question: Question) => {
        switch (question.type) {
            case 'participation':
                return (
                    <div className={styles.participationOptions}>
                        {(['yes', 'no', 'undecided'] as ParticipationStatus[]).map((status) => (
                            <label key={status} className={styles.radioLabel}>
                                <input
                                    type="radio"
                                    name={question.id}
                                    value={status}
                                    checked={answers[question.id] === status}
                                    onChange={() => handleParticipationChange(question.id, status)}
                                    className={styles.radioInput}
                                />
                                <span className={`${styles.radioButton} ${styles[status]}`}>
                                    {status === 'yes' && '参加'}
                                    {status === 'no' && '不参加'}
                                    {status === 'undecided' && '未定'}
                                </span>
                            </label>
                        ))}
                    </div>
                );

            case 'multiple-choice':
                return (
                    <div className={styles.checkboxOptions}>
                        {question.options?.map((option) => (
                            <label key={option} className={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={(answers[question.id] as string[] || []).includes(option)}
                                    onChange={(e) => handleMultipleChoiceChange(question.id, option, e.target.checked)}
                                    className={styles.checkboxInput}
                                />
                                <span className={styles.checkboxText}>{option}</span>
                            </label>
                        ))}
                    </div>
                );

            case 'text':
                return (
                    <textarea
                        value={(answers[question.id] as string) || ''}
                        onChange={(e) => handleTextChange(question.id, e.target.value)}
                        className={styles.textInput}
                        placeholder="回答を入力してください"
                        rows={3}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.nameSection}>
                <label className={styles.label}>
                    お名前 <span className={styles.required}>*</span>
                </label>
                <input
                    type="text"
                    value={respondentName}
                    onChange={(e) => setRespondentName(e.target.value)}
                    className={styles.nameInput}
                    placeholder="山田 太郎"
                    required
                />
            </div>

            <div className={styles.questions}>
                {survey.questions.map((question, index) => (
                    <div key={question.id} className={styles.questionCard}>
                        <div className={styles.questionHeader}>
                            <span className={styles.questionNumber}>Q{index + 1}</span>
                            <h3 className={styles.questionText}>
                                {question.text}
                                {question.required && <span className={styles.required}>*</span>}
                            </h3>
                        </div>
                        {renderQuestion(question)}
                    </div>
                ))}
            </div>

            {error && (
                <div className={styles.error}>
                    <span className={styles.errorIcon}>⚠️</span>
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={isSubmitting || !respondentName}
                className={styles.submitButton}
            >
                {isSubmitting ? '送信中...' : '回答を送信'}
            </button>
        </form>
    );
}
