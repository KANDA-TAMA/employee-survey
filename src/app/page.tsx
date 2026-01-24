import Link from 'next/link';
import { getSurveys } from '@/lib/googleSheets';
import styles from './page.module.css';

export const revalidate = 0; // 常に最新のデータを取得

export default async function Home() {
  // アクティブなアンケートのみ取得
  const allSurveys = await getSurveys();
  const activeSurveys = allSurveys.filter(s => s.isActive);

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <h1 className={styles.title}>現在実施中のアンケート</h1>
        <p className={styles.subtitle}>
          以下のリストから回答するアンケートを選択してください。
        </p>
      </section>

      <div className={styles.grid}>
        {activeSurveys.length > 0 ? (
          activeSurveys.map((survey) => (
            <Link href={`/survey/${survey.id}`} key={survey.id} className={styles.card}>
              <div className={styles.cardContent}>
                <h2 className={styles.cardTitle}>{survey.title}</h2>
                <p className={styles.cardDescription}>
                  {survey.description || '説明はありません'}
                </p>
                <div className={styles.cardMeta}>
                  <span className={styles.questionCount}>
                    質問数: {survey.questions.length}問
                  </span>
                  <span className={styles.date}>
                    開始日: {new Date(survey.createdAt).toLocaleDateString('ja-JP')}
                  </span>
                </div>
              </div>
              <div className={styles.cardAction}>
                回答する →
              </div>
            </Link>
          ))
        ) : (
          <div className={styles.empty}>
            <p>現在公開されているアンケートはありません。</p>
          </div>
        )}
      </div>
    </div>
  );
}
