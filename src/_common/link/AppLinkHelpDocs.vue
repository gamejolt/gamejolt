<script lang="ts" setup>
import { computed, toRefs } from 'vue';
import { Environment } from '../environment/environment.service';
import { Navigate } from '../navigate/navigate.service';

const props = defineProps({
	category: {
		type: String,
		required: true,
	},
	page: {
		type: String,
		default: undefined,
	},
});

const { category, page } = toRefs(props);

const url = computed(() => {
	let result = Environment.helpDocsBaseUrl + '/' + category.value;
	if (page?.value) {
		result += '/' + page.value;
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
