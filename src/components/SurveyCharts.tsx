'use client';

import { Survey, Response } from '@/lib/types';
import styles from './SurveyCharts.module.css';

interface SurveyChartsProps {
    survey: Survey;
    responses: Response[];
}

interface ChartData {
    label: string;
    count: number;
    color: string;
}

export default function SurveyCharts({ survey, responses }: SurveyChartsProps) {
    // Generate chart data for each question
    const getChartDataForQuestion = (questionId: string, questionType: string, options?: string[]): ChartData[] => {
        const answerCounts: Record<string, number> = {};

        // Initialize counts
        if (questionType === 'participation') {
            answerCounts['yes'] = 0;
            answerCounts['no'] = 0;
            answerCounts['undecided'] = 0;
        } else if (questionType === 'multiple-choice' && options) {
            options.forEach(opt => {
                answerCounts[opt] = 0;
            });
        }

        // Count answers
        responses.forEach(response => {
            const answer = response.answers.find(a => a.questionId === questionId);
            if (answer) {
                if (Array.isArray(answer.value)) {
                    answer.value.forEach(v => {
                        answerCounts[v] = (answerCounts[v] || 0) + 1;
                    });
                } else {
                    answerCounts[answer.value] = (answerCounts[answer.value] || 0) + 1;
                }
            }
        });

        // Convert to chart data
        if (questionType === 'participation') {
            return [
                { label: '参加', count: answerCounts['yes'] || 0, color: '#22c55e' },
                { label: '不参加', count: answerCounts['no'] || 0, color: '#ef4444' },
                { label: '未定', count: answerCounts['undecided'] || 0, color: '#f59e0b' },
            ];
        }

        // For multiple-choice, use a color palette
        const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4'];
        return Object.entries(answerCounts).map(([label, count], index) => ({
            label,
            count,
            color: colors[index % colors.length],
        }));
    };

    const chartableQuestions = survey.questions.filter(
        q => q.type === 'participation' || q.type === 'multiple-choice'
    );

    if (chartableQuestions.length === 0) {
        return null;
    }

    const totalResponses = responses.length;

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>📊 集計結果</h2>
            <div className={styles.chartsGrid}>
                {chartableQuestions.map(question => {
                    const chartData = getChartDataForQuestion(question.id, question.type, question.options);
                    const maxCount = Math.max(...chartData.map(d => d.count), 1);
                    const respondentsToQuestion = responses.filter(r =>
                        r.answers.some(a => a.questionId === question.id && a.value !== undefined && a.value !== null && a.value !== '')
                    ).length;

                    return (
                        <div key={question.id} className={styles.chartCard}>
                            <h3 className={styles.questionText}>{question.text}</h3>
                            <div className={styles.barChart}>
                                {chartData.map((data, index) => (
                                    <div key={index} className={styles.barRow}>
                                        <div className={styles.barLabel}>{data.label}</div>
                                        <div className={styles.barContainer}>
                                            <div
                                                className={styles.bar}
                                                style={{
                                                    width: `${(data.count / maxCount) * 100}%`,
                                                    backgroundColor: data.color,
                                                }}
                                            />
                                        </div>
                                        <div className={styles.barValue}>
                                            {data.count}
                                            <span className={styles.percentage}>
                                                ({respondentsToQuestion > 0 ? Math.round((data.count / respondentsToQuestion) * 100) : 0}%)
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
