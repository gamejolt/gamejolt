<script lang="ts" setup>
import { computed } from 'vue';
import { Environment } from '../environment/environment.service';
import { Navigate } from '../navigate/navigate.service';

const props = defineProps({
	page: {
		type: String,
		required: true,
	},
});

const url = computed(() => Environment.helpBaseUrl + '/' + props.page);

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
