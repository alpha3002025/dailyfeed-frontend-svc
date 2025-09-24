'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import WhoToFollow from '@/components/WhoToFollow';
import Following from '@/components/Following';
import styles from './layout.module.css';

export default function PostDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, logout, isLoggingOut } = useAuth();
  const [activeMenu, setActiveMenu] = useState('feed');

  const handleMenuClick = (menuType: string) => {
    setActiveMenu(menuType);
    router.push(`/feed?menu=${menuType}`);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        {/* 왼쪽 사이드바 */}
        <nav className={styles.sidebar}>
          <div className={styles.sidebarCard}>
            <div className={styles.logo}>
              <h1>Dailyfeed</h1>
            </div>

            <ul className={styles.navMenu}>
              <li className={styles.navItem}>
                <a
                  href="#"
                  className={`${styles.navLink} ${activeMenu === 'follows' ? styles.active : ''}`}
                  onClick={(e) => { e.preventDefault(); handleMenuClick('follows'); }}
                >
                  <svg className={styles.navIcon} viewBox="0 0 24 24">
                    <path d="M12 9c-2.209 0-4 1.791-4 4s1.791 4 4 4 4-1.791 4-4-1.791-4-4-4zm0 6c-1.105 0-2-.895-2-2s.895-2 2-2 2 .895 2 2-.895 2-2 2z"/>
                    <path d="M12 5c-7.633 0-9.927 6.617-9.948 6.684L1.946 12l.105.316C2.073 12.383 4.367 19 12 19s9.927-6.617 9.948-6.684L22.054 12l-.105-.316C21.927 11.617 19.633 5 12 5zm0 12c-5.351 0-7.424-3.846-7.926-5C4.578 10.842 6.652 7 12 7c5.351 0 7.424 3.846 7.926 5-.504 1.158-2.578 5-7.926 5z"/>
                  </svg>
                  <span className={styles.navText}>My follow&apos;s news</span>
                </a>
              </li>
              <li className={styles.navItem}>
                <a
                  href="#"
                  className={`${styles.navLink} ${activeMenu === 'popular' ? styles.active : ''}`}
                  onClick={(e) => { e.preventDefault(); handleMenuClick('popular'); }}
                >
                  <svg className={styles.navIcon} viewBox="0 0 24 24">
                    <path d="M19.633 7.997c.013.175.013.349.013.523 0 5.325-4.053 11.461-11.46 11.461-2.282 0-4.402-.661-6.186-1.809.324.037.636.05.973.05a8.07 8.07 0 0 0 5.001-1.721 4.036 4.036 0 0 1-3.767-2.793c.249.037.499.062.761.062.361 0 .724-.05 1.061-.137a4.027 4.027 0 0 1-3.23-3.953v-.05c.537.299 1.16.486 1.82.511a4.022 4.022 0 0 1-1.796-3.354c0-.748.199-1.434.548-2.032a11.457 11.457 0 0 0 8.306 4.215c-.062-.3-.1-.611-.1-.923a4.026 4.026 0 0 1 4.028-4.028c1.16 0 2.207.486 2.943 1.272a7.957 7.957 0 0 0 2.556-.973 4.02 4.02 0 0 1-1.771 2.22 8.073 8.073 0 0 0 2.319-.624 8.645 8.645 0 0 1-2.019 2.083z"/>
                  </svg>
                  <span className={styles.navText}>Most Popular now</span>
                </a>
              </li>
              <li className={styles.navItem}>
                <a
                  href="#"
                  className={`${styles.navLink} ${activeMenu === 'comments' ? styles.active : ''}`}
                  onClick={(e) => { e.preventDefault(); handleMenuClick('comments'); }}
                >
                  <svg className={styles.navIcon} viewBox="0 0 24 24">
                    <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"/>
                  </svg>
                  <span className={styles.navText}>Most comments now</span>
                </a>
              </li>
              <li className={styles.navItem}>
                <a
                  href="#"
                  className={`${styles.navLink} ${activeMenu === 'feed' ? styles.active : ''}`}
                  onClick={(e) => { e.preventDefault(); handleMenuClick('feed'); }}
                >
                  <svg className={styles.navIcon} viewBox="0 0 24 24">
                    <path d="M7.471 21H.472l.029-1.027c.184-6.618 3.736-8.977 7-8.977.963 0 1.95.212 2.87.672-.444.478-.851 1.03-1.212 1.656-.507-.204-1.054-.329-1.658-.329-2.767 0-4.57 2.223-4.938 6.004H7.47V21zm16.057-1.027c-.184-6.618-3.736-8.977-7-8.977s-6.816 2.358-7 8.977L9.498 21h14.029v-1.027zm-7-6.972c-2.767 0-4.57 2.223-4.938 6.004h9.875c-.367-3.781-2.17-6.004-4.938-6.004zM7.471 6.5a4 4 0 1 1 8 0 4 4 0 0 1-8 0zm4-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM16.5 10.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0zm3.5-1.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>
                  </svg>
                  <span className={styles.navText}>My feed</span>
                </a>
              </li>
            </ul>

            <button
              className={styles.postButton}
              onClick={() => router.push('/feed')}
            >
              ✍️ Share thoughts
            </button>

            {/* User info and logout */}
            <div className={styles.userSection}>
              <div className={styles.userInfo}>
                <div className={styles.userAvatar}>
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Profile" />
                  ) : (
                    <span>{user?.displayName?.charAt(0) || 'U'}</span>
                  )}
                </div>
                <div className={styles.userDetails}>
                  <div className={styles.userName}>{user?.displayName || user?.memberName}</div>
                  <div className={styles.userHandle}>@{user?.handle}</div>
                </div>
              </div>
              <button
                className={styles.logoutButton}
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
              </button>
            </div>
          </div>
        </nav>

        {/* 메인 컨텐츠 */}
        <main className={styles.mainContent}>
          {children}
        </main>

        {/* 오른쪽 사이드바 */}
        <aside className={styles.rightSidebar}>
          <div className={styles.sidebarSection}>
            <div className={styles.searchBox}>
              <div className={styles.searchInputContainer}>
                <svg className={styles.searchIcon} viewBox="0 0 24 24">
                  <path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.824 5.262l4.781 4.781-1.414 1.414-4.781-4.781c-1.447 1.142-3.276 1.824-5.262 1.824-4.694 0-8.5-3.806-8.5-8.5z"/>
                </svg>
                <input type="text" className={styles.searchInput} placeholder="Search Dailyfeed" />
              </div>
            </div>
          </div>

          <Following className={styles.sidebarSection} />

          <WhoToFollow className={styles.sidebarSection} />
        </aside>
      </div>
    </div>
  );
}