import React from "react";

type KeysDisplayProps = {
  keys: string[] | undefined;
};

export const KeysDisplay = ({ keys }: KeysDisplayProps) => {
  if (keys?.length === 0) {
    return null;
  }
  return (
    <div className="flex gap-1 text-xl items-center">
      {keys?.map((key, index, arr) => (
        <React.Fragment key={key}>
          <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
            {key === " " ? "Spacebar" : key}
          </kbd>{" "}
          {index !== arr.length - 1 && <span>+</span>}
        </React.Fragment>
      ))}
    </div>
  );
};
