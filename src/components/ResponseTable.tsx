'use client';

import { useState } from 'react';
import { Survey, Response } from '@/lib/types';
import styles from './ResponseTable.module.css';

interface ResponseTableProps {
    survey: Survey;
    responses: Response[];
}

export default function ResponseTable({ survey, responses }: ResponseTableProps) {
    const [filterText, setFilterText] = useState('');

    const filteredResponses = responses.filter((response) =>
        response.respondentName.toLowerCase().includes(filterText.toLowerCase())
    );

    const getAnswerValue = (response: Response, questionId: string) => {
        const answer = response.answers.find((a) => a.questionId === questionId);
        if (!answer) return '-';

        if (Array.isArray(answer.value)) {
            return answer.value.join(', ');
        }

        if (answer.value === 'yes') return <span className={`${styles.badge} ${styles.yes}`}>参加</span>;
        if (answer.value === 'no') return <span className={`${styles.badge} ${styles.no}`}>不参加</span>;
        if (answer.value === 'undecided') return <span className={`${styles.badge} ${styles.undecided}`}>未定</span>;

        return answer.value;
    };

    const handleDownloadCsv = () => {
        window.location.href = `/api/export?surveyId=${survey.id}`;
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.stats}>
                    <div className={styles.statItem}>
                        <span>総回答数</span>
                        <strong>{responses.length}</strong>
                    </div>
                    <div className={styles.statItem}>
                        <span>参加予定</span>
                        <strong>{responses.filter(r => r.answers.some(a => a.value === 'yes')).length}</strong>
                    </div>
                </div>

                <div className={styles.actions}>
                    <input
                        type="text"
                        placeholder="名前で検索..."
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        className={styles.searchInput}
                    />
                    <button onClick={handleDownloadCsv} className={styles.downloadButton}>
                        📥 CSVダウンロード
                    </button>
                </div>
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.th}>No.</th>
                            <th className={styles.th}>回答者氏名</th>
                            <th className={styles.th}>回答日時</th>
                            {survey.questions.map((q) => (
                                <th key={q.id} className={styles.th}>{q.text}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredResponses.length > 0 ? (
                            filteredResponses.map((response, index) => (
                                <tr key={response.id} className={styles.tr}>
                                    <td className={styles.td}>{index + 1}</td>
                                    <td className={`${styles.td} ${styles.name}`}>{response.respondentName}</td>
                                    <td className={styles.td}>
                                        {new Date(response.submittedAt).toLocaleString('ja-JP')}
                                    </td>
                                    {survey.questions.map((q) => (
                                        <td key={q.id} className={styles.td}>
                                            {getAnswerValue(response, q.id)}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={3 + survey.questions.length} className={styles.empty}>
                                    データがありません
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
