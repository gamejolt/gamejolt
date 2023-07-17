import { App, computed, ref } from 'vue';
import { arrayIndexBy } from '../../utils/array';
import { isGoogleBot } from '../device/device.service';
import AppTranslate from './AppTranslate.vue';
import { TranslateDirective } from './translate-directive';

type LazyLanguageImport = () => Promise<{
	[key: string]: any;
}>;

const _translationImports: Record<string, LazyLanguageImport> =
	import.meta.env.SSR || GJ_IS_MOBILE_APP || isGoogleBot()
		? {}
		: import.meta.glob('../../translations/*/main.json');

const LangStorageKey = 'lang';
const InterpolationRegex = /%\{((?:.|\n)+?)\}/g;
const EscapeHTMLMap = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#039;',
};

const _language = ref('en_US');

// Plural forms are in an array indexed by the plural form index (number).
type Translation = string | string[];

// Each language is a record indexed by the "msgid" with the value being the
// translations for the language.
type LanguageTranslations = Record<string, Translation>;

/**
 * Indexed by language code and then the key's representing the "msgid".
 *
 * { en_US: {key1: 'translated1', key2: ['translated single', 'translated plural'] } }
 */
const _translations = ref<Record<string, LanguageTranslations>>({});

// easygettext's gettext-compile generates a JSON version of a .po file based on
// its Language field. But in this field, 'll_CC' combinations denoting a
// language’s main dialect are abbreviated as 'll', for example 'de' is
// equivalent to 'de_DE' (German as spoken in Germany). See the 'Language'
// section in
// https://www.gnu.org/software/gettext/manual/html_node/Header-Entry.html So
// try 'll_CC' first, or the 'll' abbreviation which can be three-letter
// sometimes:
// https://www.gnu.org/software/gettext/manual/html_node/Language-Codes.html#Language-Codes
const _currentTranslations = computed(
	() => _translations.value[_language.value] ?? _translations.value[_language.value.split('_')[0]]
);

let _translationsReady: Promise<void> = new Promise(() => {});

export function initTranslations(app: App) {
	// Initialize our starting values. [loadCurrentLanguage] should be called
	// once the app is mounted to switch to their real language.
	_language.value = (!import.meta.env.SSR && localStorage.getItem(LangStorageKey)) || 'en_US';
	_translations.value = {
		// Specifically for en_US we don't want to do translations.
		// We use the english translations as the translation keys, so
		// we can reliably fall back to just using the key for english.
		en_US: {},
	};
	loadCurrentLanguage();

	// Convenience to make it easier to translate in templates.
	app.config.globalProperties.$gettext = $gettext;
	app.config.globalProperties.$ngettext = $ngettext;
	app.config.globalProperties.$gettextInterpolate = $gettextInterpolate;

	// Add into the global app for convenience of usage.
	app.component('AppTranslate', AppTranslate);
	app.directive('Translate', TranslateDirective);
}

/**
 * We lazy load the current language's translations in so that the page doesn't
 * have to wait for the translations to load before showing anything.
 */
export async function loadCurrentLanguage() {
	if (import.meta.env.SSR || _language.value === 'en_US') {
		_translationsReady = Promise.resolve();
		return;
	}

	_translationsReady = (async () => {
		// Save the language to a variable first to avoid populating
		// the wrong language if the current language changes while importing.
		const lang = _language.value;
		const { default: translationData } = await _translationImports[
			`../../translations/${lang}/main.json`
		]();

		const newTranslations = translationData[lang];
		if (newTranslations) {
			_translations.value[lang] = newTranslations;
		}
	})();
}

export async function translationsReady() {
	return _translationsReady;
}

export function getTranslationLang() {
	return _language.value;
}

export function setTranslationLang(lang: string) {
	_language.value = lang;
	localStorage?.setItem(LangStorageKey, lang);
}

export const TranslationLangs = [
	{
		code: 'en_US',
		label: 'English',
	},
	{
		// Dutch
		code: 'nl',
		label: 'Nederlands',
	},
	{
		// Romanian
		code: 'ro',
		label: 'Română',
	},
	{
		// German
		code: 'de',
		label: 'Deutsch',
	},
	{
		// Spanish
		code: 'es',
		label: 'Español',
	},
	{
		// Spanish (Argentina)
		code: 'es_AR',
		label: 'Español (Argentina)',
	},
	{
		// Spanish (LA&C)
		code: 'es_419',
		label: 'Español (America Latina)',
	},
	{
		// Spanish (Columbia)
		code: 'es_CO',
		label: 'Español (Colombia)',
	},
	{
		// Spanish (Mexico)
		code: 'es_MX',
		label: 'Español (México)',
	},
	{
		// French
		code: 'fr',
		label: 'Français',
	},
	{
		// Russian
		code: 'ru',
		label: 'Русский',
	},
	{
		// Swedish
		code: 'sv',
		label: 'Svenska',
	},
	{
		// Turkish
		code: 'tr',
		label: 'Türkçe',
	},
	{
		// Portuguese
		code: 'pt',
		label: 'Português (Portugal)',
	},
	{
		// Portuguese (Brazil)
		code: 'pt_BR',
		label: 'Português (Brasil)',
	},
	{
		// Finnish
		code: 'fi',
		label: 'Suomi',
	},
	{
		// Norwegian
		code: 'nb',
		label: 'Norsk (bokmål)',
	},
	{
		// Greek
		code: 'el',
		label: 'Ελληνικά',
	},
	{
		// Malay
		code: 'ms',
		label: 'Bahasa Melayu',
	},
	{
		// Polish
		code: 'pl',
		label: 'Polski',
	},
	{
		// Ukranian
		code: 'uk',
		label: 'Українська',
	},
	{
		// Italian
		code: 'it',
		label: 'Italiano',
	},
	{
		// Traditional Chinese (Taiwan)
		code: 'zh_TW',
		label: '中文(台灣)',
	},
	{
		// Croation
		code: 'hr',
		label: 'Hrvatski',
	},
	{
		// Indonesian
		code: 'id',
		label: 'Bahasa Indonesia',
	},
	{
		// Czech
		code: 'cs',
		label: 'Čeština',
	},
	{
		// Bulgarian
		code: 'bg',
		label: 'Български',
	},
];

export const TranslationLangsByCode = arrayIndexBy(TranslationLangs, 'code');

/**
 * Returns the translated string.
 */
export function $gettext(msgid: string) {
	return getTranslation(msgid);
}

/**
 * Replaces placeholders with values in a translated string.
 * Example: 'Hi %{ name }' => 'Hi David'
 */
export function $gettextInterpolate(
	msgid: string,
	context: Record<string, string | number>,
	enableHTMLEscaping = false
) {
	return msgid.replace(InterpolationRegex, (_match, token) => {
		const key = token.trim();

		// This is for safety so that even if it's null or undefined we don't
		// break.
		const evaluated = (context[key] || '').toString();

		return enableHTMLEscaping
			? evaluated.replace(/[&<>"']/g, (i: keyof typeof EscapeHTMLMap) => EscapeHTMLMap[i])
			: evaluated;
	});
}

/**
 * Returns a translated string of either the singular or plural, based on the
 * number given.
 */
export function $ngettext(msgid: string, plural: string, n: number) {
	return getTranslation(msgid, n, plural);
}

export function getTranslation(msgid: string, n = 1, defaultPlural: string | null = null): string {
	// Allow empty strings.
	if (!msgid) {
		return '';
	}

	function _untranslatedDefault() {
		// Returns the untranslated string, singular or plural.
		return defaultPlural && _getTranslationIndex(_language.value, n) > 0
			? defaultPlural
			: msgid;
	}

	// No translations for the language yet.
	if (!_currentTranslations.value) {
		return _untranslatedDefault();
	}

	let translated = _currentTranslations.value[msgid];

	// TODO: there has to be a more efficient way than this.
	if (!translated && /\s{2,}/g.test(msgid)) {
		Object.keys(_currentTranslations.value).some(key => {
			if (key.replace(/\s{2,}/g, ' ') === msgid.trim().replace(/\s{2,}/g, ' ')) {
				translated = _currentTranslations.value[key];
				return !!translated;
			}
		});
	}

	if (!translated) {
		return _untranslatedDefault();
	}

	if (typeof translated === 'string') {
		translated = [translated];
	}

	return translated[_getTranslationIndex(_language.value, n)] ?? '';
}

function _getTranslationIndex(languageCode: string, n: number | string) {
	if (typeof n === 'string') {
		n = parseInt(n);
	}

	// Fallback to singular.
	n = typeof n === 'number' && isNaN(n) ? 1 : n;

	// Extract the ISO 639 language code. The ISO 639 standard defines
	// two-letter codes for many languages, and three-letter codes for more
	// rarely used languages.
	// https://www.gnu.org/software/gettext/manual/html_node/Language-Codes.html#Language-Codes
	if (languageCode.length > 2 && languageCode !== 'pt_BR') {
		languageCode = languageCode.split('_')[0];
	}

	switch (languageCode) {
		case 'ay': // Aymará
		case 'bo': // Tibetan
		case 'cgg': // Chiga
		case 'dz': // Dzongkha
		case 'fa': // Persian
		case 'id': // Indonesian
		case 'ja': // Japanese
		case 'jbo': // Lojban
		case 'ka': // Georgian
		case 'kk': // Kazakh
		case 'km': // Khmer
		case 'ko': // Korean
		case 'ky': // Kyrgyz
		case 'lo': // Lao
		case 'ms': // Malay
		case 'my': // Burmese
		case 'sah': // Yakut
		case 'su': // Sundanese
		case 'th': // Thai
		case 'tt': // Tatar
		case 'ug': // Uyghur
		case 'vi': // Vietnamese
		case 'wo': // Wolof
		case 'zh': // Chinese (apparently also has 2 forms, but we're using this one)
			// 1 form
			return 0;
		case 'is': // Icelandic
			// 2 forms
			return n % 10 !== 1 || n % 100 === 11 ? 1 : 0;
		case 'jv': // Javanese
			// 2 forms
			return n !== 0 ? 1 : 0;
		case 'mk': // Macedonian
			// 2 forms
			return n === 1 || n % 10 === 1 ? 0 : 1;
		case 'ach': // Acholi
		case 'ak': // Akan
		case 'am': // Amharic
		case 'arn': // Mapudungun
		case 'br': // Breton
		case 'fil': // Filipino
		case 'fr': // French
		case 'gun': // Gun
		case 'ln': // Lingala
		case 'mfe': // Mauritian Creole
		case 'mg': // Malagasy
		case 'mi': // Maori
		case 'oc': // Occitan
		case 'pt_BR': // Brazilian Portuguese
		case 'tg': // Tajik
		case 'ti': // Tigrinya
		case 'tr': // Turkish
		case 'uz': // Uzbek
		case 'wa': // Walloon
			// 2 forms
			return n > 1 ? 1 : 0;
		case 'lv': // Latvian
			// 3 forms
			return n % 10 === 1 && n % 100 !== 11 ? 0 : n !== 0 ? 1 : 2;
		case 'lt': // Lithuanian
			// 3 forms
			return n % 10 === 1 && n % 100 !== 11
				? 0
				: n % 10 >= 2 && (n % 100 < 10 || n % 100 >= 20)
				? 1
				: 2;
		case 'be': // Belarusian
		case 'bs': // Bosnian
		case 'hr': // Croatian
		case 'ru': // Russian
		case 'sr': // Serbian
		case 'uk': // Ukrainian
			// 3 forms
			return n % 10 === 1 && n % 100 !== 11
				? 0
				: n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)
				? 1
				: 2;
		case 'mnk': // Mandinka
			// 3 forms
			return n === 0 ? 0 : n === 1 ? 1 : 2;
		case 'ro': // Romanian
			// 3 forms
			return n === 1 ? 0 : n === 0 || (n % 100 > 0 && n % 100 < 20) ? 1 : 2;
		case 'pl': // Polish
			// 3 forms
			return n === 1
				? 0
				: n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)
				? 1
				: 2;
		case 'cs': // Czech
		case 'sk': // Slovak
			// 3 forms
			return n === 1 ? 0 : n >= 2 && n <= 4 ? 1 : 2;
		case 'csb': // Kashubian
			// 3 forms
			return n === 1
				? 0
				: n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)
				? 1
				: 2;
		case 'sl': // Slovenian
			// 4 forms
			return n % 100 === 1 ? 0 : n % 100 === 2 ? 1 : n % 100 === 3 || n % 100 === 4 ? 2 : 3;
		case 'mt': // Maltese
			// 4 forms
			return n === 1
				? 0
				: n === 0 || (n % 100 > 1 && n % 100 < 11)
				? 1
				: n % 100 > 10 && n % 100 < 20
				? 2
				: 3;
		case 'gd': // Scottish Gaelic
			// 4 forms
			return n === 1 || n === 11 ? 0 : n === 2 || n === 12 ? 1 : n > 2 && n < 20 ? 2 : 3;
		case 'cy': // Welsh
			// 4 forms
			return n === 1 ? 0 : n === 2 ? 1 : n !== 8 && n !== 11 ? 2 : 3;
		case 'kw': // Cornish
			// 4 forms
			return n === 1 ? 0 : n === 2 ? 1 : n === 3 ? 2 : 3;
		case 'ga': // Irish
			// 5 forms
			return n === 1 ? 0 : n === 2 ? 1 : n > 2 && n < 7 ? 2 : n > 6 && n < 11 ? 3 : 4;
		case 'ar': // Arabic
			// 6 forms
			return n === 0
				? 0
				: n === 1
				? 1
				: n === 2
				? 2
				: n % 100 >= 3 && n % 100 <= 10
				? 3
				: n % 100 >= 11
				? 4
				: 5;
		default:
			// Everything else
			return n !== 1 ? 1 : 0;
	}
}

// For backwards compatibility.
export class Translate {
	/** @deprecated Use the imported version instead */
	static $gettext(msgid: string) {
		return $gettext(msgid);
	}

	/** @deprecated Use the imported version instead */
	static $gettextInterpolate(
		msgid: string,
		context: Record<string, string | number>,
		enableHTMLEscaping = false
	) {
		return $gettextInterpolate(msgid, context, enableHTMLEscaping);
	}
}
