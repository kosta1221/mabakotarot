export const logPurple = (...messages: string[]) => {
  console.log("\x1b[35m%s\x1b[0m", ...messages);
};

export const logGreen = (...messages: string[]) => {
  console.log("\x1b[32m\x1b[40m%s\x1b[0m", ...messages);
};

export const logRed = (...messages: string[]) => {
  console.log("\x1b[31m%s\x1b[0m", ...messages);
};

export const logBlue = (...messages: string[]) => {
  console.log("\x1b[36m%s\x1b[0m", ...messages);
};
