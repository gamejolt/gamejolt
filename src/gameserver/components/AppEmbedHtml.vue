<script lang="ts" setup>
import { useGameserverStore } from '../store/index';

const { url, embedWidth, embedHeight } = useGameserverStore();
</script>

<template>
	<iframe
		type="text/html"
		style="overflow: none"
		:width="embedWidth"
		:height="embedHeight"
		:src="url"
		frameborder="0"
		scrolling="no"
		allowfullscreen
		allow="autoplay; fullscreen *; geolocation; microphone; camera; midi; monetization; xr-spatial-tracking; gamepad; gyroscope; magnetometer; accelerometer; picture-in-picture"
	/>
</template>
