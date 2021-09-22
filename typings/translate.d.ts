import '@vue/runtime-core';

declare module '@vue/runtime-core' {
	interface ComponentCustomProperties {
		$gettext: (msgid: string) => string;
		$ngettext: (msgid: string, plural: string, n: number) => string;
		$gettextInterpolate: (msgid: string, context: any, enableHTMLEscaping = false) => string;
		$language: {
			current: string;
			addTranslations: (translations: any) => void;
		};
	}
}
