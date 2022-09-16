const Console = require("console").Console;
import fs from "fs";
const ncpu = require("os").cpus().length;

const stream = fs.createWriteStream("./ignore/mylog");
export const console = new Console(stream, stream);

// const i = 0;
// (function log () {
// 	console.log(i++);
// 	setTimeout(log, 1000);
// } ())

let previousTime = new Date().getTime();
let previousUsage = process.cpuUsage();
let lastUsage;

export const cpuTrackerInterval = setInterval(() => {
  const currentUsage = process.cpuUsage(previousUsage);

  previousUsage = process.cpuUsage();

  // we can't do simply times / 10000 / ncpu because we can't trust
  // setInterval is executed exactly every 1.000.000 microseconds
  const currentTime = new Date().getTime();
  // times from process.cpuUsage are in microseconds while delta time in milliseconds
  // * 10 to have the value in percentage for only one cpu
  // * ncpu to have the percentage for all cpus af the host

  // this should match top's %CPU
  const timeDelta = (currentTime - previousTime) * 10;
  // this would take care of CPUs number of the host
  // const timeDelta = (currentTime - previousTime) * 10 * ncpu;
  const { user, system } = currentUsage;

  lastUsage = {
    system: system / timeDelta,
    total: (system + user) / timeDelta,
    user: user / timeDelta,
  };
  previousTime = currentTime;

  console.log(`total: ${lastUsage.total}`);
}, 1000);
