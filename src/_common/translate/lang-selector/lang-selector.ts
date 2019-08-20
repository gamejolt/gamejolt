import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import { Analytics } from '../../analytics/analytics.service';
import { getTranslationLang, TranslationLangs, setTranslationLang } from '../translate.service';
import { stringSort } from '../../../utils/array';
import { Navigate } from '../../navigate/navigate.service';

@Component({})
export default class AppTranslateLangSelector extends Vue {
	lang = getTranslationLang();

	get langs() {
		return TranslationLangs.sort((a, b) => stringSort(a.label, b.label));
	}

	async onChange() {
		await Analytics.trackEvent('translations', 'change', this.lang);

		setTranslationLang(this.lang);

		// We have to refresh the whole browser when language changes so that
		// all the new language strings get picked up.
		Navigate.reload();
	}
}
