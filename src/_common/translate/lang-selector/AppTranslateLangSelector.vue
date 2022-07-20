<script lang="ts" setup>
import { computed, ref } from 'vue';
import { stringSort } from '../../../utils/array';
import { Navigate } from '../../navigate/navigate.service';
import { getTranslationLang, setTranslationLang, TranslationLangs } from '../translate.service';

const lang = ref(getTranslationLang());
const langs = computed(() => TranslationLangs.sort((a, b) => stringSort(a.label, b.label)));

async function onChange() {
	setTranslationLang(lang.value);

	// We have to refresh the whole browser when language changes so that
	// all the new language strings get picked up.
	Navigate.reload();
}
</script>

<template>
	<select v-model="lang" class="form-control" @change="onChange">
		<option v-for="langData of langs" :key="langData.code" :value="langData.code">
			{{ langData.label }}
		</option>
	</select>
</template>
