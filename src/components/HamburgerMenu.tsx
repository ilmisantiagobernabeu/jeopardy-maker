import { useEffect, useRef, useState } from "react";
import MenuIcon from "../icons/MenuIcon";
import { Link, NavLink, useNavigate } from "react-router-dom";
import CloseIcon from "../icons/CloseIcon";
import cx from "classnames";
import WarningIcon from "../icons/WarningIcon";
import { useGlobalState } from "./GlobalStateProvider";
import { LogoutButton } from "../features/login/LogoutButton";

type HamburgerMenuProps = {
  isVisible?: boolean;
  onPointerOver?: () => void;
};

export const HamburgerMenu = ({
  isVisible = true,
  onPointerOver,
}: HamburgerMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisibleLocal, setIsVisibleLocal] = useState(isVisible);
  const { gameState, session, socket } = useGlobalState();
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisibleLocal(isVisible);
    if (!isVisible) {
      setIsVisibleLocal(true);
      setTimeout(() => {
        setIsVisibleLocal(false);
      }, 3000);
    }
  }, [isVisible]);

  return (
    <div className="text-white relative z-50">
      <div
        className={cx(
          "fixed top-0 left-0 h-full min-w-fit py-8 pr-12 bg-[#020555] transition-transform z-10",
          {
            "-translate-x-full": !isOpen,
            "translate-x-0": isOpen,
          }
        )}
      >
        <div className="flex items-start gap-2">
          <button
            onClick={() => {
              setIsOpen(false);
            }}
            className="p-8 -mt-8"
          >
            <CloseIcon width={20} />
          </button>
          <ul className="flex flex-col gap-4">
            {session?.user.email ? (
              <li>
                <p className="flex gap-1" title={session.user.email}>
                  <span>Hi,</span>
                  <span className="font-semibold max-w-xs truncate">
                    {" "}
                    {session?.user.email}!
                  </span>
                </p>
                <LogoutButton />
                <div className="pt-4 border-b" />
              </li>
            ) : (
              <>
                <Link to="/login" className="primary-btn">
                  Login / Sign Up
                </Link>
                <div className="pt-2 border-b mb-2" />
              </>
            )}
            <li>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive
                    ? "text-gold hover:underline focus:underline"
                    : "hover:underline focus:underline"
                }
              >
                Home
              </NavLink>
            </li>
            {import.meta.env.VITE_SUPABASE_ADMIN_ID ===
              localStorage.getItem("bz-userId") && (
              <li>
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    isActive
                      ? "text-gold hover:underline focus:underline"
                      : "hover:underline focus:underline"
                  }
                >
                  Admin
                </NavLink>
              </li>
            )}
            <li>
              <NavLink
                to={`/board${gameState?.name ? `?game=${gameState.name}` : ""}`}
                className={({ isActive }) =>
                  isActive
                    ? "text-gold hover:underline focus:underline"
                    : "hover:underline focus:underline"
                }
              >
                Current Game
              </NavLink>
            </li>
            <li>
              <NavLink
                to={`/settings`}
                className={({ isActive }) =>
                  isActive
                    ? "text-gold hover:underline focus:underline"
                    : "hover:underline focus:underline"
                }
              >
                Game Settings
              </NavLink>
            </li>
            <li>
              <NavLink
                to={`/contact`}
                className={({ isActive }) =>
                  isActive
                    ? "text-gold hover:underline focus:underline"
                    : "hover:underline focus:underline"
                }
              >
                Contact
              </NavLink>
            </li>

            <li>
              <NavLink
                to={`/scoreboard`}
                className={({ isActive }) =>
                  isActive
                    ? "text-gold hover:underline focus:underline"
                    : "hover:underline focus:underline"
                }
              >
                Scores
              </NavLink>
            </li>
            <li>
              <NavLink
                to={`/history`}
                className={({ isActive }) =>
                  isActive
                    ? "text-gold hover:underline focus:underline"
                    : "hover:underline focus:underline"
                }
              >
                History
              </NavLink>
            </li>
            <li>
              <NavLink
                to={`/teams`}
                className={({ isActive }) =>
                  isActive
                    ? "text-gold hover:underline focus:underline"
                    : "hover:underline focus:underline"
                }
              >
                Buttons & Buzzers
              </NavLink>
            </li>
            <li>
              <button
                onClick={() => {
                  const response = confirm(
                    "Are you sure you want to reveal the answer to everyone?"
                  );

                  if (response) {
                    navigate(`/answer`);
                  }
                }}
              >
                <span className="flex gap-2">
                  <WarningIcon width={16} className="text-red-500" /> Show
                  Answer
                </span>
              </button>
            </li>
            {gameState?.name && (
              <li>
                <button
                  onClick={() => {
                    const response = confirm(
                      "Are you sure you want to restart the game? " +
                        gameState.name
                    );

                    if (response) {
                      socket?.emit(
                        "Host restarts the game",
                        gameState.name,
                        localStorage.getItem("bz-roomId") || "",
                        localStorage.getItem("bz-userId") || ""
                      );
                    }
                  }}
                >
                  <span className="flex gap-2">
                    <WarningIcon width={16} className="text-red-500" /> Restart
                    Game
                  </span>
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
      {!isOpen ? (
        <button
          className={cx(
            "fixed top-0 left-0 p-8 font-lg font-bold flex gap-2 items-center transition-transform bg-[#060ce9] bg-opacity-80",
            {
              "translate-x-0": isVisibleLocal,
              "-translate-x-full": !isVisibleLocal,
            }
          )}
          onClick={() => {
            setIsOpen(true);
          }}
          onPointerOver={onPointerOver}
        >
          {" "}
          <MenuIcon width={20} />
          <span className="hidden sm:block"> MENU</span>
        </button>
      ) : (
        <button
          className="fixed inset-0 w-full h-full bg-black bg-opacity-90"
          onClick={() => {
            setIsOpen(false);
          }}
        />
      )}
    </div>
  );
};
