<script lang="ts" setup>
import { computed } from 'vue';

import { HelpDocsBaseUrl } from '~common/environment/environment.service';
import { Navigate } from '~common/navigate/navigate.service';

type Props = {
	category: string;
	page?: string;
};
const { category, page } = defineProps<Props>();

const url = computed(() => {
	let result = HelpDocsBaseUrl + '/' + category;
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
