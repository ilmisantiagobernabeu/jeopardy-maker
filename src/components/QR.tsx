import QRCodeLib from "react-qr-code";
import cx from "classnames";
import { useGlobalState } from "./GlobalStateProvider";

const getUrl = (roomId = "") =>
  import.meta.env.PROD
    ? `https://buzzingagame.netlify.app/join/${roomId}`
    : `http://${import.meta.env.VITE_STATIC_IP}:3000/join/${roomId}`;

export const QRCode = ({ className = "" }: { className?: string }) => {
  const { gameState } = useGlobalState();
  return (
    <div
      className={cx("flex justify-center items-center", {
        [className]: className,
      })}
    >
      <style>
        {`body {
          background-color: #060ce9;
        }`}
      </style>
      <QRCodeLib
        value={getUrl(gameState?.guid)}
        className="w-full h-full max-w-fit"
        preserveAspectRatio="xMidYMid slice"
      />
    </div>
  );
};
