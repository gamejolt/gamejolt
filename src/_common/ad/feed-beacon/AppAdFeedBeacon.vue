<script lang="ts" setup>
import { useAdStore } from '../ad-store';

/**
 * Very simple component to signal to the ad code that a feed has been changed
 * and they should look to see if more ads are showing now.
 */
const { feedBeaconPing } = useAdStore();
</script>

<template>
	<div id="ad-feed-beacon" :data-ping="feedBeaconPing">
		<div :key="feedBeaconPing" :data-ping="feedBeaconPing" />
	</div>
</template>
