<script lang="ts">
import { Options, Vue } from 'vue-property-decorator';
import { stringSort } from '../../../utils/array';
import { Analytics } from '../../analytics/analytics.service';
import { Navigate } from '../../navigate/navigate.service';
import { getTranslationLang, setTranslationLang, TranslationLangs } from '../translate.service';

@Options({})
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
</script>

<template>
	<select v-model="lang" class="translate-lang-selector form-control" @change="onChange">
		<option v-for="langData of langs" :key="langData.code" :value="langData.code">
			{{ langData.label }}
		</option>
	</select>
</template>

<style lang="stylus" scoped>
.translate-lang-selector
	theme-prop('color', 'light')
	theme-prop('border-color', 'light')
	margin: $line-height-computed auto
	width: auto
	background-color: transparent

	&:focus
	&:active
		border-color: $white

	@media $media-sm-up
		display: inline-block
		margin: 0
</style>
