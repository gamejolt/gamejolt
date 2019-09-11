import Axios from 'axios';

export class Primus {
	static async createConnection(host: string) {
		const PrimusConstructor: any = (await import(/* webpackChunkName: "primus" */ './primus-vendor'))
			.default;

		// We first have to make an API call to get a host to use.
		// This allows us to go through the load balancer to get a host to contact.
		// After we get the host we can make a direct call to it.
		let streamingHost = await this.getStreamingHost(host);

		// Let's connect to Primus.
		let primus = new PrimusConstructor(streamingHost, {
			reconnect: {
				maxDelay: 15000,
				minDelay: 500,
				retries: Infinity, // Retry forever.
			},
		});

		// If the connection fails we need to try to get a new host that may be able to fulfill the
		// connection. Primus will keep trying itself, but we want to spawn another call to get
		// a new streaming host just in case. We do that and then try to update primus with the new
		// url if we find a new host before it reconnects back to the old one.
		let _reconnecting = false;
		primus.on('reconnect scheduled', async () => {
			if (_reconnecting) {
				return;
			}
			_reconnecting = true;

			streamingHost = await this.getStreamingHost(host);

			// Only if it didn't reconnect to the old host in time.
			if (_reconnecting) {
				primus.url = primus.parse(streamingHost);
			}
		});

		primus.on('reconnected', () => (_reconnecting = false));

		return primus;
	}

	private static getStreamingHost(host: string) {
		return new Promise<string>(resolve => {
			this.queryForHost(host, resolve);
		});
	}

	private static async queryForHost(host: string, resolve: Function) {
		try {
			const response = await Axios.get(host + '/_info', {
				ignoreLoadingBar: true,
			});

			const protocol = host.search(/^https/) === -1 ? 'http' : 'https';
			if (response.status !== 200) {
				throw new Error('Could not find host.');
			}

			resolve(protocol + '://' + response.data.host);
		} catch (_response) {
			window.setTimeout(() => {
				this.queryForHost(host, resolve);
			}, 1000 + Math.random() * 5000);
		}
	}
}
