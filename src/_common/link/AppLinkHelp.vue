<script lang="ts" setup>
import { computed } from 'vue';

import { HelpBaseUrl } from '~common/environment/environment.service';
import AppLinkHelpDocs from '~common/link/AppLinkHelpDocs.vue';
import { Navigate } from '~common/navigate/navigate.service';

/**
 * This component is older, and is used to handle redirects to the real
 * help-docs.
 *
 * Use {@link AppLinkHelpDocs} when going directly to a category/page.
 */
type Props = {
	page: string;
};
const { page } = defineProps<Props>();

const url = computed(() => HelpBaseUrl + '/' + page);

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
