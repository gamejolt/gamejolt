import Axios, { AxiosRequestConfig } from 'axios';
import { ref } from 'vue';
import { Environment } from '../environment/environment.service';
import { Payload } from '../payload/payload-service';

export interface ApiProgressEvent {
	loaded: number;
	total: number;
}

// Memoized essentially, and lazily fetched when first needed.
let _hasWebpSupport: null | Promise<boolean> = null;
const hasWebpSupport = () => {
	if (!_hasWebpSupport) {
		_hasWebpSupport = import.meta.env.SSR
			? // SSR passes through the webp support from the client.
			  Promise.resolve(Environment.ssrContext.accept.includes('image/webp'))
			: // For normal clients we have to test for it by loading in a webp
			  // image through a data URI.
			  new Promise<boolean>(resolve => {
					const image = new Image();
					image.onerror = () => resolve(false);
					image.onload = () => resolve(image.width === 1);
					image.src =
						'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
			  }).catch(() => false);
	}

	return _hasWebpSupport;
};

export interface RequestOptions {
	/**
	 * Files to upload can be passed in through here.
	 */
	file?: File | File[] | null;

	/**
	 * Progress handler. Will only be used when uploading a file.
	 */
	progress?: (event: ApiProgressEvent | null) => void;

	/**
	 * Whether or not to show the loading bar.
	 */
	ignoreLoadingBar?: boolean;

	/**
	 * Whether or not to process the payload at the end.
	 */
	processPayload?: boolean;

	/**
	 * Whether or not to send in the credentials.
	 */
	withCredentials?: boolean;

	/**
	 * Will filter out functions, sub-objects and sub-arrays from sending to the
	 * server.
	 */
	sanitizeComplexData?: boolean;

	/**
	 * This should be an array of fields that you don't want to sanitize/filter
	 * in the POST data. Use it as a whitelist of fields to pass through.
	 */
	allowComplexData?: string[];

	/**
	 * Whether or not we pull in the user from the payload.
	 */
	ignorePayloadUser?: boolean;

	/**
	 * When payload version changes, we will refresh the page. Whether or not we
	 * ignore the payload version.
	 */
	ignorePayloadVersion?: boolean;

	/**
	 * Whether or not we pass the seo metadata we received to the seo service.
	 */
	ignorePayloadSeo?: boolean;

	/**
	 * Whether or not we should redirect to an error page if there was an error.
	 */
	noErrorRedirect?: boolean;

	/**
	 * A detached request tries to be outside of the system so it doesn't affect
	 * normal usage. A shorthand for many options. - ignores loading bar - will
	 * ignore the user from the payload - will ignore the version number so it
	 * doesn't refresh - won't direct to an error page if there was a status
	 * code error
	 */
	detach?: boolean;

	// You can change the default api host/path used through these.
	apiHost?: string;
	apiPath?: string;

	/**
	 * CancelToken function given to the Axios request when uploading a file.
	 * Invoking the returned executor cancels the file upload.
	 */
	fileCancelToken?: AbortSignal;
}

export class Api {
	static loadingBarRequests = ref(0);

	static apiHost: string = Environment.apiHost;
	static uploadHost: string = Environment.uploadHost;
	static apiPath = '/site-api';

	static async sendRequest<T = any>(
		uri: string,
		postData?: any,
		options: RequestOptions = {}
	): Promise<T> {
		options = {
			...(<RequestOptions>{
				ignoreLoadingBar: false,
				processPayload: true,
				withCredentials: true,
				sanitizeComplexData: true,
				allowComplexData: [],
				detach: false,
			}),
			...options,
		};

		// Set up the detachment options if detach is set.
		if (options.detach) {
			options.ignoreLoadingBar = true;
			options.ignorePayloadUser = true;
			options.ignorePayloadVersion = true;
			options.noErrorRedirect = true;
		}

		let sanitizedPostData: any = undefined;
		if (postData) {
			sanitizedPostData = {};
			for (const key of Object.keys(postData)) {
				const value = postData[key];
				const valueType = typeof value;

				if (valueType === 'undefined') {
					continue;
				}

				// Complex data allows certain known objects to pass through to the server.
				// It must be set explicitly if you want to send in an object as a value.
				if (options.sanitizeComplexData) {
					if (
						(options.allowComplexData &&
							options.allowComplexData.indexOf(key) !== -1) ||
						(valueType !== 'function' &&
							valueType !== 'object' &&
							!Array.isArray(value))
					) {
						sanitizedPostData[key] = value;
					}
				} else {
					sanitizedPostData[key] = value;
				}
			}
		}

		const method = sanitizedPostData ? 'POST' : 'GET';
		const apiHost = options.apiHost ?? (options.file ? this.uploadHost : this.apiHost);
		const url = apiHost + (options.apiPath ?? this.apiPath) + uri;

		const requestPromise = this.createRequest(method, url, sanitizedPostData, options);

		// If we aren't processing the payload, then just return the promise.
		if (!options.processPayload) {
			return await requestPromise;
		}

		return Payload.processResponse(requestPromise, options);
	}

	/**
	 * Used to send a request for specific fields against the mobile API.
	 */
	static async sendFieldsRequest<T = any>(
		uri: string,
		fields: Record<string, any>,
		options: RequestOptions = {}
	): Promise<T> {
		return this.sendRequest(
			uri,
			{
				_fields: fields,
			},
			{
				...options,
				sanitizeComplexData: false,
			}
		);
	}

	private static async createRequest(
		method: 'GET' | 'POST',
		url: string,
		data: any,
		options: RequestOptions
	) {
		// For SSR we pass in the frontend cookie of "ssr" so that the server
		// knows that this is an SSR request and shouldn't store session data.
		const headers: any = {};
		if (import.meta.env.SSR) {
			headers.cookie = 'frontend=ssr;';
		}

		if (await hasWebpSupport()) {
			headers['accept'] = 'image/webp,*/*';
		}

		const showLoading = !options.ignoreLoadingBar;
		if (showLoading) {
			++this.loadingBarRequests.value;
		}

		let promise: Promise<any>;

		if (options.file) {
			// An upload request.
			// We have to send it over as form data instead of JSON data.
			data = { ...data, file: options.file };
			const formData = new FormData();
			for (const key in data) {
				if (Array.isArray(data[key])) {
					for (const i of data[key]) {
						formData.append(key + '[]', i);
					}
				} else {
					formData.append(key, data[key]);
				}
			}

			promise = this.sendRawRequest(url, {
				method,
				data: formData,
				headers,
				withCredentials: options.withCredentials,
				signal: options.fileCancelToken,
				onUploadProgress: e => {
					if (options.progress && e.total) {
						options.progress({
							loaded: e.loaded,
							total: e.total,
						});
					}
				},
			}).then((response: any) => {
				// When the request is done, send one last progress event of
				// nothing to indicate that the transfer is complete.
				if (options.progress) {
					options.progress(null);
				}
				return response;
			});
		} else {
			promise = this.sendRawRequest(url, {
				method,
				data,
				headers,
				withCredentials: options.withCredentials,
			});
		}

		promise.finally(() => {
			if (showLoading) {
				--this.loadingBarRequests.value;
			}
		});

		return promise;
	}

	public static createCancelToken() {
		return new AbortController();
	}

	public static async sendRawRequest(url: string, config: AxiosRequestConfig = {}) {
		const requestInfo = config;
		requestInfo.url = url;

		if (GJ_IS_DESKTOP_APP) {
			requestInfo.headers = { ...requestInfo.headers, 'x-gj-client-version': GJ_VERSION };
		}

		if (!requestInfo.method) {
			requestInfo.method = requestInfo.data ? 'POST' : 'GET';
		}

		return Axios(requestInfo);
	}
}
