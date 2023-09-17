import QRCodeLib from "react-qr-code";
import cx from "classnames";

export const QRCode = ({ className = "" }: { className?: string }) => (
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
      value={`http://${import.meta.env.VITE_STATIC_IP}:3000/join`}
      className="w-full h-full max-w-fit"
      preserveAspectRatio="xMidYMid slice"
    />
  </div>
);
