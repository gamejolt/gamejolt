import { defineIsolatedState } from '~common/ssr/isolated-state';

export const getSsrContext = defineIsolatedState(() => ({
	ua: '',
	url: '',
	accept: '',
	meta: {} as any,
	errorCode: undefined as number | undefined,
	redirect: undefined as string | undefined,
}));

export const BaseUrlDesktopApp =
	GJ_BUILD_TYPE === 'build'
		? 'chrome-extension://game-jolt-client/package'
		: GJ_BUILD_TYPE === 'serve-build'
			? 'chrome-extension://game-jolt-client/build/desktop'
			: 'chrome-extension://game-jolt-client';

export const IsSecureEnvironment =
	typeof window !== 'undefined' && window.location.protocol === 'https:';

export const BaseUrl =
	GJ_ENVIRONMENT === 'development' ? 'https://development.gamejolt.com' : 'https://gamejolt.com';

export const BaseUrlInsecure =
	GJ_ENVIRONMENT === 'development' ? 'https://development.gamejolt.com' : 'http://gamejolt.com';

export const WttfBaseUrl =
	GJ_ENVIRONMENT === 'development'
		? 'https://development.gamejolt.com'
		: GJ_IS_DESKTOP_APP
			? `${BaseUrlDesktopApp}/index.html#`
			: 'https://gamejolt.com';

export const AuthBaseUrl =
	GJ_ENVIRONMENT === 'development'
		? 'https://development.gamejolt.com'
		: GJ_IS_DESKTOP_APP
			? `${BaseUrlDesktopApp}/auth.html#`
			: 'https://gamejolt.com';

export const CheckoutBaseUrl =
	GJ_ENVIRONMENT === 'development'
		? 'https://development.gamejolt.com'
		: GJ_IS_DESKTOP_APP
			? `${BaseUrlDesktopApp}/checkout.html#`
			: 'https://gamejolt.com';

export const HelpBaseUrl =
	GJ_ENVIRONMENT === 'development'
		? 'https://development.gamejolt.com/help'
		: 'https://gamejolt.com/help';

export const HelpDocsBaseUrl =
	GJ_ENVIRONMENT === 'development'
		? 'https://development.gamejolt.com/help-docs'
		: 'https://gamejolt.com/help-docs';

export const ClientSectionUrl = GJ_IS_DESKTOP_APP ? `${BaseUrlDesktopApp}/client.html#` : '';

export const DevBaseUrl =
	GJ_ENVIRONMENT === 'development'
		? 'https://dev.development.gamejolt.com'
		: 'http://dev.gamejolt.com';

export const GameserverUrl =
	GJ_ENVIRONMENT === 'development'
		? 'https://development.gamejolt.net'
		: (IsSecureEnvironment ? 'https' : 'http') + '://gamejolt.net';

export const MediaserverUrl =
	GJ_ENVIRONMENT === 'development'
		? 'https://media.development.gamejolt.com'
		: 'https://m.gjcdn.net';

export const StaticCdnUrl =
	GJ_ENVIRONMENT === 'development' ? 'https://development.gamejolt.com' : 'https://s.gjcdn.net';

export const ApiHost =
	GJ_ENVIRONMENT === 'development' ? 'https://development.gamejolt.com' : 'https://gamejolt.com';

export const UploadHost =
	GJ_ENVIRONMENT === 'development' ? ApiHost : 'https://upload.gamejolt.com';

export const GameserverApiHost =
	GJ_ENVIRONMENT === 'development' ? ApiHost : 'https://gamejolt.net';

export const WidgetHost =
	GJ_ENVIRONMENT === 'development' ? 'https://localhost:8086' : 'https://widgets.gamejolt.com';

export const GridHost =
	GJ_ENVIRONMENT === 'development'
		? 'https://grid.development.gamejolt.com/grid'
		: 'https://grid.gamejolt.com/grid';

export const RecaptchaSiteKey =
	GJ_ENVIRONMENT === 'development'
		? '6LcwTkEUAAAAAHTT67TB8gkM0ft5hUzz_r_tFFaT'
		: '6Led_UAUAAAAAB_ptIOOlAF5DFK9YM7Qi_7z8iKk';

// We have different firebase app for Client.
export const FirebaseAppId = GJ_IS_DESKTOP_APP
	? '1:1065321331780:web:b58ac57b00c1d538d3d011'
	: '1:1065321331780:web:37c4d21c84f1a69ad3d011';

export const FirebaseMeasurementId = GJ_IS_DESKTOP_APP ? 'G-PJSN27C1K6' : 'G-ZV3SVDN43D';
