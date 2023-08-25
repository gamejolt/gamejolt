import '@vue/runtime-core';
import {
	TranslateInterpolationOptions,
	TranslationContext,
} from '../src/_common/translate/translate.service';

declare module '@vue/runtime-core' {
	interface ComponentCustomProperties {
		$gettext: (
			msgid: string,
			context?: TranslationContext | false,
			options?: TranslateInterpolationOptions
		) => string;
		$ngettext: (
			msgid: string,
			plural: string,
			n: number,
			context?: TranslationContext | false,
			options?: TranslateInterpolationOptions
		) => string;
		$language: {
			current: string;
			addTranslations: (translations: any) => void;
		};
	}
}
