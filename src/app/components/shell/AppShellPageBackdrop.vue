<script lang="ts" setup>
import AppStyle from '../../../_common/AppStyle.vue';

/**
 * This component will at least fill the full height of the viewport. We mostly
 * use it for pages where there's a backdrop color so that it doesn't look weird
 * when the page it's fully taken up.
 *
 * While this component is in the view, it will overwrite the global shell
 * styling to change the background to the bg-backdrop color. When this
 * component leaves it will remove the style rules so that it goes back to
 * normal.
 */

// Sync this with change-bg()
const styles = `
html, body, #content {
	--theme-bg-actual: var(--theme-bg-backdrop);
	--theme-bg-actual-trans: var(--theme-bg-backdrop-trans);
	background-color: var(--theme-bg-backdrop) !important;
}
`;
</script>

<template>
	<div class="fill-backdrop">
		<AppStyle :content="styles" />
		<slot />
	</div>
</template>
