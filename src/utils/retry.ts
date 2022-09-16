export const retry = async (numOfRetries, funcToRetry, ...args) => {
  try {
    return await funcToRetry(...args);
  } catch (err) {
    if (numOfRetries === 0) {
      console.log("\x1b[31m%s\x1b[0m", `No retries left for ${funcToRetry.name}, throwing error`);
      throw err;
    }
    console.log(`number of retries left for ${funcToRetry.name}: `, numOfRetries - 1);
    console.log("\x1b[35m%s\x1b[0m", `retrying ${funcToRetry.name}...`);
    return await retry(numOfRetries - 1, funcToRetry, ...args);
  }
};

export const retryWithTimeOut = async (timeOutMs, numOfRetries, funcToRetry, ...args) => {
  try {
    return await funcToRetry(...args);
  } catch (err) {
    if (numOfRetries === 0) {
      console.log("\x1b[31m%s\x1b[0m", `No retries left for ${funcToRetry.name}, throwing error`);
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

    console.log("\x1b[35m%s\x1b[0m", `retrying ${funcToRetry.name}...`);
    return retryWithTimeOut(timeOutMs, numOfRetries - 1, funcToRetry, ...args);
  }
};
