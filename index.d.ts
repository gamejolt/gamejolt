/// <reference path="./typings/webpack.d.ts" />
/// <reference path="./typings/environment.d.ts" />
/// <reference path="./typings/html.d.ts" />
/// <reference path="./typings/vue-shims.d.ts" />
/// <reference path="./typings/translate.d.ts" />
/// <reference path="./typings/router.d.ts" />
/// <reference path="./typings/tooltip.d.ts" />
/// <reference path="./typings/api.d.ts" />
/// <reference path="./typings/simplebar.d.ts" />

interface Window {
	_gjStartTime: number;
	grecaptcha: ReCaptchaV2.ReCaptcha;
	gapi: any;
	__INITIAL_STATE__?: {
		vuex: any;
		components: any;
	};
}
