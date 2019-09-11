import { AxiosError } from 'axios';
import { VuexStore } from '../../utils/vuex';
import { Analytics } from '../analytics/analytics.service';
import { RequestOptions } from '../api/api.service';
import { Environment } from '../environment/environment.service';
import { Seo } from '../seo/seo.service';

export class PayloadError {
	static readonly ERROR_NEW_VERSION = 'payload-new-version';
	static readonly ERROR_NOT_LOGGED = 'payload-not-logged';
	static readonly ERROR_INVALID = 'payload-invalid';
	static readonly ERROR_HTTP_ERROR = 'payload-error';
	static readonly ERROR_OFFLINE = 'payload-offline';
	static readonly ERROR_REDIRECT = 'payload-redirect';
	static readonly ERROR_NEW_CLIENT_VERSION = 'payload-new-client-version';

	redirect?: string;

	constructor(public type: string, public response?: any, public status?: number) {}

	static fromAxiosError(e: AxiosError) {
		const response = e.response;

		// If the response indicated a failed connection.
		if (response === undefined || response.status === -1) {
			return new PayloadError(PayloadError.ERROR_OFFLINE);
		} else if (response.status === 401) {
			// If it was a 401 error, then they need to be logged in.
			// Let's redirect them to the login page on the main site.
			return new PayloadError(PayloadError.ERROR_NOT_LOGGED, response.data || undefined);
		}

		// Otherwise, show an error page.
		return new PayloadError(
			PayloadError.ERROR_HTTP_ERROR,
			response.data || undefined,
			response.status || undefined
		);
	}

	static fromHttpError(status: number) {
		return new PayloadError(PayloadError.ERROR_HTTP_ERROR, undefined, status);
	}
}

export class Payload {
	static readonly httpErrors = [400, 403, 404, 500];

	private static store: VuexStore;
	private static ver?: number = undefined;

	static init(store: VuexStore) {
		this.store = store;
	}

	static async processResponse(
		requestPromise: Promise<any>,
		options: RequestOptions = {}
	): Promise<any> {
		options = {
			...(<RequestOptions>{
				ignorePayloadUser: false,
				ignorePayloadVersion: false,
				ignorePayloadSeo: false,
				noErrorRedirect: false,
			}),
			...options,
		};

		try {
			let response = await requestPromise;

			if (!response || !response.data) {
				if (!options.noErrorRedirect) {
					throw new PayloadError(
						PayloadError.ERROR_INVALID,
						response ? response.data || undefined : undefined
					);
				} else {
					throw response.data || undefined;
				}
			}

			const data = response.data;

			this.checkClientForceUpgrade(data);
			this.checkPayloadUser(response, options);
			this.checkPayloadConsents(response);
			this.checkPayloadVersion(data, options);
			this.checkPayloadSeo(data, options);
			this.checkAnalyticsExperiments(response, options);

			return data.payload;
		} catch (error) {
			if (!GJ_IS_SSR) {
				console.error('Payload error', error);
			}

			if (error instanceof PayloadError) {
				throw this.handlePayloadError(error);
			}

			let response: any = undefined;
			if (error && error.response) {
				response = error.response;
			}

			this.checkPayloadUser(response, options);

			if (!options.noErrorRedirect) {
				throw this.handlePayloadError(PayloadError.fromAxiosError(error));
			} else {
				throw error;
			}
		}
	}

	private static checkPayloadVersion(data: any, options: RequestOptions) {
		// We ignore completely if we're in the client.
		// We don't want the client refreshing when an update to site is pushed out.
		if (options.ignorePayloadVersion || GJ_IS_CLIENT || GJ_IS_SSR) {
			return;
		}

		if (data.ver !== this.ver) {
			// If we didn't have a version, then it's the first payload.
			// Simply assign it.
			if (this.ver === undefined) {
				this.ver = data.ver;
			} else {
				throw new PayloadError(PayloadError.ERROR_NEW_VERSION);
			}
		}
	}

	private static checkPayloadUser(response: any, options: RequestOptions) {
		if (options.ignorePayloadUser || !response || !response.data || !this.store) {
			return;
		}

		// Only process if this payload response had a user attached to it.
		// It couid be null (for logged out) or an object (if logged in).
		const data = response.data;
		if (typeof data.user !== 'undefined') {
			if (data.user === null) {
				this.store.commit('app/clearUser');
			} else {
				// There is a circular dependency if we import at top.
				const User = require('../user/user.model').User;
				this.store.commit('app/setUser', new User(data.user));
			}
		}
	}

	private static checkPayloadSeo(data: any, options: RequestOptions) {
		if (!data || !data.meta || !data.meta.seo || options.ignorePayloadSeo) {
			return;
		}

		Seo.processPayloadDirectives(data.meta.seo);
	}

	private static checkPayloadConsents(response: any) {
		if (!response || !response.data || !this.store) {
			return;
		}

		const data = response.data;
		if (typeof data.c === 'object') {
			this.store.commit('app/setConsents', data.c);
			return;
		}

		this.store.commit('app/setConsents', {});
	}

	private static checkClientForceUpgrade(data: any) {
		// We ignore completely if we're not in the client.
		if (!GJ_IS_CLIENT) {
			return;
		}

		if (data.clientForceUpgrade) {
			throw new PayloadError(PayloadError.ERROR_NEW_CLIENT_VERSION);
		}
	}

	private static checkAnalyticsExperiments(response: any, _options: RequestOptions) {
		if (!response.data.payload) {
			return;
		}

		const payload = response.data.payload;
		if (
			typeof payload._experiment !== 'undefined' &&
			typeof payload._variation !== 'undefined' &&
			payload._variation !== -1
		) {
			Analytics.setCurrentExperiment(payload._experiment, payload._variation);
		}
	}

	private static handlePayloadError(error: PayloadError) {
		if (error.type === PayloadError.ERROR_NEW_VERSION) {
			// Do nothing. Our BeforeRouteEnter util will catch this payload
			// error and do a refresh of the page after it has the URL to
			// reload.
		} else if (error.type === PayloadError.ERROR_NOT_LOGGED) {
			const redirect = encodeURIComponent(
				GJ_IS_SSR ? Environment.ssrContext.url : window.location.href
			);
			const location = Environment.authBaseUrl + '/login?redirect=' + redirect;
			this.store.commit('app/redirect', location);
		} else if (error.type === PayloadError.ERROR_NEW_CLIENT_VERSION) {
			this.store.commit('app/redirect', Environment.clientSectionUrl + '/upgrade');
		} else if (error.type === PayloadError.ERROR_INVALID) {
			this.store.commit('app/setError', 500);
		} else if (
			error.type === PayloadError.ERROR_HTTP_ERROR &&
			(!error.status || this.httpErrors.indexOf(error.status) !== -1)
		) {
			this.store.commit('app/setError', error.status || 500);
		} else {
			this.store.commit('app/setError', 'offline');
		}

		return error;
	}
}
