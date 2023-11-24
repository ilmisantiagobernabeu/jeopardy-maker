import QRCodeLib from "react-qr-code";
import cx from "classnames";
import { useGlobalState } from "./GlobalStateProvider";
import { useGetUpdatedGameState } from "../hooks/useGetUpdatedGameState";

const getUrl = (roomId = "") =>
  import.meta.env.PROD
    ? `https://buzzinga.io/join/${roomId}`
    : `http://${import.meta.env.VITE_STATIC_IP}:3000/join/${roomId}`;

export const QRCode = ({ className = "" }: { className?: string }) => {
  useGetUpdatedGameState();
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
        value={getUrl(localStorage.getItem("bz-roomId") || "")}
        className="w-full h-full max-w-fit"
        preserveAspectRatio="xMidYMid slice"
      />
    </div>
  );
};
