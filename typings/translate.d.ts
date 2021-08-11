declare module '@vue/runtime-core' {
	interface ComponentCustomProperties {
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
