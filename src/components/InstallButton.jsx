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
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log("설치 선택 결과:", outcome);
      deferredPrompt = null;
      setInstallReady(false);
    }
  };

  if (!installReady) return null;

  return (
    <Button
      type="text"
      onClick={handleInstallClick}
      className="install-btn"
    >
      <img
        src="/images/install.svg"
        alt="앱 설치하기"
        style={{ width: 140, height: "auto" }}
      />
    </Button>
  );
};

export default InstallButton;
