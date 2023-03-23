<script lang="ts" setup>
import { computed, toRefs } from 'vue';
import { Environment } from '../environment/environment.service';
import { Navigate } from '../navigate/navigate.service';
import AppLinkHelpDocs from './AppLinkHelpDocs.vue';

/**
 * This component is older, and is used to handle redirects to the real
 * help-docs.
 *
 * Use {@link AppLinkHelpDocs} when going directly to a category/page.
 */
const props = defineProps({
	page: {
		type: String,
		required: true,
	},
});

const { page } = toRefs(props);

const url = computed(() => Environment.helpBaseUrl + '/' + page.value);

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
