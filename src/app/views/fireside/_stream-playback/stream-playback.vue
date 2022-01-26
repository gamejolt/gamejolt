<script lang="ts">
import { Options, Vue } from 'vue-property-decorator';
import { shallowSetup } from '../../../../utils/vue';
import { useFiresideController } from '../../../components/fireside/controller/controller';

@Options({})
export default class AppFiresideStreamPlayback extends Vue {
	c = shallowSetup(() => useFiresideController()!);

	get videoPaused() {
		return this.rtc?.videoPaused === true;
	}

	get rtc() {
		return this.c.rtc.value;
	}

	togglePlayback() {
		if (!this.rtc) {
			return;
		}

		if (this.videoPaused) {
			this.pauseVideo();
		} else {
			this.unpauseVideo();
		}
	}

	private pauseVideo() {
		this.rtc!.videoPaused = false;
	}

	private unpauseVideo() {
		this.rtc!.videoPaused = true;
	}
}
</script>

<template>
	<div class="-options-wrap" @click.capture.stop="togglePlayback">
		<div class="-options">
			<AppJolticon class="-icon" :icon="videoPaused ? 'play' : 'pause'" />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '../common'
</style>
