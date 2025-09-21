'use client';

import { useState } from 'react';
import styles from './feed.module.css';

export default function FeedPage() {
  const [activeMenu, setActiveMenu] = useState('follows');
  const [activeTab, setActiveTab] = useState('for-you');

  const menuTitles = {
    'follows': "My follow's news",
    'popular': 'Most Popular now',
    'comments': 'Most comments now',
    'feed': 'My feed'
  };

  const handleMenuClick = (menuType: string) => {
    setActiveMenu(menuType);
  };

  return (
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

          <button className={styles.postButton}>✍️ Share thoughts</button>
        </div>
      </nav>

      {/* 메인 컨텐츠 */}
      <main className={styles.mainContent}>
        <div className={styles.mainHeaderCard}>
          <div className={styles.mainHeader}>
            <h2>{menuTitles[activeMenu as keyof typeof menuTitles]}</h2>
          </div>

          <div className={styles.headerTabs}>
            <div
              className={`${styles.tab} ${activeTab === 'for-you' ? styles.active : ''}`}
              onClick={() => setActiveTab('for-you')}
            >
              For you
            </div>
            <div
              className={`${styles.tab} ${activeTab === 'following' ? styles.active : ''}`}
              onClick={() => setActiveTab('following')}
            >
              Following
            </div>
          </div>
        </div>

        {/* 포스트 작성 영역 */}
        <div className={styles.composeCard}>
          <div className={styles.composeContent}>
            <div className={styles.avatar}>U</div>
            <div className={styles.composeForm}>
              <textarea
                className={styles.composeTextarea}
                placeholder="What's on your mind today?"
              />
              <div className={styles.composeActions}>
                <div className={styles.actionIcons}>
                  <svg className={styles.actionIcon} viewBox="0 0 24 24">
                    <path d="M3 5.5C3 4.119 4.119 3 5.5 3h13C19.881 3 21 4.119 21 5.5v13c0 1.381-1.119 2.5-2.5 2.5h-13C4.119 21 3 19.881 3 18.5v-13zM5.5 5c-.276 0-.5.224-.5.5v9.086l3-3 3 3 5-5 3 3V5.5c0-.276-.224-.5-.5-.5h-13zM19 15.414l-3-3-5 5-3-3-3 3V18.5c0 .276.224.5.5.5h13c.276 0 .5-.224.5-.5v-3.086zM9.75 7C8.784 7 8 7.784 8 8.75s.784 1.75 1.75 1.75 1.75-.784 1.75-1.75S10.716 7 9.75 7z"/>
                  </svg>
                  <svg className={styles.actionIcon} viewBox="0 0 24 24">
                    <path d="M3 5.5C3 4.119 4.12 3 5.5 3h13C19.88 3 21 4.119 21 5.5v13c0 1.381-1.12 2.5-2.5 2.5h-13C4.12 21 3 19.881 3 18.5v-13zM5.5 5c-.28 0-.5.224-.5.5v13c0 .276.22.5.5.5h13c.28 0 .5-.224.5-.5v-13c0-.276-.22-.5-.5-.5h-13zM18 10.711V9.25h-3.74v5.5h1.44v-1.719h1.7V11.57h-1.7v-.859H18zM11.79 9.25h1.44v5.5h-1.44v-5.5zm-3.07 1.375c.34 0 .77.172 1.02.43l1.03-.86c-.51-.601-1.28-.945-2.05-.945C7.19 9.25 6 10.453 6 12s1.19 2.75 2.72 2.75c.77 0 1.54-.344 2.05-.945l-1.03-.86c-.25.258-.68.43-1.02.43-.65 0-1.22-.57-1.22-1.375s.57-1.375 1.22-1.375z"/>
                  </svg>
                  <svg className={styles.actionIcon} viewBox="0 0 24 24">
                    <path d="M8 9.5C8 8.119 8.672 7 9.5 7S11 8.119 11 9.5 10.328 12 9.5 12 8 10.881 8 9.5zm6.5 2.5c.828 0 1.5-1.119 1.5-2.5S15.328 7 14.5 7 13 8.119 13 9.5s.672 2.5 1.5 2.5zM12 17.5c2.33 0 4.3-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5zM12 3C6.477 3 2 7.477 2 13s4.477 10 10 10 10-4.477 10-10S17.523 3 12 3zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/>
                  </svg>
                </div>
                <button className={styles.postBtnSmall}>Share</button>
              </div>
            </div>
          </div>
        </div>

        {/* Feed Content based on active menu */}
        <div className={styles.feedContainer}>
          {activeMenu === 'follows' && (
            <div>
              <div className={styles.feedItem}>
                <div className={styles.feedContent}>
                  <div className={styles.avatar}>W</div>
                  <div className={styles.feedText}>
                    <div className={styles.feedHeader}>
                      <span className={styles.username}>Wall Street Mav</span>
                      <span className={styles.handle}>@WallStreetMav</span>
                      <span className={styles.timestamp}>• 19h</span>
                    </div>
                    <div className={styles.feedBody}>
                      The &quot;green&quot; parties of Europe are creating significant economic challenges with their regulatory approach, leading to energy costs that are 3x higher than those in the USA. This trend raises important questions about balancing environmental goals with economic competitiveness.
                      <br/><br/>
                      Meanwhile, China continues to expand their manufacturing capabilities and global influence...
                    </div>
                    <div className={styles.feedActions}>
                      <div className={styles.actionBtn}>
                        <svg viewBox="0 0 24 24"><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"/></svg>
                        248
                      </div>
                      <div className={styles.actionBtn}>
                        <svg viewBox="0 0 24 24"><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.791-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.791 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46L18.5 16.45V8c0-1.1-.896-2-2z"/></svg>
                        1.2K
                      </div>
                      <div className={styles.actionBtn}>
                        <svg viewBox="0 0 24 24"><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"/></svg>
                        5.6K
                      </div>
                      <div className={styles.actionBtn}>
                        <svg viewBox="0 0 24 24"><path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.29 3.3-1.42-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"/></svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.feedItem}>
                <div className={styles.feedContent}>
                  <div className={styles.avatar}>S</div>
                  <div className={styles.feedText}>
                    <div className={styles.feedHeader}>
                      <span className={styles.username}>Scarlett Johnson</span>
                      <span className={styles.handle}>@scarlett4kids</span>
                      <span className={styles.timestamp}>• 10h</span>
                    </div>
                    <div className={styles.feedBody}>
                      💭 &quot;Waste no more time arguing what a good man should be. Be one.&quot;
                      <br/><br/>
                      This profound wisdom from Marcus Aurelius reminds us that action speaks louder than words. Instead of endless debates about ideals, we should embody the change we want to see. Sometimes the most powerful philosophy is simply living with integrity and purpose.
                    </div>
                    <div className={styles.feedActions}>
                      <div className={styles.actionBtn}>
                        <svg viewBox="0 0 24 24"><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"/></svg>
                        89
                      </div>
                      <div className={styles.actionBtn}>
                        <svg viewBox="0 0 24 24"><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.791-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.791 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46L18.5 16.45V8c0-1.1-.896-2-2z"/></svg>
                        23
                      </div>
                      <div className={styles.actionBtn}>
                        <svg viewBox="0 0 24 24"><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"/></svg>
                        312
                      </div>
                      <div className={styles.actionBtn}>
                        <svg viewBox="0 0 24 24"><path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.29 3.3-1.42-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"/></svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeMenu === 'popular' && (
            <div>
              <div className={styles.feedItem}>
                <div className={styles.feedContent}>
                  <div className={styles.avatar}>🔥</div>
                  <div className={styles.feedText}>
                    <div className={styles.feedHeader}>
                      <span className={styles.username}>Viral News Today</span>
                      <span className={styles.handle}>@viralnews</span>
                      <span className={styles.timestamp}>• 2h</span>
                    </div>
                    <div className={styles.feedBody}>
                      🚨 BREAKING: Major cryptocurrency exchange announces revolutionary new trading features that could change the entire digital asset landscape. Early adopters are already seeing massive returns.
                      <br/><br/>
                      This development has caught the attention of major financial institutions worldwide.
                    </div>
                    <div className={styles.feedActions}>
                      <div className={styles.actionBtn}>
                        <svg viewBox="0 0 24 24"><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"/></svg>
                        2.1K
                      </div>
                      <div className={styles.actionBtn}>
                        <svg viewBox="0 0 24 24"><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.791-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.791 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46L18.5 16.45V8c0-1.1-.896-2-2z"/></svg>
                        8.7K
                      </div>
                      <div className={styles.actionBtn}>
                        <svg viewBox="0 0 24 24"><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"/></svg>
                        15.2K
                      </div>
                      <div className={styles.actionBtn}>
                        <svg viewBox="0 0 24 24"><path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.29 3.3-1.42-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"/></svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Add similar content for other menu types */}
        </div>
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

        <div className={styles.sidebarSection}>
          <div className={styles.sectionHeader}>🔥 What&apos;s trending</div>

          <div className={styles.trendingItem}>
            <div className={styles.trendingCategory}>Technology</div>
            <div className={styles.trendingTitle}>AI Development</div>
            <div className={styles.trendingPosts}>148.5K posts</div>
          </div>

          <div className={styles.trendingItem}>
            <div className={styles.trendingCategory}>Business</div>
            <div className={styles.trendingTitle}>Crypto Markets</div>
            <div className={styles.trendingPosts}>89.2K posts</div>
          </div>

          <div className={styles.trendingItem}>
            <div className={styles.trendingCategory}>Korea</div>
            <div className={styles.trendingTitle}>한국경제</div>
            <div className={styles.trendingPosts}>95.1K posts</div>
          </div>

          <div className={styles.trendingItem}>
            <div className={styles.trendingCategory}>Environment</div>
            <div className={styles.trendingTitle}>Climate Change</div>
            <div className={styles.trendingPosts}>67.8K posts</div>
          </div>

          <div className={styles.trendingItem}>
            <div className={styles.trendingCategory}>Sports</div>
            <div className={styles.trendingTitle}>World Cup 2026</div>
            <div className={styles.trendingPosts}>124.3K posts</div>
          </div>
        </div>

        <div className={styles.sidebarSection}>
          <div className={styles.sectionHeader}>👥 Who to follow</div>

          <div className={styles.trendingItem}>
            <div className={styles.trendingTitle}>@elonmusk</div>
            <div className={styles.trendingPosts}>CEO of Tesla & SpaceX</div>
          </div>

          <div className={styles.trendingItem}>
            <div className={styles.trendingTitle}>@sundarpichai</div>
            <div className={styles.trendingPosts}>CEO of Google</div>
          </div>

          <div className={styles.trendingItem}>
            <div className={styles.trendingTitle}>@satyanadella</div>
            <div className={styles.trendingPosts}>CEO of Microsoft</div>
          </div>
        </div>
      </aside>
    </div>
  );
}