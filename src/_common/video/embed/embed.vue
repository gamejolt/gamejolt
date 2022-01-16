<script lang="ts">
import { nextTick } from 'vue';
import { Options, Prop, Vue, Watch } from 'vue-property-decorator';
import { Ruler } from '../../ruler/ruler-service';
import { onScreenResize } from '../../screen/screen-service';
import { useEventSubscription } from '../../system/event/event-topic';

const VIDEO_RATIO = 0.5625; // 16:9

@Options({})
export default class AppVideoEmbed extends Vue {
	@Prop(String) videoProvider!: 'youtube' | 'vimeo';
	@Prop(String) videoId!: string;
	@Prop(Number) maxVideoHeight!: number;
	@Prop(Number) maxVideoWidth!: number;
	@Prop({ type: Boolean, default: false }) autoplay!: boolean;

	embedUrl = '';
	width: number | 'auto' = 'auto';
	height: number | 'auto' = 'auto';

	created() {
		useEventSubscription(onScreenResize, () => this.recalculateDimensions());
	}

	mounted() {
		this.recalculateDimensions();
	}

	@Watch('videoId', { immediate: true })
	videoIdChange() {
		if (!this.videoId) {
			return;
		}

		let url: string;
		const queryParams = [];

		if (this.videoProvider === 'youtube') {
			url = 'https://www.youtube.com/embed/' + this.videoId;

			// Youtube forcefully displays recommended videos on their widgets.
			// Using rel=0 makes it at least only show other videos from the same channel.
			// https://developers.google.com/youtube/player_parameters#release_notes_08_23_2018
			queryParams.push('rel=0');
		} else if (this.videoProvider === 'vimeo') {
			url = 'https://player.vimeo.com/video/' + this.videoId;
		} else {
			throw new Error('Invalid video provider.');
		}

		if (this.autoplay) {
			queryParams.push('autoplay=1');
		}

		if (queryParams.length > 0) {
			url += '?' + queryParams.join('&');
		}

		this.embedUrl = url;
	}

	@Watch('maxVideoWidth')
	@Watch('maxVideoHeight')
	async recalculateDimensions() {
		await nextTick();

		this.width = Ruler.width(
			this.$el.getElementsByClassName('video-embed-inner')[0] as HTMLElement
		);

		if (this.maxVideoWidth) {
			this.width = Math.min(this.maxVideoWidth, this.width);
		}

		this.height = this.width * VIDEO_RATIO;

		if (this.maxVideoHeight && this.height > this.maxVideoHeight) {
			this.height = this.maxVideoHeight;
			this.width = this.height / VIDEO_RATIO;
		}
	}
}
</script>

<template>
	<div class="video-embed">
		<div class="video-embed-inner">
			<iframe
				v-if="videoProvider === 'youtube' && embedUrl"
				nwdisable
				nwfaketop
				type="text/html"
				frameborder="0"
				webkitallowfullscreen
				mozallowfullscreen
				allowfullscreen
				:width="width"
				:height="height"
				:src="embedUrl"
			/>

			<iframe
				v-if="videoProvider === 'vimeo' && embedUrl"
				nwdisable
				nwfaketop
				frameborder="0"
				webkitallowfullscreen
				mozallowfullscreen
				allowfullscreen
				:width="width"
				:height="height"
				:src="embedUrl"
			/>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.video-embed
	iframe
		display: block
</style>
