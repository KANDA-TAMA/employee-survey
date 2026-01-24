'use client';

import { useRouter } from 'next/navigation';
import { Survey, Answer } from '@/lib/types';
import SurveyForm from '@/components/SurveyForm';
import styles from './page.module.css';

interface SurveyPageClientProps {
    survey: Survey;
}

export default function SurveyPageClient({ survey }: SurveyPageClientProps) {
    const router = useRouter();

    const handleSubmit = async (respondentName: string, answers: Answer[]) => {
        const res = await fetch(`/api/responses?surveyId=${survey.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                respondentName,
                answers,
            }),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || '送信に失敗しました');
        }

        // 成功時の処理はSurveyForm内で完結（成功画面表示）
        // 必要であればここでリダイレクトなども可能
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>{survey.title}</h1>
                {survey.description && (
                    <p className={styles.description}>{survey.description}</p>
                )}
            </header>

            <main className={styles.main}>
                <SurveyForm survey={survey} onSubmit={handleSubmit} />
            </main>
        </div>
    );
}
