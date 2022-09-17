import React, { useEffect } from "react"
import { useParams } from "react-router-dom"
import { useGlobalState } from "./GlobalStateProvider"
import cx from "classnames"
import { GameState } from "../stateTypes"
import useNoSleep from "use-no-sleep"

function formatScore(score: number) {
  if (score < 0) {
    return `-$${Math.abs(score)}`
  }

  return `$${score}`
}

const Scoreboard = () => {
  const { gameState } = useGlobalState() || {}
  const { name } = useParams()

  useNoSleep(true)

  // if a user goes to /scoreboard/[team name], let's show just their score
  const singlePlayerStats =
    name &&
    gameState?.players &&
    Object.values(gameState.players).filter(
      ({ name: playerName }) => name === playerName
    )[0]

  return (
    <div
      className={cx(
        "flex w-full h-full fixed top-0 left-0 justify-center items-center flex-col bg-[#060ce9]"
      )}
    >
      <div className="GameCard">
        <div
          className="GameCard-front text-center flex gap-20 flex-wrap"
          key={name}
        >
          {!singlePlayerStats &&
            gameState?.players &&
            Object.values(gameState.players)
              .filter(({ name }) => name)
              .map(({ score, name }, index) => (
                <div key={name + index}>
                  <p className="text-7xl text-white my-4 border-b-4 line-clamp-2">
                    {name}
                  </p>
                  <p
                    className={cx("text-9xl text-white my-4", {
                      "text-red-500": score < 0,
                    })}
                  >
                    {formatScore(score)}
                  </p>
                </div>
              ))}
        </div>
      </div>
      {singlePlayerStats && (
        <div className="GameCard">
          <div className="GameCard-front text-center flex-col" key={name}>
            <p className="text-7xl text-white my-4 border-b-4 line-clamp-2">
              {singlePlayerStats.name}
            </p>
            <p
              className={cx("text-9xl text-white my-4", {
                "text-red-500": singlePlayerStats.score < 0,
              })}
            >
              {formatScore(singlePlayerStats.score)}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Scoreboard
