import { useState } from "react";
import { useGameSettings } from "./GameSettingsProvider";
import { PageWrapper } from "./PageWrapper";
import { Tooltip } from "antd";
import InfoIcon from "../icons/InfoIcon";

export const Settings = () => {
  const { settingsState, setSettingsState } = useGameSettings();
  const [localState, setLocalState] = useState(settingsState);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSettingsState(localState);
    localStorage.setItem("bz-gameSettings", JSON.stringify(localState));
  };

  return (
    <PageWrapper>
      <div className="GameCard w-full max-w-lg">
        <h2 className="font-bold text-2xl leading-none text-center normal-case mb-4">
          Game Settings
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex justify-between items-baseline">
            <label
              htmlFor="timeToAnswer"
              className="text-base font-bold flex gap-2 items-center"
            >
              ANSWER COUNTDOWN
              <Tooltip
                placement="bottom"
                title="The time a team has to give a response after buzzing in."
              >
                <button>
                  <InfoIcon width={20} height={20} />
                </button>
              </Tooltip>
            </label>
            <div className="flex gap-2 items-baseline">
              <input
                id="timeToAnswer"
                type="number"
                className="appearance-none rounded-sm p-2 text-base text-black w-20"
                value={localState.countdownTimeToAnswer}
                min={0}
                onChange={(e) => {
                  setLocalState((prevState) => ({
                    ...prevState,
                    countdownTimeToAnswer: Number(e.target.value),
                  }));
                }}
              />
              <p>seconds</p>
            </div>
          </div>
          <div className="flex justify-between items-baseline">
            <label
              htmlFor="startDailyDoubleTimerAutomatically"
              className="text-base font-bold flex gap-2 items-center"
            >
              Daily Double Countdown
              <Tooltip
                placement="bottom"
                title="For daily double clues, the time a team has to give a response once shown the clue."
              >
                <button>
                  <InfoIcon width={20} height={20} />
                </button>
              </Tooltip>
            </label>
            <div className="flex gap-2 items-baseline">
              <input
                id="startDailyDoubleTimerAutomatically"
                type="number"
                className="appearance-none rounded-sm p-2 text-base text-black w-20"
                value={localState.dailyDoubleCountdownTime}
                min={0}
                onChange={(e) => {
                  setLocalState((prevState) => ({
                    ...prevState,
                    dailyDoubleCountdownTime: Number(e.target.value),
                  }));
                }}
              />
              <p>seconds</p>
            </div>
          </div>
          <div className="flex justify-between items-baseline">
            <label
              htmlFor="imageClueDelay"
              className="text-base font-bold flex gap-2 items-center"
            >
              IMAGE CLUE DELAY
              <Tooltip
                placement="bottom"
                title="For image clues, the delay before automatically activating all buzzers."
              >
                <button>
                  <InfoIcon width={20} height={20} />
                </button>
              </Tooltip>
            </label>
            <div className="flex gap-2 items-baseline">
              <input
                id="imageClueDelay"
                type="number"
                className="appearance-none rounded-sm p-2 text-base text-black w-20"
                value={localState.imageClueDelay}
                min={0}
                onChange={(e) => {
                  setLocalState((prevState) => ({
                    ...prevState,
                    imageClueDelay: Number(e.target.value),
                  }));
                }}
              />
              <p>seconds</p>
            </div>
          </div>
          <div className="flex justify-between items-baseline">
            <label
              htmlFor="audioClueDelay"
              className="text-base font-bold flex gap-2 items-center"
            >
              AUDIO CLUE DELAY
              <Tooltip
                placement="bottom"
                title="For audio clues, the delay before automatically activating all buzzers."
              >
                <button>
                  <InfoIcon width={20} height={20} />
                </button>
              </Tooltip>
            </label>
            <div className="flex gap-2 items-baseline">
              <input
                id="audioClueDelay"
                type="number"
                className="appearance-none rounded-sm p-2 text-base text-black w-20"
                value={localState.audioClueDelay}
                min={0}
                onChange={(e) => {
                  setLocalState((prevState) => ({
                    ...prevState,
                    audioClueDelay: Number(e.target.value),
                  }));
                }}
              />
              <p>seconds</p>
            </div>
          </div>
          <button
            type="submit"
            className="primary-btn"
            disabled={
              JSON.stringify(settingsState) === JSON.stringify(localState) ||
              Number.isNaN(
                Number(localState.countdownTimeToAnswer || undefined)
              )
            }
          >
            Save
          </button>
        </form>
      </div>
    </PageWrapper>
  );
};
