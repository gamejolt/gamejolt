import '@vue/runtime-core';

declare module '@vue/runtime-dom' {
	interface InputHTMLAttributes extends HTMLAttributes {
		nwdirectory: boolean;
	}

	interface IframeHTMLAttributes extends HTMLAttributes {
		nwdisable: boolean;
		nwfaketop: boolean;
	}
}
