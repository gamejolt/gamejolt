<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import {
	FiresideRTCProducer,
	getOwnDesktopAudioVolume,
	getOwnMicAudioVolume,
} from '../../../../../_common/fireside/rtc/producer';

@Options({})
export default class AppVolumeMeter extends Vue {
	@Prop({ type: Object, required: true })
	producer!: FiresideRTCProducer;

	@Prop({ type: String, required: true })
	type!: 'mic' | 'desktop-audio';

	private refreshVolumeInterval: NodeJS.Timer | null = null;
	private volume = 0;

	mounted() {
		this.refreshVolumeInterval = setInterval(() => {
			this.volume =
				this.type === 'mic'
					? getOwnMicAudioVolume(this.producer)
					: getOwnDesktopAudioVolume(this.producer);
		}, 100);
	}

	unmounted() {
		if (this.refreshVolumeInterval) {
			clearInterval(this.refreshVolumeInterval);
		}
	}

	get volumePercent() {
		return 'calc(' + Math.max(0, Math.min(100, this.volume * 100)) + '% + 4px)';
	}
}
</script>

<template>
	<div class="-volume-meter">
		<div class="-full" :style="{ width: volumePercent }" />
	</div>
</template>

<style lang="stylus" scoped>
.-volume-meter
	position: relative
	height: 7px
	background-color: black
	overflow-x: clip

	.-full
		position: absolute
		top: -2px
		left: -2px
		width: 0
		min-width: 5px
		height: calc(100% + 4px)
		change-bg('highlight')
		transition: width 100ms cubic-bezier(0.39, 0.58, 0.57, 1)
		will-change: width
</style>
