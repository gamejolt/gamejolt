import Vue from 'vue';

declare module 'vue/types/vue' {
	interface Vue {
		$gettext: (msgid: string) => string;
		$pgettext: (context: string, msgid: string) => string;
		$ngettext: (msgid: string, plural: string, n: number) => string;
		$npgettext: (context: string, msgid: string, plural: string, n: number) => string;
		$gettextInterpolate: (msgid: string, context: any, enableHTMLEscaping = false) => string;
		$language: {
			current: string;
			addTranslations: (translations: any) => void;
		};
	}
}
