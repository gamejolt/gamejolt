export const isClient = GJ_IS_DESKTOP_APP;
export const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';

interface SsrContext {
	ua: string;
	url: string;
	accept: string;
	meta: any;
	errorCode?: number;
	redirect?: string;
}

export class Environment {
	static isClient = GJ_IS_DESKTOP_APP;
	static isSecure = isSecure;

	static ssrContext: SsrContext = {
		ua: '',
		url: '',
		accept: '',
		meta: {},
	};

	// Production defaults.
	static baseUrlInsecure = 'http://gamejolt.com';
	static baseUrl = 'https://gamejolt.com';
	static wttfBaseUrl = 'https://gamejolt.com';
	static authBaseUrl = 'https://gamejolt.com';
	static checkoutBaseUrl = 'https://gamejolt.com';
	static helpBaseUrl = 'https://gamejolt.com/help';
	static clientSectionUrl = '';

	static jamsBaseUrl = 'http://jams.gamejolt.com';
	static jamsIoBaseUrl = 'http://jams.gamejolt.io';
	static firesideBaseUrl = 'http://fireside.gamejolt.com';
	static devBaseUrl = 'http://dev.gamejolt.com';
	static gameserverUrl = (isSecure ? 'https' : 'http') + '://gamejolt.net';
	static mediaserverUrl = 'https://m.gjcdn.net';
	static staticCdnUrl = 'https://s.gjcdn.net';

	static apiHost = 'https://gamejolt.com';
	static uploadHost = 'https://upload.gamejolt.com';
	static gameserverApiHost = 'https://gamejolt.net';
	static activityStreamHost = 'https://activity.gamejolt.com';
	static chat = 'https://chatex.gamejolt.com/chatex';
	static widgetHost = 'https://widgets.gamejolt.com';
	static gridHost = 'https://grid.gamejolt.com/grid/host';
	static recaptchaSiteKey = '6Led_UAUAAAAAB_ptIOOlAF5DFK9YM7Qi_7z8iKk';

	static firebaseAppId = '1:1065321331780:web:37c4d21c84f1a69ad3d011';
	static firebaseMeasurementId = 'G-ZV3SVDN43D';
}

if (GJ_ENVIRONMENT === 'development') {
	Environment.baseUrl = 'https://development.gamejolt.com';
	Environment.baseUrlInsecure = 'https://development.gamejolt.com';
	Environment.wttfBaseUrl = 'https://development.gamejolt.com';
	Environment.authBaseUrl = 'https://development.gamejolt.com';
	Environment.checkoutBaseUrl = 'https://development.gamejolt.com';
	Environment.helpBaseUrl = 'https://development.gamejolt.com/help';

	Environment.jamsBaseUrl = 'https://jams.development.gamejolt.com';
	Environment.jamsIoBaseUrl = 'https://jams.development.gamejolt.io';
	Environment.firesideBaseUrl = 'https://fireside.development.gamejolt.com';
	Environment.devBaseUrl = 'https://dev.development.gamejolt.com';
	Environment.gameserverUrl = 'https://development.gamejolt.net';
	Environment.mediaserverUrl = 'https://media.development.gamejolt.com';
	Environment.staticCdnUrl = 'https://development.gamejolt.com';

	Environment.apiHost = 'https://development.gamejolt.com';
	Environment.uploadHost = Environment.apiHost;
	Environment.gameserverApiHost = 'https://development.gamejolt.com';
	Environment.activityStreamHost = 'https://activity.development.gamejolt.com';
	Environment.chat = 'https://chat.development.gamejolt.com/chatex';
	Environment.widgetHost = 'https://localhost:8086';
	Environment.gridHost = 'https://grid.development.gamejolt.com/grid/host';
	Environment.recaptchaSiteKey = '6LcwTkEUAAAAAHTT67TB8gkM0ft5hUzz_r_tFFaT';
}

if (GJ_IS_DESKTOP_APP) {
	// When it gets packaged up for production, the URL changes.
	const baseUrl =
		GJ_BUILD_TYPE === 'build'
			? 'chrome-extension://game-jolt-client/package'
			: GJ_BUILD_TYPE === 'serve-build'
			? 'chrome-extension://game-jolt-client/build/desktop'
			: 'chrome-extension://game-jolt-client';

	Environment.wttfBaseUrl = `${baseUrl}/index.html#`;
	Environment.authBaseUrl = `${baseUrl}/auth.html#`;
	Environment.checkoutBaseUrl = `${baseUrl}/checkout.html#`;
	Environment.clientSectionUrl = `${baseUrl}/client.html#`;

	// We have different firebase app for Client.
	Environment.firebaseAppId = '1:1065321331780:web:b58ac57b00c1d538d3d011';
	Environment.firebaseMeasurementId = 'G-PJSN27C1K6';
}
