'use client';
import { useState } from 'react';
import style from "./page.module.css";

export default function Page() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPopup, setShowPopup] = useState(false);

    const handleLogin = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        if (!email || !password) {
            alert('이메일과 비밀번호를 모두 입력해주세요.');
            return;
        }

        // 여기에 실제 로그인 로직을 추가하세요
        console.log('로그인 시도:', { email, password });
        alert('로그인 기능이 구현되지 않았습니다.');
    };

    const handleSignup = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        // 여기에 회원가입 페이지로 이동하는 로직을 추가하세요
        console.log('회원가입 페이지로 이동');
        alert('회원가입 페이지로 이동합니다.');
    };

    const handleGoogleLogin = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setShowPopup(true);
    };

    const closePopup = () => {
        setShowPopup(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleLogin(e as any);
        }
    };

    // 팝업 배경 클릭시 닫기
    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if ((e.target as HTMLElement).classList.contains(style.popup_overlay)) {
            closePopup();
        }
    };

    return (
        <div className={style.pageWrapper}>
            <div className={style.container}>
                <div className={style.left_section}>
                    <div className={style.logo}>D</div>
                </div>

                <div className={style.right_section}>
                    <div className={style.content}>
                        <h1 className={style.main_title}>당신의 소중한 순간을 기록하세요</h1>

                        <div className={style.subtitle_english}>
                            Archive and share your memorable moments
                        </div>

                        <div className={style.form_container}>
                            <div className={style.input_group}>
                                <input
                                    type="email"
                                    className={style.input_field}
                                    placeholder="이메일"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                />
                            </div>
                            <div className={style.input_group}>
                                <input
                                    type="password"
                                    className={style.input_field}
                                    placeholder="비밀번호"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                />
                            </div>
                            <button className={style.login_button} onClick={handleLogin}>
                                로그인
                            </button>
                        </div>

                        <div className={style.divider}>또는</div>

                        <div className={style.signup_text}>아직 DailyFeed 계정이 없나요?</div>
                        <button className={style.google_button} onClick={handleGoogleLogin}>
                            <svg className={style.google_icon} viewBox="0 0 24 24">
                                <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Google 계정으로 가입하기
                        </button>
                        <button className={style.signup_button} onClick={handleSignup}>
                            계정 만들기
                        </button>

                        <div className={style.terms}>
                            가입하시면 DailyFeed의 <a href="#">이용약관</a>과 <a href="#">개인정보처리방침</a>에 동의하는 것으로 간주됩니다.
                        </div>
                    </div>
                </div>
            </div>

            {/* Popup */}
            <div
                className={`${style.popup_overlay} ${showPopup ? style.show : ''}`}
                onClick={handleOverlayClick}
            >
                <div className={style.popup}>
                    <h3>서비스 준비 중</h3>
                    <p>Google 계정으로 가입하기는 추후 지원 예정입니다.<br/>현재는 이메일 회원가입만 가능합니다.</p>
                    <button className={style.popup_button} onClick={closePopup}>
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
}