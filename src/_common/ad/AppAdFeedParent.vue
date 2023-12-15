<script lang="ts" setup>
/**
 * This is a tiny component that uses the correct class to indicate to our ad
 * network which container on the page should be used for loading infinite ads
 * through a feed.
 */
defineProps({
	isActive: {
		type: Boolean,
	},
});
</script>

<template>
	<div
		:class="{
			'ad-feed-parent': isActive,
		}"
	>
		<slot />
	</div>
</template>
