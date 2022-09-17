import { Routes, Route } from "react-router-dom"
import App from "./App"
import { useGlobalState } from "./GlobalStateProvider"
import Scoreboard from "./Scoreboard"
import PlayerJoin from "./PlayerJoin"
import Homepage from "./Homepage"
import Buzzer from "./Buzzer"
import HostControls from "./HostControls"
import QRImage from "./qr.png"

const Debug = () => {
  const { gameState } = useGlobalState()

  return <div className="text-white">{JSON.stringify(gameState)}</div>
}

const Qr = () => {
  return (
    <div className="flex justify-center items-center w-full h-full">
      <img className="h-full max-w-full" src={QRImage} />
    </div>
  )
}

const AppContainer = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/answer" element={<HostControls />} />
        <Route path="/game" element={<App round={1} />} />
        <Route path="/game2" element={<App round={2} />} />
        <Route path="/scoreboard" element={<Scoreboard />} />
        <Route path="/scoreboard/:name" element={<Scoreboard />} />
        <Route path="/scoreboard/:name" element={<Scoreboard />} />
        <Route path="/join" element={<PlayerJoin />} />
        <Route path="/buzzer" element={<Buzzer />} />
        <Route path="/debug" element={<Debug />} />
        <Route path="/qr" element={<Qr />} />
      </Routes>
    </>
  )
}

export default AppContainer
