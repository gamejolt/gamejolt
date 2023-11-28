<script lang="ts" setup>
/**
 * Very simple component to signal to the ad code that a feed has been changed
 * and they should look to see if more ads are showing now.
 */
defineProps({
	ping: {
		type: [Number, String],
		required: true,
	},
});
</script>

<template>
	<div id="ad-feed-beacon">
		<div :key="ping" />
	</div>
</template>
