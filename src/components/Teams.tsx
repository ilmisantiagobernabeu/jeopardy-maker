import { useParams } from "react-router-dom";
import { useGlobalState } from "./GlobalStateProvider";
import { useState } from "react";
import { PageWrapper } from "./PageWrapper";
import { useGetUpdatedGameState } from "../hooks/useGetUpdatedGameState";
import { KeyDetectVeil } from "./KeyDetectVeil";
import { KeysDisplay } from "./KeysDisplay";

const Teams = () => {
  const { gameState, socket } = useGlobalState() || {};
  const { name } = useParams();
  const [playerName, setPlayerName] = useState("");
  const [keys, setKeys] = useState<string[]>([]);
  const [showKeyDetectVeil, setShowKeyDetectVeil] = useState(false);

  useGetUpdatedGameState();

  const playersWithButtons = Object.values(gameState?.players || {}).filter(
    (player) => Boolean(player.name && player?.keys?.length)
  );

  const addPlayer = () => {
    socket?.emit(
      "Host adds a team with a button",
      {
        playerName,
        keys,
      },
      gameState?.guid || ""
    );

    // reset state
    setPlayerName("");
    setKeys([]);
  };

  return (
    <PageWrapper>
      <div className="GameCard flex flex-col gap-4">
        <h2 className="font-bold text-2xl leading-none text-center normal-case mb-2">
          Add Teams with Physical Buttons
        </h2>
        <div className="flex flex-col gap-4 items-center">
          <div className="flex gap-4 items-center w-full">
            <input
              type="text"
              className="min-w-max rounded-sm p-3 text-black"
              placeholder="Team name"
              value={playerName}
              onChange={(e) => {
                setPlayerName(e.target.value);
              }}
            />
            <KeysDisplay keys={keys} />
            <button
              className="secondary-btn"
              onClick={() => {
                setShowKeyDetectVeil(true);
              }}
            >
              Detect Keys
            </button>
          </div>
          <button
            className="primary-btn"
            onClick={addPlayer}
            disabled={!playerName || keys.length === 0}
          >
            Add
          </button>
        </div>
        {showKeyDetectVeil && (
          <KeyDetectVeil
            setKeys={setKeys}
            onRequestClose={() => {
              setShowKeyDetectVeil(false);
            }}
            players={playersWithButtons}
          />
        )}
        {playersWithButtons.length > 0 && (
          <div className=" text-center flex flex-wrap" key={name}>
            <table className="text-left text-xl w-full" cellPadding={10}>
              <thead className="border-b">
                <tr>
                  <th>Name</th>
                  <th>Key Bindings</th>
                </tr>
              </thead>
              <tbody>
                {playersWithButtons.map((player) => (
                  <tr
                    key={player.name?.toString()}
                    className="even:bg-gray-900 even:!bg-opacity-30 "
                  >
                    <td>{player.name}</td>
                    <td>
                      <KeysDisplay keys={player?.keys} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default Teams;
