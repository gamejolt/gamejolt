import Vue from 'vue';
import { arrayIndexBy } from '../../utils/array';

const LangStorageKey = 'lang';
const translator = new Vue();

export function getTranslationLang() {
	return (typeof localStorage !== 'undefined' && localStorage.getItem(LangStorageKey)) || 'en_US';
}

export function setTranslationLang(lang: string) {
	localStorage.setItem(LangStorageKey, lang);
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

export class Translate {
	static $gettext(msgid: string) {
		return translator.$gettext(msgid);
	}

	static $gettextInterpolate(msgid: string, context: any) {
		return translator.$gettextInterpolate(msgid, context);
	}
}
