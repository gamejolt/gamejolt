<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import AppPopper from '../../../popper/AppPopper.vue';
import { Screen } from '../../../screen/screen-service';
import {
	SettingVideoPlayerFeedMuted,
	SettingVideoPlayerMuted,
} from '../../../settings/settings.service';
import AppSlider, { ScrubberCallback } from '../../../slider/AppSlider.vue';
import { vAppTooltip } from '../../../tooltip/tooltip-directive';
import {
	scrubVideoVolume,
	setVideoMuted,
	trackVideoPlayerEvent,
	VideoPlayerController,
} from '../controller';

@Options({
	components: {
		AppPopper,
		AppSlider,
	},
	directives: {
		AppTooltip: vAppTooltip,
	},
})
export default class AppPlayerVolume extends Vue {
	@Prop({ type: Object, required: true }) player!: VideoPlayerController;
	@Prop({ type: Boolean, default: false }) hasSlider!: boolean;

	readonly Screen = Screen;

	get isMuted() {
		if (this.player.altControlsBehavior) {
			return this.player.muted;
		} else {
			return this.player.volume === 0;
		}
	}

	onClickMute() {
		let currentState = true;
		if (this.player.context == 'feed') {
			currentState = SettingVideoPlayerFeedMuted.get();
		} else if (this.player.context == 'page') {
			currentState = SettingVideoPlayerMuted.get();
		}

		setVideoMuted(this.player, !currentState);
		trackVideoPlayerEvent(
			this.player,
			!this.player.volume || this.player.muted ? 'mute' : 'unmute',
			'click-control'
		);
	}

	onVolumeScrub({ percent, stage }: ScrubberCallback) {
		scrubVideoVolume(this.player, percent, stage);
	}
}
</script>

<template>
	<div class="-container">
		<div class="player-control-button" @click="onClickMute">
			<AppJolticon :icon="isMuted ? 'audio-mute' : 'audio'" />
		</div>

		<AppSlider
			v-if="!Screen.isMobile && hasSlider"
			class="-slider"
			:percent="player.volume"
			overlay
			@scrub="onVolumeScrub"
		/>
	</div>
</template>

<style lang="stylus" scoped>
@import '../common'

.-container
	display: inline-flex

.-slider
	max-width: 128px
</style>
