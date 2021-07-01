const retry = async (numOfRetries, funcToRetry, ...args) => {
	try {
		return await funcToRetry(...args);
	} catch (err) {
		if (numOfRetries === 0) {
			console.log(`No retries left for ${funcToRetry.name}, throwing error`);
			throw err;
		}
		console.log(`number of retries left for ${funcToRetry.name}: `, numOfRetries - 1);
		console.log(`retrying ${funcToRetry.name}...`);
		return await retry(numOfRetries - 1, funcToRetry, ...args);
	}
};

const retryWithTimeOut = async (timeOutMs, numOfRetries, funcToRetry, ...args) => {
	try {
		return await funcToRetry(...args);
	} catch (err) {
		if (numOfRetries === 0) {
			console.log(`No retries left for ${funcToRetry.name}, throwing error`);
			throw err;
		}
		console.log(`number of retries left for ${funcToRetry.name}: `, numOfRetries - 1);
		console.log(`waiting ${timeOutMs / 1000} seconds before retrying ${funcToRetry.name}...`);

		await new Promise(async (resolve, reject) => {
			setTimeout(() => {
				resolve();
				console.log("finished timeout");
			}, timeOutMs);
			try {
			} catch (error) {
				reject(error);
			}
		});

		console.log(`retrying ${funcToRetry.name}...`);
		return retryWithTimeOut(timeOutMs, numOfRetries - 1, funcToRetry, ...args);
	}
};

module.exports = { retry, retryWithTimeOut };
