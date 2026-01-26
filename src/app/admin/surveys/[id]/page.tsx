import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSurveyById, getResponses } from '@/lib/googleSheets';
import ResponseTable from '@/components/ResponseTable';
import SurveyEditor from '@/components/SurveyEditor';
import SurveyCharts from '@/components/SurveyCharts';
import styles from './page.module.css';

interface PageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ mode?: string }>;
}

export const revalidate = 0;

export default async function SurveyDetailPage({ params, searchParams }: PageProps) {
    const { id } = await params;
    const { mode } = await searchParams;

    const survey = await getSurveyById(id);

    if (!survey) {
        notFound();
    }

    // 編集モードの場合
    if (mode === 'edit') {
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>アンケート編集: {survey.title}</h1>
                    <Link href={`/admin/surveys/${id}`} className={styles.backLink}>
                        ← 詳細に戻る
                    </Link>
                </div>
                <SurveyEditor initialData={survey} surveyId={id} isEditing />
            </div>
        );
    }

    // 通常モード（結果表示）
    const responses = await getResponses(id);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>{survey.title}</h1>
                    <div className={styles.meta}>
                        <span className={`${styles.status} ${survey.isActive ? styles.active : styles.inactive}`}>
                            {survey.isActive ? '公開中' : '終了'}
                        </span>
                        <span className={styles.date}>作成日: {new Date(survey.createdAt).toLocaleDateString('ja-JP')}</span>
                    </div>
                </div>

                <div className={styles.actions}>
                    <Link href={`/admin/surveys/${id}?mode=edit`} className={styles.editButton}>
                        ✏️ 編集する
                    </Link>
                    <a href={`/survey/${survey.id}`} target="_blank" className={styles.previewButton}>
                        🔗 プレビュー
                    </a>
                </div>
            </div>

            <SurveyCharts survey={survey} responses={responses} />

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>回答結果一覧</h2>
                <ResponseTable survey={survey} responses={responses} />
            </div>
        </div>
    );
}
