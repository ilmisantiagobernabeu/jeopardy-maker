import React from "react";
import { Link } from "react-router-dom";
import { QRCode } from "./QR";
import { useGlobalState } from "./GlobalStateProvider";
import PhoneIcon from "../icons/PhoneIcon";
import DesktopIcon from "../icons/DesktopIcon";
import { HamburgerMenu } from "./HamburgerMenu";
import { PageWrapper } from "./PageWrapper";

function generateRandomString(length = 5) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomString = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }
  return randomString;
}

const Homepage = () => {
  const { gameState, socket } = useGlobalState();
  return (
    <PageWrapper>
      <h1 className="text-7xl font-bold font-korinna gold-text">BUZZINGA</h1>
      <div className="flex gap-16 items-start max-w-4xl flex-col sm:flex-row">
        <div className="flex flex-col gap-4">
          <h2 className="flex items-center gap-2 font-bold text-2xl leading-none">
            <PhoneIcon width={15} className=" fill-white" /> Teams join here
          </h2>
          <Link to="/qr" target="_blank">
            <QRCode />
          </Link>
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="flex items-center gap-2 font-bold text-2xl leading-none">
            <DesktopIcon width={22} className="fill-white" />
            Start a game
          </h2>
          {Object.keys(gameState?.games || {}).length === 0 ? (
            <p>No existing games found</p>
          ) : (
            <>
              <ul className="flex flex-col gap-2 list-disc list-inside max-h-52 overflow-auto">
                {Object.values(gameState?.games || {}).map((game) => (
                  <li key={game.name} className="list-item">
                    <button
                      onClick={() => {
                        socket?.emit("Host changes the game", game.name);
                        localStorage.setItem("dt-gameName", game.name);
                        window.open(`/board?game=${game.name}`, "_blank");
                      }}
                      className="hover:text-gold focus:text-gold font-semibold transition-colors duration-200"
                    >
                      {game.name}
                    </button>
                  </li>
                ))}
              </ul>

              <p className="relative text-center before:border-b before:border-white before:w-full before:absolute before:h-1 before:left-0 before:top-2">
                <span className="bg-red relative z-10 bg-[#060ce9] px-2 italic">
                  OR
                </span>
              </p>
            </>
          )}

          <p>
            <Link
              to={`/create?name=default-game-${generateRandomString()}`}
              className="primary-btn"
            >
              Create new game
            </Link>
          </p>
        </div>
      </div>
      {Object.entries(gameState?.players || {})?.filter(
        ([_, player]) => player.name
      ).length > 0 && (
        <div className="flex flex-col gap-8 text-center">
          <h2 className="font-bold text-2xl leading-none">Teams ready to go</h2>
          <div className="flex justify-center gap-6">
            {Object.entries(gameState?.players || {})
              ?.filter(([_, player]) => player.name)
              .map(([_, player]) => (
                <div key={player.name} className="flex items-center gap-2">
                  <PhoneIcon width={15} />
                  {player.name}
                </div>
              ))}
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default Homepage;
