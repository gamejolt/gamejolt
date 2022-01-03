import { AxiosError } from 'axios';
import { RequestOptions } from '../api/api.service';
import { Environment } from '../environment/environment.service';
import { showErrorGrowl } from '../growls/growls.service';
import { Seo } from '../seo/seo.service';
import { WithAppStore } from '../store/app-store';
import { Translate } from '../translate/translate.service';

export type PayloadFormErrors = { [errorId: string]: boolean };

export class PayloadError {
	static readonly ERROR_NEW_VERSION = 'payload-new-version';
	static readonly ERROR_NOT_LOGGED = 'payload-not-logged';
	static readonly ERROR_INVALID = 'payload-invalid';
	static readonly ERROR_HTTP_ERROR = 'payload-error';
	static readonly ERROR_OFFLINE = 'payload-offline';
	static readonly ERROR_REDIRECT = 'payload-redirect';
	static readonly ERROR_NEW_CLIENT_VERSION = 'payload-new-client-version';
	static readonly ERROR_USER_TIMED_OUT = 'payload-user-timed-out';
	static readonly ERROR_RATE_LIMIT = 'payload-rate-limit';

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
			return new PayloadError(PayloadError.ERROR_NOT_LOGGED, response.data || undefined, 401);
		} else if (response.status === 403 && response.data.user?.timeout) {
			return new PayloadError(
				PayloadError.ERROR_USER_TIMED_OUT,
				response.data || undefined,
				403
			);
		} else if (response.status === 429) {
			return new PayloadError(PayloadError.ERROR_RATE_LIMIT, response.data || undefined, 429);
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
	// These http errors are not redirects, so the noRedirect behavior should not apply to them.
	static readonly httpNoRedirectOverrides = [429];

	private static store: WithAppStore;
	private static ver?: number = undefined;

	static init(store: WithAppStore) {
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
			const response = await requestPromise;

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

			return data.payload;
		} catch (error) {
			if (!import.meta.env.SSR) {
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

			// Do not do error redirects when the user cancelled the upload file request.
			if (this.isCancelledUpload(error)) {
				throw error;
			}

			if (
				!options.noErrorRedirect ||
				this.httpNoRedirectOverrides.includes(response.status)
			) {
				throw this.handlePayloadError(PayloadError.fromAxiosError(error));
			} else {
				throw error;
			}
		}
	}

	/**
	 * Indicates an axios cancel token cancelled the request.
	 */
	static isCancelledUpload(payload: any) {
		return payload.__CANCEL__ === true;
	}

	private static checkPayloadVersion(data: any, options: RequestOptions) {
		// We ignore completely if we're in the client.
		// We don't want the client refreshing when an update to site is pushed out.
		if (options.ignorePayloadVersion || GJ_IS_DESKTOP_APP || import.meta.env.SSR) {
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
				this.store.commit('app/setUser', data.user);
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
		if (!GJ_IS_DESKTOP_APP) {
			return;
		}

		if (data.clientForceUpgrade) {
			throw new PayloadError(PayloadError.ERROR_NEW_CLIENT_VERSION);
		}
	}

	private static handlePayloadError(error: PayloadError) {
		if (error.type === PayloadError.ERROR_NEW_VERSION) {
			// Do nothing. Our BeforeRouteEnter util will catch this payload
			// error and do a refresh of the page after it has the URL to
			// reload.
		} else if (error.type === PayloadError.ERROR_NOT_LOGGED) {
			const redirect = encodeURIComponent(
				import.meta.env.SSR ? Environment.ssrContext.url : window.location.href
			);
			const location = Environment.authBaseUrl + '/login?redirect=' + redirect;
			this.store.commit('app/redirect', location);
		} else if (error.type === PayloadError.ERROR_NEW_CLIENT_VERSION) {
			this.store.commit('app/redirect', Environment.clientSectionUrl + '/upgrade');
		} else if (error.type === PayloadError.ERROR_USER_TIMED_OUT) {
			this.store.commit('app/redirect', Environment.wttfBaseUrl + '/timeout');
		} else if (error.type === PayloadError.ERROR_INVALID) {
			this.store.commit('app/setError', 500);
		} else if (error.type === PayloadError.ERROR_RATE_LIMIT) {
			showErrorGrowl({
				title: Translate.$gettext(`Whoa there, slow down!`),
				message: Translate.$gettext(
					`Looks like you are doing that too much. Slow down, then try again in a few minutes.`
				),
			});
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

	static formErrors(payload: any): PayloadFormErrors | null {
		const errors = payload?.errors;

		if (typeof errors !== 'object' || Object.keys(errors).length === 0) {
			return null;
		}

		return errors;
	}

	static hasFormError(payload: any, errorId: string): boolean {
		const errors = this.formErrors(payload);
		return !!errors?.[errorId];
	}
}
