import * as fs from "fs";
import * as os from "os";

// Get network interfaces
const networkInterfaces = os.networkInterfaces();

// Find the static IP address (if available)
for (const interfaceName in networkInterfaces) {
  const interfaces = networkInterfaces[interfaceName];

  if (interfaces) {
    for (const iface of interfaces) {
      if (iface.family === "IPv4" && !iface.internal) {
        const staticIPAddress = iface.address;
        // Write the IP address to .env file
        fs.writeFileSync(".env", `VITE_STATIC_IP=${staticIPAddress}`);
        console.log(
          `Static IP address for ${interfaceName}: ${staticIPAddress}`
        );
      }
    }
  }
}
