import { AxiosError, AxiosPromise } from 'axios';
import { RequestOptions } from '../api/api.service';
import { Environment } from '../environment/environment.service';
import { showErrorGrowl } from '../growls/growls.service';
import { Seo } from '../seo/seo.service';
import { CommonStore } from '../store/common-store';
import { $gettext } from '../translate/translate.service';

export type PayloadFormErrors = { [errorId: string]: boolean };

export const enum PayloadErrorType {
	NewVersion = 'payload-new-version',
	NotLogged = 'payload-not-logged',
	Invalid = 'payload-invalid',
	HttpError = 'payload-error',
	Offline = 'payload-offline',
	Redirect = 'payload-redirect',
	NewClientVersion = 'payload-new-client-version',
	UserTimedOut = 'payload-user-timed-out',
	RateLimit = 'payload-rate-limit',
}

export class PayloadError {
	constructor(public type: string, public response?: any, public status?: number) {}
	redirect?: string;
}

export function buildPayloadErrorForStatusCode(statusCode: number) {
	return new PayloadError(PayloadErrorType.HttpError, undefined, statusCode);
}

function _buildPayloadErrorFromAxios({ response }: AxiosError) {
	// If the response indicated a failed connection.
	if (response === undefined || response.status === -1) {
		return new PayloadError(PayloadErrorType.Offline);
	}

	const data = response.data as any;

	if (response.status === 401) {
		// If it was a 401 error, then they need to be logged in.
		// Let's redirect them to the login page on the main site.
		return new PayloadError(PayloadErrorType.NotLogged, data || undefined, 401);
	} else if (response.status === 403 && data.user?.timeout) {
		return new PayloadError(PayloadErrorType.UserTimedOut, data || undefined, 403);
	} else if (response.status === 429) {
		return new PayloadError(PayloadErrorType.RateLimit, data || undefined, 429);
	}

	// Otherwise, show an error page.
	return new PayloadError(
		PayloadErrorType.HttpError,
		data || undefined,
		response.status || undefined
	);
}

class PayloadService {
	readonly httpErrors = [400, 403, 404, 500];
	// These http errors are not redirects, so the noRedirect behavior should not apply to them.
	readonly httpNoRedirectOverrides = [429];

	private declare commonStore: CommonStore;
	private ver?: number = undefined;
	private payloadActionsHandler: ((payload: any) => void) | null = null;

	init({ commonStore }: { commonStore: CommonStore }) {
		this.commonStore = commonStore;
	}

	async processResponse(
		requestPromise: AxiosPromise<any>,
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
						PayloadErrorType.Invalid,
						response ? response.data || undefined : undefined
					);
				} else {
					throw response.data || undefined;
				}
			}

			const responseData = response.data;

			this.checkClientForceUpgrade(responseData);
			this.checkPayloadUser(responseData, options);
			this.checkPayloadConsents(responseData);
			this.checkPayloadVersion(responseData, options);
			this.checkPayloadSeo(responseData, options);

			if (this.payloadActionsHandler) {
				this.payloadActionsHandler(responseData);
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
				throw new PayloadError(PayloadErrorType.NewVersion);
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

	private checkPayloadConsents(data: any) {
		if (!data || !this.commonStore) {
			return;
		}

		if (typeof data.c === 'object') {
			this.commonStore.setConsents(data.c);
			return;
		}

		this.commonStore.setConsents({});
	}

	private checkClientForceUpgrade(data: any) {
		// We ignore completely if we're not in the client.
		if (!GJ_IS_DESKTOP_APP) {
			return;
		}

		if (data.clientForceUpgrade) {
			throw new PayloadError(PayloadErrorType.NewClientVersion);
		}
	}

	private handlePayloadError(error: PayloadError) {
		if (error.type === PayloadErrorType.NewVersion) {
			// Do nothing. Our BeforeRouteEnter util will catch this payload
			// error and do a refresh of the page after it has the URL to
			// reload.
		} else if (error.type === PayloadErrorType.NotLogged) {
			const redirect = encodeURIComponent(
				import.meta.env.SSR ? Environment.ssrContext.url : window.location.href
			);
			const location = Environment.authBaseUrl + '/login?redirect=' + redirect;
			this.commonStore.redirect(location);
		} else if (error.type === PayloadErrorType.NewClientVersion) {
			this.commonStore.redirect(Environment.clientSectionUrl + '/upgrade');
		} else if (error.type === PayloadErrorType.UserTimedOut) {
			this.commonStore.redirect(Environment.wttfBaseUrl + '/timeout');
		} else if (error.type === PayloadErrorType.Invalid) {
			this.commonStore.setError(500);
		} else if (error.type === PayloadErrorType.RateLimit) {
			showErrorGrowl({
				title: $gettext(`Whoa there, slow down!`),
				message: $gettext(
					`Looks like you are doing that too much. Slow down, then try again in a few minutes.`
				),
			});
		} else if (
			error.type === PayloadErrorType.HttpError &&
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

	assignPayloadActionsHandler(fn: (payload: any) => void) {
		this.payloadActionsHandler = fn;
	}
}

export const Payload = /** @__PURE__ */ new PayloadService();
