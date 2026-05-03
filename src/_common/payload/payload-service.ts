import { AxiosError, AxiosPromise } from 'axios';

import { RequestOptions } from '~common/api/api.service';
import { Environment, getSsrContext } from '~common/environment/environment.service';
import { showErrorGrowl } from '~common/growls/growls.service';
import { Seo } from '~common/seo/seo.service';
import { defineIsolatedState } from '~common/ssr/isolated-state';
import { CommonStore } from '~common/store/common-store';
import { $gettext } from '~common/translate/translate.service';

export type PayloadFormErrors = { [errorId: string]: boolean };

export const PayloadErrorTypeNewVersion = 'payload-new-version';
export const PayloadErrorTypeNotLogged = 'payload-not-logged';
export const PayloadErrorTypeInvalid = 'payload-invalid';
export const PayloadErrorTypeHttpError = 'payload-error';
export const PayloadErrorTypeOffline = 'payload-offline';
export const PayloadErrorTypeRedirect = 'payload-redirect';
export const PayloadErrorTypeNewClientVersion = 'payload-new-client-version';
export const PayloadErrorTypeUserTimedOut = 'payload-user-timed-out';
export const PayloadErrorTypeRateLimit = 'payload-rate-limit';

export type PayloadErrorType =
	| typeof PayloadErrorTypeNewVersion
	| typeof PayloadErrorTypeNotLogged
	| typeof PayloadErrorTypeInvalid
	| typeof PayloadErrorTypeHttpError
	| typeof PayloadErrorTypeOffline
	| typeof PayloadErrorTypeRedirect
	| typeof PayloadErrorTypeNewClientVersion
	| typeof PayloadErrorTypeUserTimedOut
	| typeof PayloadErrorTypeRateLimit;

export class PayloadError {
	constructor(
		public type: string,
		public response?: any,
		public status?: number
	) {}
	redirect?: string;
}

export function buildPayloadErrorForStatusCode(statusCode: number) {
	return new PayloadError(PayloadErrorTypeHttpError, undefined, statusCode);
}

function _buildPayloadErrorFromAxios({ response }: AxiosError) {
	// If the response indicated a failed connection.
	if (response === undefined || response.status === -1) {
		return new PayloadError(PayloadErrorTypeOffline);
	}

	const data = response.data as any;

	if (response.status === 401) {
		// If it was a 401 error, then they need to be logged in.
		// Let's redirect them to the login page on the main site.
		return new PayloadError(PayloadErrorTypeNotLogged, data || undefined, 401);
	} else if (response.status === 403 && data.user?.timeout) {
		return new PayloadError(PayloadErrorTypeUserTimedOut, data || undefined, 403);
	} else if (response.status === 429) {
		return new PayloadError(PayloadErrorTypeRateLimit, data || undefined, 429);
	}

	// Otherwise, show an error page.
	return new PayloadError(
		PayloadErrorTypeHttpError,
		data || undefined,
		response.status || undefined
	);
}

const _state = defineIsolatedState(() => ({
	commonStore: undefined as CommonStore | undefined,
	ver: undefined as number | undefined,
	payloadHandlers: [] as ((payload: any) => void)[],
}));

class PayloadService {
	readonly httpErrors = [400, 403, 404, 500];
	// These http errors are not redirects, so the noRedirect behavior should not apply to them.
	readonly httpNoRedirectOverrides = [429];

	private get commonStore(): CommonStore {
		return _state().commonStore!;
	}

	private get ver(): number | undefined {
		return _state().ver;
	}

	private set ver(value: number | undefined) {
		_state().ver = value;
	}

	private get payloadHandlers() {
		return _state().payloadHandlers;
	}

	init({ commonStore }: { commonStore: CommonStore }) {
		_state().commonStore = commonStore;
	}

	async processResponse(
		requestBuilder: () => AxiosPromise<any>,
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
			const response = await requestBuilder();

			if (!response || !response.data) {
				if (!options.noErrorRedirect) {
					throw new PayloadError(
						PayloadErrorTypeInvalid,
						response ? response.data || undefined : undefined
					);
				} else {
					throw response.data || undefined;
				}
			}

			const responseData = response.data;

			this.checkClientForceUpgrade(responseData);
			this.checkPayloadUser(responseData, options);
			this.checkPayloadVersion(responseData, options);
			this.checkPayloadSeo(responseData, options);

			if (this.payloadHandlers.length) {
				this.payloadHandlers.forEach(handler => handler(responseData));
			}

			return responseData.payload;
		} catch (error: any) {
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

			this.checkPayloadUser(response.data, options);

			// Do not do error redirects when the user cancelled the upload file request.
			if (this.isCancelledUpload(error)) {
				throw error;
			}

			if (
				!options.noErrorRedirect ||
				this.httpNoRedirectOverrides.includes(response.status)
			) {
				throw this.handlePayloadError(_buildPayloadErrorFromAxios(error));
			} else {
				throw error;
			}
		}
	}

	/**
	 * Indicates an axios cancel token cancelled the request.
	 */
	isCancelledUpload(payload: any) {
		return payload.__CANCEL__ === true;
	}

	private checkPayloadVersion(data: any, options: RequestOptions) {
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
				throw new PayloadError(PayloadErrorTypeNewVersion);
			}
		}
	}

	private checkPayloadUser(data: any, options: RequestOptions) {
		if (options.ignorePayloadUser || !data || !this.commonStore) {
			return;
		}

		// Only process if this payload response had a user attached to it.
		// It could be null (for logged out) or an object (if logged in).
		if (typeof data.user !== 'undefined') {
			if (data.user === null) {
				this.commonStore.clearUser();
			} else {
				this.commonStore.setUser(data.user);
			}
		}
	}

	private checkPayloadSeo(data: any, options: RequestOptions) {
		if (!data || !data.meta || !data.meta.seo || options.ignorePayloadSeo) {
			return;
		}

		Seo.processPayloadDirectives(data.meta.seo);
	}

	private checkClientForceUpgrade(data: any) {
		// We ignore completely if we're not in the client.
		if (!GJ_IS_DESKTOP_APP) {
			return;
		}

		if (data.clientForceUpgrade) {
			throw new PayloadError(PayloadErrorTypeNewClientVersion);
		}
	}

	private handlePayloadError(error: PayloadError) {
		if (error.type === PayloadErrorTypeNewVersion) {
			// Do nothing. Our BeforeRouteEnter util will catch this payload
			// error and do a refresh of the page after it has the URL to
			// reload.
		} else if (error.type === PayloadErrorTypeNotLogged) {
			const redirect = encodeURIComponent(
				import.meta.env.SSR ? getSsrContext().url : window.location.href
			);
			const location = Environment.authBaseUrl + '/login?redirect=' + redirect;
			this.commonStore.redirect(location);
		} else if (error.type === PayloadErrorTypeNewClientVersion) {
			this.commonStore.redirect(Environment.clientSectionUrl + '/upgrade');
		} else if (error.type === PayloadErrorTypeUserTimedOut) {
			this.commonStore.redirect(Environment.wttfBaseUrl + '/timeout');
		} else if (error.type === PayloadErrorTypeInvalid) {
			this.commonStore.setError(500);
		} else if (error.type === PayloadErrorTypeRateLimit) {
			showErrorGrowl({
				title: $gettext(`Whoa there, slow down!`),
				message: $gettext(
					`Looks like you are doing that too much. Slow down, then try again in a few minutes.`
				),
			});
		} else if (
			error.type === PayloadErrorTypeHttpError &&
			(!error.status || this.httpErrors.indexOf(error.status) !== -1)
		) {
			this.commonStore.setError(error.status || 500);
		} else {
			this.commonStore.setError('offline');
		}

		return error;
	}

	formErrors(payload: any): PayloadFormErrors | null {
		const errors = payload?.errors;

		if (typeof errors !== 'object' || Object.keys(errors).length === 0) {
			return null;
		}

		return errors;
	}

	hasFormError(payload: any, errorId: string): boolean {
		const errors = this.formErrors(payload);
		return !!errors?.[errorId];
	}

	addPayloadHandler(fn: (payload: any) => void) {
		this.payloadHandlers.push(fn);
	}

	removePayloadHandler(fn: (payload: any) => void) {
		const index = this.payloadHandlers.indexOf(fn);
		if (index !== -1) {
			this.payloadHandlers.splice(index, 1);
		}
	}
}

export const Payload = /** @__PURE__ */ new PayloadService();
