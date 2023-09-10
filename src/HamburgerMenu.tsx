import { useState } from "react";
import MenuIcon from "./icons/MenuIcon";
import { Link } from "react-router-dom";
import CloseIcon from "./icons/CloseIcon";
import cx from "classnames";
import WarningIcon from "./icons/WarningIcon";
import { useGlobalState } from "./GlobalStateProvider";

export const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { socket } = useGlobalState();
  return (
    <div className="text-white relative z-50">
      <div
        className={cx(
          "fixed top-0 left-0 h-full min-w-fit py-8 px-8 pr-12 bg-[#020555] transition-transform",
          {
            "-translate-x-full": !isOpen,
            "translate-x-0": isOpen,
          }
        )}
      >
        <div className="flex items-start gap-8">
          <button
            onClick={() => {
              setIsOpen(false);
            }}
          >
            <CloseIcon width={20} />
          </button>
          <ul className="flex flex-col gap-4">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/scoreboard">Scoreboard</Link>
            </li>
            <li>
              <Link to="/history">History</Link>
            </li>
            <li>
              <Link to="/answer" className="flex gap-2">
                {" "}
                <WarningIcon width={16} className="text-red-500" /> Show Answer
              </Link>
            </li>
            <li>
              <button
                onClick={() => {
                  const response = confirm(
                    "Are you sure you want to restart the game?"
                  );

                  if (response) {
                    socket?.emit("Host restarts the game");
                  }
                }}
              >
                <span className="flex gap-2">
                  <WarningIcon width={16} className="text-red-500" /> Restart
                  Game
                </span>
              </button>
            </li>
          </ul>
        </div>
      </div>
      {!isOpen && (
        <button
          className="fixed top-0 left-0 p-8 font-lg font-bold flex gap-2 items-center"
          onClick={() => {
            setIsOpen(true);
          }}
        >
          {" "}
          <MenuIcon width={20} /> MENU
        </button>
      )}
    </div>
  );
};
