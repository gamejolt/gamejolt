import './typings/api.d.ts';
import './typings/environment.d.ts';
import './typings/html.d.ts';
import './typings/router.d.ts';
import './typings/shaka.d.ts';
import './typings/tooltip.d.ts';
import './typings/translate.d.ts';
import './typings/vue-shims.d.ts';
import './typings/webpack.d.ts';

declare global {
	interface Window {
		grecaptcha: ReCaptchaV2.ReCaptcha;
		gapi: any;
		__INITIAL_STATE__?: {
			vuex: any;
			components: any;
		};
	}
}
