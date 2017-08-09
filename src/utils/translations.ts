import Vue from 'vue';
import {
	TranslationLangs,
	getTranslationLang,
} from '../lib/gj-lib-client/components/translate/translate.service';

export function bootstrapAppTranslations() {
	const availableLanguages: any = {};
	for (const _lang of TranslationLangs) {
		availableLanguages[_lang.code] = _lang.label;
	}

	let lang = getTranslationLang();
	let translations = require('!json-loader!../translations/en_US/main.json');

	const VueGettext = require('vue-gettext');
	Vue.use(VueGettext, {
		silent: true,
		availableLanguages,
		defaultLanguage: lang,
		translations,
	});
}
