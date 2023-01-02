import '@vue/runtime-core';

declare module '@vue/runtime-core' {
	interface ComponentCustomProperties {
		$gettext: (msgid: string) => string;
		$ngettext: (msgid: string, plural: string, n: number) => string;
		$gettextInterpolate: (
			msgid: string,
			context: Record<string, string | number>,
			enableHTMLEscaping?: boolean
		) => string;
		$language: {
			current: string;
			addTranslations: (translations: any) => void;
		};
	}
}
