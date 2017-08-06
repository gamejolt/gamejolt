import Vue from 'vue';
import Axios from 'axios';
import {
	TranslationLangs,
	getTranslationLang,
} from '../lib/gj-lib-client/components/translate/translate.service';

const VueGettext = require('vue-gettext');

export async function bootstrapAppTranslations() {
	const availableLanguages: any = {};
	for (const _lang of TranslationLangs) {
		availableLanguages[_lang.code] = _lang.label;
	}

	let lang = getTranslationLang();

	let translations: any = {};
	if (GJ_IS_SSR) {
		translations = await import('!json-loader!../translations/en_US/main.json');
	} else {
		translations = require('!json-loader!../translations/en_US/main.json');
		// // Don't use webpack to require directly. If we did it would generate new
		// // files for each section that we built for.
		// const response = await Axios({
		// 	url: require('!file-loader!../translations/' + lang + '/main.json'),
		// 	ignoreLoadingBar: true,
		// });
		// translations = response.data;
	}

	Vue.use(VueGettext, {
		silent: true,
		availableLanguages,
		defaultLanguage: lang,
		translations,
	});
}
