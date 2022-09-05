import React, { useEffect, useRef, useState } from "react";

const NobodyKnowsButton = ({
  onClick,
}: {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}) => {
  const [disabled, setDisabled] = useState(true);
  const timeout = useRef<any | null>(null);

  useEffect(() => {
    timeout.current = setTimeout(() => {
      setDisabled(false);
    }, 7000);

    return () => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
    };
  }, []);

  if (disabled) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="text-red-600 disabled:opacity-30 text-6xl bg-white hover:bg-black p-4 rounded-md"
    >
      Nobody Knows!
    </button>
  );
};

export default NobodyKnowsButton;
