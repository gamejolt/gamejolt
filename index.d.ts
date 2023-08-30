/// <reference types="vite/client" />

import { HTMLAttributes } from 'vue';
import './typings/environment-vue.d.ts';
import './typings/environment.d.ts';
import './typings/html.d.ts';
import './typings/markdown.d.ts';
import './typings/nwjs.d.ts';
import './typings/router.d.ts';
import './typings/shaka.d.ts';
import './typings/translate.d.ts';

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

declare module '@vue/runtime-core' {
	// eslint-disable-next-line @typescript-eslint/no-empty-interface
	interface ComponentCustomProps extends HTMLAttributes {}
}
