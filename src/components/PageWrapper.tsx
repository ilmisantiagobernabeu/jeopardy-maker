import { HamburgerMenu } from "./HamburgerMenu";

export const PageWrapper = ({
  children,
  hideMenu = false,
}: {
  children: React.ReactNode;
  hideMenu?: boolean;
}) => {
  return (
    <>
      {!hideMenu && <HamburgerMenu />}

      <div className="p-8 w-full min-h-full flex flex-col justify-center items-center gap-y-12 bg-[#060ce9] text-white max-w-5xl mx-auto">
        <div className="container inline-flex flex-col items-center gap-8 max-h-full">
          <style>
            {`body {
          background-color: #060ce9;
        }`}
          </style>
          {children}
        </div>
      </div>
    </>
  );
};
