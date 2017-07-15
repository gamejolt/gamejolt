import Vue from 'vue';
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

	const promises = [];
	promises.push(
		import(/* webpackChunkName: "translations" */
		'!!../translations/' + lang + '/main.json')
	);
	promises.push(
		import(/* webpackChunkName: "translations" */
		'!!../translations/' + lang + '/dash.json')
	);
	promises.push(
		import(/* webpackChunkName: "translations" */
		'!!../translations/' + lang + '/claim.json')
	);
	promises.push(
		import(/* webpackChunkName: "translations" */
		'!!../translations/' + lang + '/checkout.json')
	);
	promises.push(
		import(/* webpackChunkName: "translations" */
		'!!../translations/' + lang + '/auth.json')
	);

	const allResolved = await Promise.all(promises);

	let translations: any = {};
	for (const resolved of allResolved) {
		Object.assign(translations, resolved[lang]);
	}

	Vue.use(VueGettext, {
		silent: true,
		availableLanguages,
		defaultLanguage: lang,
		translations: {
			[lang]: translations,
		},
	});
}
