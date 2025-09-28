'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import style from "./page.module.css";

export default function Page() {
    const router = useRouter();
    const { login, isAuthenticated, isLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [showSignupModal, setShowSignupModal] = useState(false);
    const [signupLoading, setSignupLoading] = useState(false);
    const [signupError, setSignupError] = useState('');

    // Redirect if already authenticated
    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.push('/');
        }
    }, [isAuthenticated, isLoading, router]);

    // Signup form states
    const [signupData, setSignupData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        memberName: '',
        handle: '',
        displayName: '',
        bio: '',
        location: '',
        websiteUrl: '',
        birthDate: '',
        gender: '',
        timezone: 'Asia/Seoul',
        languageCode: 'ko',
        countryCode: 'KR',
        privacyLevel: 'PUBLIC',
        isActive: true
    });

    const handleLogin = async (e: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLInputElement>) => {
        e.preventDefault();

        if (!email || !password) {
            setLoginError('이메일과 비밀번호를 모두 입력해주세요.');
            return;
        }

        setLoginLoading(true);
        setLoginError('');

        try {
            await login({ email, password });
            // Redirect will be handled by useEffect above
        } catch (error) {
            console.error('Login error:', error);
            setLoginError(error instanceof Error ? error.message : '로그인에 실패했습니다.');
        } finally {
            setLoginLoading(false);
        }
    };

    const handleSignup = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setShowSignupModal(true);
        setSignupError('');
    };

    const handleSignupSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Validation
        if (signupData.password !== signupData.confirmPassword) {
            setSignupError('비밀번호가 일치하지 않습니다.');
            return;
        }

        if (signupData.password.length < 8) {
            setSignupError('비밀번호는 최소 8자 이상이어야 합니다.');
            return;
        }

        setSignupLoading(true);
        setSignupError('');

        try {
            const response = await fetch('http://localhost:8084/api/authentication/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: signupData.email,
                    password: signupData.password,
                    memberName: signupData.memberName,
                    handle: signupData.handle,
                    displayName: signupData.displayName,
                    bio: signupData.bio,
                    location: signupData.location,
                    websiteUrl: signupData.websiteUrl,
                    birthDate: signupData.birthDate,
                    gender: signupData.gender || 'OTHER',
                    timezone: signupData.timezone,
                    languageCode: signupData.languageCode,
                    countryCode: signupData.countryCode,
                    privacyLevel: signupData.privacyLevel,
                    isActive: signupData.isActive,
                    avatarUrl: null,
                    coverUrl: null
                })
            });

            if (response.ok) {
                alert('회원가입이 완료되었습니다. 로그인해주세요.');
                setShowSignupModal(false);
                // Reset form
                setSignupData({
                    email: '',
                    password: '',
                    confirmPassword: '',
                    memberName: '',
                    handle: '',
                    displayName: '',
                    bio: '',
                    location: '',
                    websiteUrl: '',
                    birthDate: '',
                    gender: '',
                    timezone: 'Asia/Seoul',
                    languageCode: 'ko',
                    countryCode: 'KR',
                    privacyLevel: 'PUBLIC',
                    isActive: true
                });
            } else {
                const errorData = await response.json();
                setSignupError(errorData.message || '회원가입에 실패했습니다.');
            }
        } catch (error) {
            console.error('Signup error:', error);
            setSignupError('네트워크 오류가 발생했습니다.');
        } finally {
            setSignupLoading(false);
        }
    };

    const handleSignupInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setSignupData(prev => ({
            ...prev,
            [name]: value
        }));
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
            handleLogin(e);
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
                            {loginError && (
                                <div className={style.error_message}>
                                    {loginError}
                                </div>
                            )}

                            <div className={style.input_group}>
                                <input
                                    type="email"
                                    className={style.input_field}
                                    placeholder="이메일"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    disabled={loginLoading}
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
                                    disabled={loginLoading}
                                />
                            </div>
                            <button
                                className={style.login_button}
                                onClick={handleLogin}
                                disabled={loginLoading}
                            >
                                {loginLoading ? '로그인 중...' : '로그인'}
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

            {/* Signup Modal */}
            {showSignupModal && (
                <div className={style.modal_overlay} onClick={(e) => {
                    if (e.target === e.currentTarget) setShowSignupModal(false);
                }}>
                    <div className={style.signup_modal}>
                        <button
                            className={style.close_button}
                            onClick={() => setShowSignupModal(false)}
                        >
                            ✕
                        </button>
                        <h2>Dailyfeed 회원가입</h2>

                        {signupError && (
                            <div className={style.error_message}>
                                {signupError}
                            </div>
                        )}

                        <form onSubmit={handleSignupSubmit}>
                            <div className={style.form_section}>
                                <h3>필수 정보</h3>

                                <div className={style.form_group}>
                                    <label>이메일 *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={signupData.email}
                                        onChange={handleSignupInputChange}
                                        required
                                        placeholder="example@email.com"
                                    />
                                </div>

                                <div className={style.form_group}>
                                    <label>비밀번호 *</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={signupData.password}
                                        onChange={handleSignupInputChange}
                                        required
                                        placeholder="최소 8자 이상, 대소문자, 숫자, 특수문자 포함"
                                    />
                                </div>

                                <div className={style.form_group}>
                                    <label>비밀번호 확인 *</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={signupData.confirmPassword}
                                        onChange={handleSignupInputChange}
                                        required
                                        placeholder="비밀번호를 다시 입력하세요"
                                    />
                                </div>

                                <div className={style.form_group}>
                                    <label>이름 *</label>
                                    <input
                                        type="text"
                                        name="memberName"
                                        value={signupData.memberName}
                                        onChange={handleSignupInputChange}
                                        required
                                        placeholder="실제 이름"
                                    />
                                </div>

                                <div className={style.form_group}>
                                    <label>핸들 (사용자명) *</label>
                                    <input
                                        type="text"
                                        name="handle"
                                        value={signupData.handle}
                                        onChange={handleSignupInputChange}
                                        required
                                        placeholder="@handle (영문, 숫자, 언더스코어만 가능)"
                                        pattern="[a-zA-Z0-9_]+"
                                    />
                                </div>

                                <div className={style.form_group}>
                                    <label>표시 이름 *</label>
                                    <input
                                        type="text"
                                        name="displayName"
                                        value={signupData.displayName}
                                        onChange={handleSignupInputChange}
                                        required
                                        placeholder="프로필에 표시될 이름"
                                    />
                                </div>
                            </div>

                            <div className={style.form_section}>
                                <h3>선택 정보</h3>

                                <div className={style.form_group}>
                                    <label>자기소개</label>
                                    <textarea
                                        name="bio"
                                        value={signupData.bio}
                                        onChange={handleSignupInputChange}
                                        placeholder="간단한 자기소개를 작성하세요"
                                        rows={3}
                                    />
                                </div>

                                <div className={style.form_group}>
                                    <label>위치</label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={signupData.location}
                                        onChange={handleSignupInputChange}
                                        placeholder="Seoul, Korea"
                                    />
                                </div>

                                <div className={style.form_group}>
                                    <label>웹사이트</label>
                                    <input
                                        type="url"
                                        name="websiteUrl"
                                        value={signupData.websiteUrl}
                                        onChange={handleSignupInputChange}
                                        placeholder="https://example.com"
                                    />
                                </div>

                                <div className={style.form_group}>
                                    <label>생년월일</label>
                                    <input
                                        type="date"
                                        name="birthDate"
                                        value={signupData.birthDate}
                                        onChange={handleSignupInputChange}
                                    />
                                </div>

                                <div className={style.form_group}>
                                    <label>성별</label>
                                    <select
                                        name="gender"
                                        value={signupData.gender}
                                        onChange={handleSignupInputChange}
                                    >
                                        <option value="">선택하세요</option>
                                        <option value="MALE">남성</option>
                                        <option value="FEMALE">여성</option>
                                        <option value="OTHER">기타</option>
                                    </select>
                                </div>
                            </div>

                            <div className={style.form_actions}>
                                <button
                                    type="button"
                                    className={style.cancel_button}
                                    onClick={() => setShowSignupModal(false)}
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    className={style.submit_button}
                                    disabled={signupLoading}
                                >
                                    {signupLoading ? '가입 중...' : '가입하기'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}