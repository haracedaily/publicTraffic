import { useEffect, useState } from "react";
import { Button } from "antd";
// import "./InstallButton.css"; // 커스텀 스타일 추가

let deferredPrompt = null;

const InstallButton = () => {
  const [installReady, setInstallReady] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      deferredPrompt = e;
      setInstallReady(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      //???
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log("설치 선택 결과:", outcome);
      deferredPrompt = null;
      setInstallReady(false);
    }
  };

  // if (!installReady) return null; 준비 안되어있으니 버튼 가지마라

  return (
      <>
    <Button
      type="text"
      onClick={handleInstallClick}
      className="install-btn"
    >
      <img
        src="/Install.svg"
        alt="앱 설치하기"
        style={{ width: "25px", height: "25px" }}
      />
    </Button>
      </>
  );
};

export default InstallButton;

//현재 위치 끌고 오는 것과 현재 위치 검색 
