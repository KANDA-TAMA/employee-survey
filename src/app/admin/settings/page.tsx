'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';

interface Settings {
    name: string;
    employees: string[];
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<Settings>({ name: '', employees: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [employeeInput, setEmployeeInput] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings');
            if (res.ok) {
                const data = await res.json();
                setSettings(data.data);
                if (data.data.employees) {
                    setEmployeeInput(data.data.employees.join('\n'));
                }
            }
        } catch (error) {
            console.error('Failed to fetch settings', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage(null);

        const employees = employeeInput
            .split('\n')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        try {
            const res = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: settings.name,
                    employees,
                }),
            });

            if (res.ok) {
                setMessage({ type: 'success', text: '設定を保存しました' });
                setSettings(prev => ({ ...prev, employees }));
            } else {
                throw new Error('Failed to save');
            }
        } catch (error) {
            setMessage({ type: 'error', text: '保存に失敗しました' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleInitializeSheets = async () => {
        if (!confirm('スプレッドシートを初期化しますか？既存のシート構造が変更される可能性があります。')) return;

        try {
            const res = await fetch('/api/settings', { method: 'POST' });
            if (res.ok) {
                alert('シートの初期化が完了しました');
            } else {
                throw new Error('Failed');
            }
        } catch (error) {
            alert('初期化に失敗しました');
        }
    };

    if (isLoading) return <div className={styles.loading}>読み込み中...</div>;

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>システム設定</h1>

            <form onSubmit={handleSubmit} className={styles.card}>
                <div className={styles.field}>
                    <label className={styles.label}>組織名 / イベント名</label>
                    <input
                        type="text"
                        value={settings.name}
                        onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                        className={styles.input}
                        placeholder="例: 株式会社サンプル"
                        required
                    />
                    <p className={styles.help}>ヘッダーに表示される名前です。</p>
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>従業員リスト（事前登録）</label>
                    <textarea
                        value={employeeInput}
                        onChange={(e) => setEmployeeInput(e.target.value)}
                        className={styles.textarea}
                        placeholder="名前を改行区切りで入力してください"
                        rows={10}
                    />
                    <p className={styles.help}>※現在は使用していませんが、将来的に選択式にする場合に使用します。</p>
                </div>

                {message && (
                    <div className={`${styles.message} ${styles[message.type]}`}>
                        {message.text}
                    </div>
                )}

                <div className={styles.actions}>
                    <button type="submit" disabled={isSaving} className={styles.submitButton}>
                        {isSaving ? '保存中...' : '設定を保存'}
                    </button>
                </div>
            </form>

            <div className={`${styles.card} ${styles.dangerZone}`}>
                <h2 className={styles.dangerTitle}>管理者用操作</h2>
                <p className={styles.dangerText}>
                    Google Sheetsに必要なシート（surveys, responses, settings）が存在しない場合、自動的に作成します。
                </p>
                <button type="button" onClick={handleInitializeSheets} className={styles.dangerButton}>
                    シート構造を修復/初期化
                </button>
            </div>
        </div>
    );
}
