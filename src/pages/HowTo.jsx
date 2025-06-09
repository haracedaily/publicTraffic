import React from 'react';
import { FaGlobe, FaAndroid, FaApple, FaArrowRight } from 'react-icons/fa';
import styles from '../css/HowTo.module.css';

const HowTo = () => {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div>
                    <h1 className={styles.header}>앱 설치 가이드</h1>
                    <p className={styles.subheader}>
                        웹, 안드로이드, iOS에서 앱을 쉽게 설치하는 방법을 확인하세요!
                    </p>
                </div>

                {/* 웹 */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <FaGlobe className={styles.webIcon} /> 웹에서 설치하기
                    </h2>
                    <p className={styles.sectionDescription}>
                        브라우저에서 간단히 앱을 설치할 수 있습니다. 아래 단계를 따라주세요.
                    </p>
                    <ol className={styles.steps}>
                        <li className={styles.step}>
                            <div className={styles.stepContent}>
                                <FaArrowRight className={styles.webIcon} />
                                <div>
                                    <strong>1. 앱 설치 버튼 클릭</strong>
                                    <p>브라우저 주소창 옆의 앱 설치 버튼을 누릅니다.</p>
                                    <img
                                        src="/howto4.png"
                                        alt="앱 설치 버튼 클릭"
                                        className={styles.stepImage}
                                    />
                                </div>
                            </div>
                        </li>
                        <li className={styles.step}>
                            <div className={styles.stepContent}>
                                <FaArrowRight className={styles.webIcon} />
                                <div>
                                    <strong>2. 설치 버튼 클릭</strong>
                                    <p>나타나는 팝업에서 '설치' 버튼을 눌러 설치를 완료합니다.</p>
                                    <img
                                        src="/howto5.png"
                                        alt="설치 버튼 클릭"
                                        className={styles.stepImage}
                                    />
                                </div>
                            </div>
                        </li>
                    </ol>
                </section>

                {/* 안드로이드 */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <FaAndroid className={styles.androidIcon} /> 안드로이드에서 설치하기
                    </h2>
                    <p className={styles.sectionDescription}>
                        안드로이드 기기에서 앱을 설치하는 방법은 다음과 같습니다.
                    </p>
                    <ol className={styles.stepsAndroid}>
                        <li className={styles.step}>
                            <div className={styles.stepContent}>
                                <FaArrowRight className={styles.androidIcon} />
                                <div>
                                    <strong>1. 위치 정보 접근 허용</strong>
                                    <p>앱이 위치 정보에 접근하도록 허용합니다.</p>
                                    <img
                                        src="/howto6.png"
                                        alt="위치 정보 접근 허용"
                                        className={styles.stepImage}
                                    />
                                </div>
                            </div>
                        </li>
                        <li className={styles.step}>
                            <div className={styles.stepContent}>
                                <FaArrowRight className={styles.androidIcon} />
                                <div>
                                    <strong>2. 앱 설치 버튼 클릭</strong>
                                    <p>브라우저 메뉴에서 '앱 설치' 버튼을 선택합니다.</p>
                                    <img
                                        src="/howto8.png"
                                        alt="앱 설치 버튼 클릭"
                                        className={styles.stepImage}
                                    />
                                </div>
                            </div>
                        </li>
                        <li className={styles.step}>
                            <div className={styles.stepContent}>
                                <FaArrowRight className={styles.androidIcon} />
                                <div>
                                    <strong>3. 추가 버튼 클릭</strong>
                                    <p>설치 확인 창에서 '추가' 버튼을 눌러 완료합니다.</p>
                                    <img
                                        src="/howto7.png"
                                        alt="추가 버튼 클릭"
                                        className={styles.stepImage}
                                    />
                                </div>
                            </div>
                        </li>
                    </ol>
                </section>

                {/* iOS */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <FaApple className={styles.iosIcon} /> iOS에서 설치하기
                    </h2>
                    <p className={styles.sectionDescription}>
                        iOS 기기에서 앱을 설치하려면 다음 단계를 따라주세요.
                    </p>
                    <ol className={styles.steps}>
                        <li className={styles.step}>
                            <div className={styles.stepContent}>
                                <FaArrowRight className={styles.iosIcon} />
                                <div>
                                    <strong>1. 위치 정보 사용 허용</strong>
                                    <p>앱의 위치 정보 사용을 허용합니다.</p>
                                    <img
                                        src="/public/howto9.png"
                                        alt="위치 정보 사용 허용"
                                        className={styles.stepImage}
                                    />
                                </div>
                            </div>
                        </li>
                        <li className={styles.step}>
                            <div className={styles.stepContent}>
                                <FaArrowRight className={styles.iosIcon} />
                                <div>
                                    <strong>2. 공유하기 클릭</strong>
                                    <p>Safari 브라우저 하단의 '공유' 버튼을 누릅니다.</p>
                                    <img
                                        src="/public/howto1.png"
                                        alt="공유하기 클릭"
                                        className={styles.stepImage}
                                    />
                                </div>
                            </div>
                        </li>
                        <li className={styles.step}>
                            <div className={styles.stepContent}>
                                <FaArrowRight className={styles.iosIcon} />
                                <div>
                                    <strong>3. 홈 화면에 추가</strong>
                                    <p>공유 메뉴에서 '홈 화면에 추가'를 선택합니다.</p>
                                    <img
                                        src="/public/howto2.png"
                                        alt="홈 화면에 추가"
                                        className={styles.stepImage}
                                    />
                                </div>
                            </div>
                        </li>
                        <li className={styles.step}>
                            <div className={styles.stepContent}>
                                <FaArrowRight className={styles.iosIcon} />
                                <div>
                                    <strong>4. 추가 버튼 클릭</strong>
                                    <p>우측 상단의 '추가' 버튼을 눌러 설치합니다.</p>
                                    <img
                                        src="/public/howto3.png"
                                        alt="추가 버튼 클릭"
                                        className={styles.stepImage}
                                    />
                                </div>
                            </div>
                        </li>
                    </ol>
                </section>
            </div>
        </div>
    );
};

export default HowTo;