import SurveyEditor from '@/components/SurveyEditor';
import styles from './page.module.css';

export default function NewSurveyPage() {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>新規アンケート作成</h1>
            <SurveyEditor />
        </div>
    );
}
