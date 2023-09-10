import React from "react";
import { Link } from "react-router-dom";
import { QRCode } from "./QR";
import { useGlobalState } from "./GlobalStateProvider";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

const Homepage = () => {
  const { gameState, socket } = useGlobalState();
  return (
    <div className="p-8 w-full h-full flex flex-col justify-center items-center gap-y-12 bg-[#060ce9] text-white">
      <style>
        {`body {
          background-color: #060ce9;
        }`}
      </style>
      <h1 className="text-7xl font-bold font-korinna gold-text">BUZZINGA</h1>
      <div className="flex gap-12 items-start max-w-4xl">
        <div className="flex flex-col gap-4">
          <h2 className="font-bold text-2xl">Teams join here</h2>
          <Link to="/qr" target="_blank">
            <QRCode />
          </Link>
        </div>
        <hr className="border-l h-full border-white" />
        <div className="flex flex-col gap-4">
          <h2 className="font-bold text-2xl">Host</h2>
          <p className="font-semibold text-xl gold-text">Select a game</p>
          {/* <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select> */}
          <ul className="flex flex-col gap-2 list-disc list-inside max-h-52 overflow-auto">
            {gameState?.games.map((game) => (
              <li className="list-item" key={game}>
                <Link
                  to={`/game?game=${game}`}
                  className="hover:text-gold focus:text-gold font-semibold transition-colors duration-200"
                >
                  {game}
                </Link>
              </li>
            ))}
          </ul>

          <p className="relative text-center before:border-b before:border-white before:w-full before:absolute before:h-1 before:left-0 before:top-2">
            <span className="bg-red relative z-10 bg-[#060ce9] px-2 italic">
              OR
            </span>
          </p>
          <p>
            <Link to="/create" className="primary-btn">
              Create new game
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
