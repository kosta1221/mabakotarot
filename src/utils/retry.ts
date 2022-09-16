import { logPurple, logRed } from "./console";

export const retry = async (numOfRetries, funcToRetry, ...args) => {
  try {
    return await funcToRetry(...args);
  } catch (err) {
    if (numOfRetries === 0) {
      logRed(`No retries left for ${funcToRetry.name}, throwing error`);
      throw err;
    }
    console.log(`number of retries left for ${funcToRetry.name}: `, numOfRetries - 1);
    logPurple(`retrying ${funcToRetry.name}...`);
    return await retry(numOfRetries - 1, funcToRetry, ...args);
  }
};

export const retryWithTimeOut = async (timeOutMs, numOfRetries, funcToRetry, ...args) => {
  try {
    return await funcToRetry(...args);
  } catch (err) {
    if (numOfRetries === 0) {
      logRed(`No retries left for ${funcToRetry.name}, throwing error`);
      throw err;
    }
    console.log(`number of retries left for ${funcToRetry.name}: `, numOfRetries - 1);
    console.log(`waiting ${timeOutMs / 1000} seconds before retrying ${funcToRetry.name}...`);

    await new Promise<void>(async (resolve, reject) => {
      setTimeout(() => {
        resolve();
        console.log("finished timeout");
      }, timeOutMs);
      try {
      } catch (error) {
        reject(error);
      }
    });

    logPurple(`retrying ${funcToRetry.name}...`);
    return retryWithTimeOut(timeOutMs, numOfRetries - 1, funcToRetry, ...args);
  }
};
