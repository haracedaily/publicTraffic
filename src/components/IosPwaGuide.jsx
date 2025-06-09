import React, { useEffect, useState } from "react";
import { Modal, Button } from "antd";

const IosPwaGuide = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
  const isIos = /iphone|ipad|ipod/.test(
    window.navigator.userAgent.toLowerCase()
  );
  const isInStandaloneMode =
    "standalone" in window.navigator && window.navigator.standalone;

  const hasSeen = localStorage.getItem("seen_ios_pwa_guide");

  if (isIos && !isInStandaloneMode && !hasSeen) {
    setVisible(true);
    localStorage.setItem("seen_ios_pwa_guide", "true");
  }
}, []);

  return (
    <Modal
      title="홈 화면에 앱 추가하기"
      open={visible}
      onCancel={() => setVisible(false)}
      footer={[
        <Button key="close" onClick={() => setVisible(false)}>
          닫기
        </Button>,
      ]}
    >
      <p>이 앱을 설치하려면 Safari 브라우저에서:</p>
      <ol>
        <li>하단의 공유 버튼(<strong>⬆️</strong>)을 누르고</li>
        <li>"홈 화면에 추가"를 선택하세요.</li>
      </ol>
    </Modal>
  );
};

export default IosPwaGuide;
