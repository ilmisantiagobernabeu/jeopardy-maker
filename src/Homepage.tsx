import React from "react";
import { Link } from "react-router-dom";

const Homepage = () => {
  return (
    <div className="fixed inset-0 w-full h-full flex flex-col items-center justify-center gap-y-4">
      <Link
        to="/join"
        className="p-3 bg-[#060ce9] text-white font-[swiss911] text-3xl"
      >
        Add New Team
      </Link>
      <Link
        to="/game?isHost=true"
        className="p-3 bg-[#060ce9] text-[#d69f4c] font-[swiss911] text-3xl"
      >
        Host
      </Link>
      <Link
        to="/game"
        className="p-3 bg-[#060ce9] text-[#d69f4c] font-[swiss911] text-3xl"
      >
        Gameboard
      </Link>
    </div>
  );
};

export default Homepage;
