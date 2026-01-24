'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Header.module.css';

interface HeaderProps {
    organizationName?: string;
}

export default function Header({ organizationName }: HeaderProps) {
    const pathname = usePathname();
    const isAdmin = pathname.startsWith('/admin');

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <Link href="/" className={styles.logo}>
                    <span className={styles.logoIcon}>📋</span>
                    <span className={styles.logoText}>
                        {organizationName || 'アンケートシステム'}
                    </span>
                </Link>

                <nav className={styles.nav}>
                    <Link
                        href="/"
                        className={`${styles.navLink} ${pathname === '/' ? styles.active : ''}`}
                    >
                        アンケート一覧
                    </Link>
                    <Link
                        href="/admin"
                        className={`${styles.navLink} ${isAdmin ? styles.active : ''}`}
                    >
                        管理者
                    </Link>
                </nav>
            </div>
        </header>
    );
}
