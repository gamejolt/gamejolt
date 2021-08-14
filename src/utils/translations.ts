import { App, Component } from 'vue';
import { getTranslationLang, TranslationLangs } from '../_common/translate/translate.service';

export function bootstrapAppTranslations(app: App) {
	const availableLanguages: any = {};
	for (const _lang of TranslationLangs) {
		availableLanguages[_lang.code] = _lang.label;
	}

	const lang = getTranslationLang();
	const translations = require('../translations/en_US/main.json');

	// const VueGettext = require('vue-gettext');
	// app.use(VueGettext, {
	// 	silent: true,
	// 	availableLanguages,
	// 	defaultLanguage: lang,
	// 	translations,
	// });
}

export async function loadCurrentLanguage(comp: Component) {
	// // This is always loaded.
	// if (comp.$language.current === 'en_US') {
	// 	return;
	// }
	// // Don't use webpack to require directly. If we did it would generate
	// // new files for each section that we built for.
	// const response = await Axios({
	// 	url: require('../translations/' + comp.$language.current + '/main.json?file'),
	// 	ignoreLoadingBar: true,
	// });
	// comp.$language.addTranslations(response.data);
}
