<script lang="ts">
import { Options, Vue } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Store } from '../../../store/index';

@Options({})
export default class AppEmbedHtml extends Vue {
	@State url!: Store['url'];
	@State build!: Store['build'];
	@State embedWidth!: Store['embedWidth'];
	@State embedHeight!: Store['embedHeight'];
}
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
