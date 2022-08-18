/// <reference types="vite/client" />

import './typings/environment-vue.d.ts';
import './typings/environment.d.ts';
import './typings/html.d.ts';
import './typings/markdown.d.ts';
import './typings/router.d.ts';
import './typings/shaka.d.ts';
import './typings/translate.d.ts';
import './typings/nwjs.d.ts';

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
