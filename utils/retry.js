const retry = async (numOfRetries, funcToRetry, ...args) => {
	try {
		return await funcToRetry(...args);
	} catch (err) {
		if (numOfRetries === 0) {
			console.log(`No retries left for ${funcToRetry.name}, throwing error`);
			throw err;
		}
		console.log(`number of retries left for ${funcToRetry.name}: `, numOfRetries);
		console.log(`retrying ${funcToRetry.name}...`);
		return await retry(numOfRetries - 1, funcToRetry, ...args);
	}
};

module.exports = retry;
