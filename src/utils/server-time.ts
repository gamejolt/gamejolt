export class ServerTime {
	private static serverOffset = 0;

	/**
	 * Gets the time of our server that sent the last server time.
	 */
	public static get now() {
		return Date.now() - this.serverOffset;
	}

	/**
	 * Updates the server time offset to the local time with a timestamp from the server.
	 */
	public static updateOffset(serverUtcTime: number) {
		const now = Date.now();

		// When the difference between server and local time is less than 1 second,
		// we just pretend like there is no offset.
		// The small difference between server and local time are inaccuracies of server/local
		// clocks and the server connection latency.
		if (now > serverUtcTime && now - serverUtcTime < 1000) {
			this.serverOffset = 0;
		} else {
			this.serverOffset = now - serverUtcTime;
		}

		console.log('Updated server time offset', this.serverOffset);
	}
}
