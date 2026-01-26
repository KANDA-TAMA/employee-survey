import Link from 'next/link';
import { getSurveys } from '@/lib/googleSheets';
import styles from './page.module.css';

export const revalidate = 0;

export default async function AdminDashboard() {
    const allSurveys = await getSurveys();
    const surveys = allSurveys.filter(s => s.isActive);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>管理者ダッシュボード</h1>
                <div className={styles.actions}>
                    <Link href="/admin/surveys/new" className={styles.createButton}>
                        ＋ 新規アンケート作成
                    </Link>
                    <Link href="/admin/settings" className={styles.settingsButton}>
                        ⚙️ 設定
                    </Link>
                </div>
            </div>

            <div className={styles.tableCard}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>ステータス</th>
                            <th>タイトル</th>
                            <th>作成日</th>
                            <th>更新日</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {surveys.length > 0 ? (
                            surveys.map((survey) => (
                                <tr key={survey.id}>
                                    <td>
                                        <span className={`${styles.status} ${survey.isActive ? styles.active : styles.inactive}`}>
                                            {survey.isActive ? '公開中' : '終了'}
                                        </span>
                                    </td>
                                    <td className={styles.surveyTitle}>
                                        <Link href={`/admin/surveys/${survey.id}`}>
                                            {survey.title}
                                        </Link>
                                    </td>
                                    <td>{new Date(survey.createdAt).toLocaleDateString('ja-JP')}</td>
                                    <td>{new Date(survey.updatedAt).toLocaleDateString('ja-JP')}</td>
                                    <td>
                                        <div className={styles.rowActions}>
                                            <Link href={`/admin/surveys/${survey.id}`} className={styles.actionLink}>
                                                結果・詳細
                                            </Link>
                                            <a href={`/survey/${survey.id}`} target="_blank" className={styles.actionLink}>
                                                プレビュー
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className={styles.empty}>
                                    アンケートがありません。新規作成してください。
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
