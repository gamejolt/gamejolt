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

declare module 'vue' {
	interface ComponentCustomProps {
		id?: HTMLAttributes['id'];
		title?: HTMLAttributes['title'];
		draggable?: HTMLAttributes['draggable'];
		tabindex?: HTMLAttributes['tabindex'];
		placeholder?: HTMLAttributes['placeholder'];
		onDragstart?: HTMLAttributes['onDragstart'];
	}

	// Allow custom CSS properties.
	interface CSSProperties {
		[key: `--${string}`]: string;
	}

	interface GlobalComponents {
		pubguru: HTMLElement;
	}
}
