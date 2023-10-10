export const requestScreenWakeLock = async () => {
  try {
    if ("wakeLock" in navigator) {
      const wakeLock = await (navigator as any).wakeLock.request("screen"); // Type casting due to potential NavigatorWakeLock API not being recognized in TypeScript

      wakeLock.addEventListener("release", () => {
        console.log("Screen wake lock released.");
      });
    } else {
      console.error("Screen Wake Lock API is not supported in this browser.");
    }
  } catch (error) {
    console.error("Error requesting screen wake lock:", error);
  }
};
