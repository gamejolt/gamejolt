/// <reference path="./src/lib/gj-lib-client/typings/webpack.d.ts" />
/// <reference path="./src/lib/gj-lib-client/typings/environment.d.ts" />
/// <reference path="./src/lib/gj-lib-client/typings/html.d.ts" />
/// <reference path="./src/lib/gj-lib-client/typings/vue.d.ts" />
/// <reference path="./src/lib/gj-lib-client/typings/vue/tooltip.d.ts" />
/// <reference path="./src/lib/gj-lib-client/typings/api.d.ts" />
/// <reference path="./src/lib/gj-lib-client/typings/simplebar.d.ts" />

interface Window {
	_gjStartTime: number;
	Stripe: StripeStatic;
	grecaptcha: ReCaptchaV2.ReCaptcha;
	shaka: any;
	muxjs: any;
	gapi: any;
	__INITIAL_STATE__?: {
		vuex: any;
		components: any;
	};
}
