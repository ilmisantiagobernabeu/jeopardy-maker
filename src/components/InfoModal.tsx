import { CheckIcon, X } from "lucide-react";
import { useGlobalState } from "./GlobalStateProvider";
import { PageWrapper } from "./PageWrapper";
import { useEffect } from "react";
import ReactDOM from "react-dom";

type InfoModalProps = {
  onRequestClose: () => void;
};

export const InfoModal = ({ onRequestClose }: InfoModalProps) => {
  const { gameState } = useGlobalState();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onRequestClose();
      }
    };

    window.addEventListener("keyup", handleEscape);

    return () => {
      window.removeEventListener("keyup", handleEscape);
    };
  });

  const activePlayerId =
    gameState?.activePlayer ||
    gameState?.lastActivePlayer ||
    Object.keys(gameState?.players || {})[0];

  return ReactDOM.createPortal(
    <div className="!fixed !inset-0 !w-full !h-full z-50 GameCard">
      <button onClick={onRequestClose} className="fixed top-0 left-0 p-8">
        <X />
      </button>
      <PageWrapper hideMenu>
        <div className="flex flex-col items-center gap-1">
          <h2 className="font-bold text-2xl leading-none text-center normal-case mb-2">
            Game Info
          </h2>
          <div className="text-center flex gap-20 flex-wrap">
            <table className="text-left text-xl" cellPadding={10}>
              <thead className="border-b">
                <tr>
                  <th>Active</th>
                  <th>Team</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(gameState?.players || {})
                  .sort((a, b) => (a.score > b.score ? -1 : 1))
                  ?.map((player, index) => (
                    <tr
                      key={player.socketId}
                      className="even:bg-gray-900 even:!bg-opacity-30 "
                    >
                      <td align="center" valign="top">
                        {player.socketId === activePlayerId && <CheckIcon />}
                      </td>
                      <td
                        valign="top"
                        className="font-bold text-2xl font-korinna uppercase gold-text bg-transparent break-all"
                      >
                        {player.name}
                      </td>
                      <td
                        valign="top"
                        align="right"
                        className="tabular-nums font-mono font-bold text-2xl"
                      >
                        {player.score}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </PageWrapper>
    </div>,
    document.getElementById("modals") as HTMLDivElement
  ) as React.ReactNode;
};
