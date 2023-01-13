<script lang="ts" setup>
import { ref } from '@vue/reactivity';
import { useRouter } from 'vue-router';
import { $gettext } from '../../../_common/translate/translate.service';

const props = defineProps({
	query: {
		type: String,
		default: '',
	},
});

const value = ref<string>(props.query);
const router = useRouter();

function onKeyDown(e: KeyboardEvent) {
	value.value = (e.target as HTMLInputElement).value;
	if (e.key === 'Enter' && value.value) {
		go();
	}
}

function go() {
	router.push({
		name: 'landing.help.search',
		query: {
			q: value.value,
		},
	});
}
</script>

<template>
	<input
		type="search"
		class="search-input form-control"
		:placeholder="$gettext(`Search`)"
		:value="value"
		@keydown="onKeyDown"
	/>
</template>
