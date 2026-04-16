<script lang="ts" setup>
import { computed } from 'vue';

import { Environment } from '../environment/environment.service';
import { Navigate } from '../navigate/navigate.service';

type Props = {
	category: string;
	page?: string;
};
const { category, page } = defineProps<Props>();

const url = computed(() => {
	let result = Environment.helpDocsBaseUrl + '/' + category;
	if (page) {
		result += '/' + page;
	}
	return result;
});

function onClick(e: Event) {
	Navigate.newWindow(url.value);
	e.preventDefault();
	e.stopPropagation();
	e.stopImmediatePropagation();
}
</script>

<template>
	<a :href="url" target="_blank" @click.capture="onClick($event)">
		<slot />
	</a>
</template>
