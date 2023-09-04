import QRCodeLib from "react-qr-code";

export const QRCode = () => (
  <div className="w-full h-full flex justify-center items-center p-12">
    <QRCodeLib
      value="http://10.0.0.18:3000/join"
      className="w-full h-full max-w-fit"
      preserveAspectRatio="xMidYMid slice"
    />
  </div>
);
