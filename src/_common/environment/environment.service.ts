export const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';

interface SsrContext {
	ua: string;
	url: string;
	accept: string;
	meta: any;
	errorCode?: number;
	redirect?: string;
}

class EnvironmentService {
	isSecure = isSecure;

	ssrContext: SsrContext = {
		ua: '',
		url: '',
		accept: '',
		meta: {},
	};

	baseUrlDesktopApp =
		GJ_BUILD_TYPE === 'build'
			? 'chrome-extension://game-jolt-client/package'
			: GJ_BUILD_TYPE === 'serve-build'
			? 'chrome-extension://game-jolt-client/build/desktop'
			: 'chrome-extension://game-jolt-client';

	baseUrl =
		GJ_ENVIRONMENT === 'development'
			? 'https://development.gamejolt.com'
			: 'https://gamejolt.com';

	baseUrlInsecure =
		GJ_ENVIRONMENT === 'development'
			? 'https://development.gamejolt.com'
			: 'http://gamejolt.com';

	wttfBaseUrl =
		GJ_ENVIRONMENT === 'development'
			? 'https://development.gamejolt.com'
			: GJ_IS_DESKTOP_APP
			? `${this.baseUrlDesktopApp}/index.html#`
			: 'https://gamejolt.com';

	authBaseUrl =
		GJ_ENVIRONMENT === 'development'
			? 'https://development.gamejolt.com'
			: GJ_IS_DESKTOP_APP
			? `${this.baseUrlDesktopApp}/auth.html#`
			: 'https://gamejolt.com';

	checkoutBaseUrl =
		GJ_ENVIRONMENT === 'development'
			? 'https://development.gamejolt.com'
			: GJ_IS_DESKTOP_APP
			? `${this.baseUrlDesktopApp}/checkout.html#`
			: 'https://gamejolt.com';

	helpBaseUrl =
		GJ_ENVIRONMENT === 'development'
			? 'https://development.gamejolt.com/help'
			: 'https://gamejolt.com/help';

	helpDocsBaseUrl =
		GJ_ENVIRONMENT === 'development'
			? 'https://development.gamejolt.com/help-docs'
			: 'https://gamejolt.com/help-docs';

	clientSectionUrl = GJ_IS_DESKTOP_APP ? `${this.baseUrlDesktopApp}/client.html#` : '';

	devBaseUrl =
		GJ_ENVIRONMENT === 'development'
			? 'https://dev.development.gamejolt.com'
			: 'http://dev.gamejolt.com';

	gameserverUrl =
		GJ_ENVIRONMENT === 'development'
			? 'https://development.gamejolt.net'
			: (isSecure ? 'https' : 'http') + '://gamejolt.net';

	mediaserverUrl =
		GJ_ENVIRONMENT === 'development'
			? 'https://media.development.gamejolt.com'
			: 'https://m.gjcdn.net';

	staticCdnUrl =
		GJ_ENVIRONMENT === 'development'
			? 'https://development.gamejolt.com'
			: 'https://s.gjcdn.net';

	apiHost =
		GJ_ENVIRONMENT === 'development'
			? 'https://development.gamejolt.com'
			: 'https://gamejolt.com';

	uploadHost = GJ_ENVIRONMENT === 'development' ? this.apiHost : 'https://upload.gamejolt.com';

	gameserverApiHost = GJ_ENVIRONMENT === 'development' ? this.apiHost : 'https://gamejolt.net';

	widgetHost =
		GJ_ENVIRONMENT === 'development'
			? 'https://localhost:8086'
			: 'https://widgets.gamejolt.com';

	grid =
		GJ_ENVIRONMENT === 'development'
			? 'https://grid.development.gamejolt.com/grid'
			: 'https://grid.gamejolt.com/grid';

	recaptchaSiteKey =
		GJ_ENVIRONMENT === 'development'
			? 'https://dev.development.gamejolt.com'
			: '6LcwTkEUAAAAAHTT67TB8gkM0ft5hUzz_r_tFFaT';

	// We have different firebase app for Client.
	firebaseAppId = GJ_IS_DESKTOP_APP
		? '1:1065321331780:web:b58ac57b00c1d538d3d011'
		: '1:1065321331780:web:37c4d21c84f1a69ad3d011';

	firebaseMeasurementId = GJ_IS_DESKTOP_APP ? 'G-PJSN27C1K6' : 'G-ZV3SVDN43D';
}

export const Environment = /** @__PURE__ */ new EnvironmentService();
