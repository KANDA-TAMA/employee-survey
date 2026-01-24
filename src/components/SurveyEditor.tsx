'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Question, QuestionType, SurveyFormData } from '@/lib/types';
import styles from './SurveyEditor.module.css';

interface SurveyEditorProps {
    initialData?: SurveyFormData;
    surveyId?: string;
    isEditing?: boolean;
}

export default function SurveyEditor({ initialData, surveyId, isEditing = false }: SurveyEditorProps) {
    const router = useRouter();
    const [formData, setFormData] = useState<SurveyFormData>(initialData || {
        title: '',
        description: '',
        questions: [
            {
                id: crypto.randomUUID(),
                type: 'participation',
                text: '参加しますか？',
                required: true,
            }
        ],
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleBasicChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const addQuestion = () => {
        setFormData((prev) => ({
            ...prev,
            questions: [
                ...prev.questions,
                {
                    id: crypto.randomUUID(),
                    type: 'text',
                    text: '',
                    required: false,
                },
            ],
        }));
    };

    const removeQuestion = (id: string) => {
        setFormData((prev) => ({
            ...prev,
            questions: prev.questions.filter((q) => q.id !== id),
        }));
    };

    const updateQuestion = (id: string, updates: Partial<Question>) => {
        setFormData((prev) => ({
            ...prev,
            questions: prev.questions.map((q) => (q.id === id ? { ...q, ...updates } : q)),
        }));
    };

    const handleOptionChange = (questionId: string, index: number, value: string) => {
        setFormData((prev) => ({
            ...prev,
            questions: prev.questions.map((q) => {
                if (q.id !== questionId) return q;
                const newOptions = [...(q.options || [])];
                newOptions[index] = value;
                return { ...q, options: newOptions };
            }),
        }));
    };

    const addOption = (questionId: string) => {
        setFormData((prev) => ({
            ...prev,
            questions: prev.questions.map((q) => {
                if (q.id !== questionId) return q;
                return { ...q, options: [...(q.options || []), ''] };
            }),
        }));
    };

    const removeOption = (questionId: string, index: number) => {
        setFormData((prev) => ({
            ...prev,
            questions: prev.questions.map((q) => {
                if (q.id !== questionId) return q;
                return { ...q, options: (q.options || []).filter((_, i) => i !== index) };
            }),
        }));
    };

    const moveQuestion = (index: number, direction: 'up' | 'down') => {
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === formData.questions.length - 1)
        ) return;

        const newQuestions = [...formData.questions];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newQuestions[index], newQuestions[targetIndex]] = [newQuestions[targetIndex], newQuestions[index]];

        setFormData(prev => ({ ...prev, questions: newQuestions }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const url = isEditing && surveyId ? `/api/surveys?id=${surveyId}` : '/api/surveys';
            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                let errorMessage = `Error ${res.status}: ${res.statusText}`;
                try {
                    const errorData = await res.json();
                    if (errorData.error) errorMessage = errorData.error;
                } catch (e) {
                    // unexpected response (e.g. HTML 500 page)
                    const text = await res.text();
                    errorMessage += ` | Raw: ${text.substring(0, 100)}...`;
                }
                throw new Error(errorMessage);
            }

            router.push('/admin');
            router.refresh();
        } catch (err) {
            console.error('Submit Error:', err);
            setError(err instanceof Error ? err.message : '予期せぬエラー (v5)');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.container}>
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>【正式版】従業員アンケート調査システム</h2>
                <div className={styles.field}>
                    <label className={styles.label}>アンケートタイトル <span className={styles.required}>*</span></label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleBasicChange}
                        className={styles.input}
                        placeholder="例: 12月度 社員総会"
                        required
                    />
                </div>
                <div className={styles.field}>
                    <label className={styles.label}>説明</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleBasicChange}
                        className={styles.textarea}
                        placeholder="アンケートの目的や詳細を入力してください"
                        rows={3}
                    />
                </div>
            </div>

            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>質問リスト</h2>
                    <button type="button" onClick={addQuestion} className={styles.addButton}>
                        ＋ 質問を追加
                    </button>
                </div>

                <div className={styles.questionList}>
                    {formData.questions.map((question, index) => (
                        <div key={question.id} className={styles.questionCard}>
                            <div className={styles.cardHeader}>
                                <span className={styles.questionIndex}>Q{index + 1}</span>
                                <div className={styles.cardActions}>
                                    <button type="button" onClick={() => moveQuestion(index, 'up')} disabled={index === 0} className={styles.iconButton}>↑</button>
                                    <button type="button" onClick={() => moveQuestion(index, 'down')} disabled={index === formData.questions.length - 1} className={styles.iconButton}>↓</button>
                                    <button type="button" onClick={() => removeQuestion(question.id)} className={`${styles.iconButton} ${styles.deleteButton}`} disabled={formData.questions.length === 1}>🗑️</button>
                                </div>
                            </div>

                            <div className={styles.cardBody}>
                                <div className={styles.row}>
                                    <div className={styles.col}>
                                        <label className={styles.subLabel}>質問文 <span className={styles.required}>*</span></label>
                                        <input
                                            type="text"
                                            value={question.text}
                                            onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
                                            className={styles.input}
                                            required
                                        />
                                    </div>
                                    <div className={styles.colShort}>
                                        <label className={styles.subLabel}>形式</label>
                                        <select
                                            value={question.type}
                                            onChange={(e) => updateQuestion(question.id, { type: e.target.value as QuestionType })}
                                            className={styles.select}
                                        >
                                            <option value="participation">参加確認</option>
                                            <option value="text">テキスト入力</option>
                                            <option value="multiple-choice">複数選択</option>
                                        </select>
                                    </div>
                                </div>

                                <div className={styles.row}>
                                    <label className={styles.checkboxLabel}>
                                        <input
                                            type="checkbox"
                                            checked={question.required}
                                            onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
                                        />
                                        必須回答にする
                                    </label>
                                </div>

                                {question.type === 'multiple-choice' && (
                                    <div className={styles.optionsArea}>
                                        <label className={styles.subLabel}>選択肢</label>
                                        {(question.options || []).map((option, optIndex) => (
                                            <div key={optIndex} className={styles.optionRow}>
                                                <input
                                                    type="text"
                                                    value={option}
                                                    onChange={(e) => handleOptionChange(question.id, optIndex, e.target.value)}
                                                    className={styles.input}
                                                    placeholder={`選択肢 ${optIndex + 1}`}
                                                />
                                                <button type="button" onClick={() => removeOption(question.id, optIndex)} className={styles.removeOption}>×</button>
                                            </div>
                                        ))}
                                        <button type="button" onClick={() => addOption(question.id)} className={styles.addOptionButton}>
                                            ＋ 選択肢を追加
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.actions}>
                <button type="button" onClick={() => router.back()} className={styles.cancelButton}>
                    キャンセル
                </button>
                <button type="submit" disabled={isSubmitting} className={styles.submitButton}>
                    {isSubmitting ? '保存中...' : isEditing ? '更新する' : '作成する'}
                </button>
            </div>
        </form>
    );
}
