import * as React from "react";

const InfoIcon = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlSpace="preserve"
    style={{
      enableBackground: "new 0 0 32 32",
    }}
    viewBox="0 0 32 32"
    fill="currentColor"
    {...props}
  >
    <path d="M16 0C7.2 0 0 7.2 0 16s7.2 16 16 16 16-7.2 16-16S24.8 0 16 0zm0 29C8.8 29 3 23.2 3 16S8.8 3 16 3s13 5.8 13 13-5.8 13-13 13z" />
    <path d="M14 14h4v10h-4z" />
    <circle cx={16} cy={10} r={2} />
  </svg>
);
export default InfoIcon;
