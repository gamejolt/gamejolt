<script lang="ts">
import { toRaw } from 'vue';
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { shallowSetup } from '../../../../utils/vue';
import { FiresideRTCUser, setAudioPlayback } from '../../../../_common/fireside/rtc/user';
import AppPopper from '../../../../_common/popper/popper.vue';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppUserCardHover from '../../../../_common/user/card/hover/hover.vue';
import AppUserAvatarImg from '../../../../_common/user/user-avatar/img/img.vue';
import { useFiresideController } from '../../../components/fireside/controller/controller';
import AppFiresideStreamVideo from '../../../components/fireside/stream/AppFiresideStreamVideo.vue';
import AppFiresideHostThumbIndicator from './host-thumb-indicator.vue';

@Options({
	components: {
		AppUserAvatarImg,
		AppFiresideHostThumbIndicator,
		AppPopper,
		AppFiresideStreamVideo,
		AppUserCardHover,
	},
	directives: {
		AppTooltip: vAppTooltip,
	},
})
export default class AppFiresideHostThumb extends Vue {
	@Prop({ type: Object, required: true })
	host!: FiresideRTCUser;

	@Prop({ type: Boolean, required: false, default: false })
	hideOptions!: boolean;

	c = shallowSetup(() => useFiresideController()!);

	@Emit('show-popper') emitShowPopper() {}
	@Emit('hide-popper') emitHidePopper() {}

	get isFocused() {
		return toRaw(this.c.rtc.value?.focusedUser) === toRaw(this.host);
	}

	get isMe() {
		return toRaw(this.c.rtc.value?.localUser) === toRaw(this.host);
	}

	get showingVideoThumb() {
		return !this.isFocused && this.host.hasVideo && !this.host.isUnlisted;
	}

	get tooltip() {
		return '@' + this.host.userModel?.username;
	}

	onClick() {
		if (this.isFocused || !this.c.rtc.value) {
			return;
		}

		this.c.rtc.value.focusedUser = this.host;
	}

	mute() {
		setAudioPlayback(this.host, false);
	}

	unmute() {
		setAudioPlayback(this.host, true);
	}

	onUserCardShow() {
		this.c.isShowingOverlayPopper.value = true;
	}

	onUserCardHide() {
		this.c.isShowingOverlayPopper.value = false;
	}
}
</script>

<template>
	<div class="-thumb">
		<AppUserCardHover :user="host.userModel" :hover-delay="0" no-stats>
			<div class="-click-capture" @click="onClick">
				<div class="-display-thumb" :class="{ '-hidden': !showingVideoThumb }">
					<template v-if="showingVideoThumb">
						<AppFiresideStreamVideo
							v-if="c.rtc.value && !c.rtc.value.videoPaused"
							:rtc-user="host"
							low-bitrate
						/>
						<AppJolticon v-else icon="camera" class="-display-thumb-icon" />
					</template>
				</div>

				<div class="-avatar-wrap" :class="{ '-full': !showingVideoThumb }">
					<AppFiresideHostThumbIndicator :host="host" />
				</div>

				<div class="-spacer" />
				<div class="-active-indicator" :class="{ '-active': isFocused }" />
			</div>

			<div v-if="!isMe" class="-options">
				<transition>
					<span
						v-if="host.micAudioMuted"
						v-app-tooltip="$gettext(`Muted`)"
						class="-option -option-warn anim-fade-enter-enlarge anim-fade-leave-shrink"
					>
						<AppJolticon icon="audio-mute" />
					</span>
				</transition>

				<div class="-options-spacer" />

				<AppPopper
					v-if="!hideOptions"
					placement="top"
					@show="emitShowPopper"
					@hide="emitHidePopper"
				>
					<a v-app-tooltip="$gettext('Options')" class="-option -option-show-hover">
						<AppJolticon icon="cog" />
					</a>

					<template #popover>
						<div class="list-group">
							<a v-if="!host.micAudioMuted" class="list-group-item" @click="mute()">
								<AppTranslate>Mute</AppTranslate>
							</a>
							<a v-else class="list-group-item" @click="unmute()">
								<AppTranslate>Unmute</AppTranslate>
							</a>
						</div>
					</template>
				</AppPopper>
			</div>
		</AppUserCardHover>
	</div>
</template>

<style lang="stylus" scoped>
.-thumb
.-click-capture
	position: relative
	width: var(--fireside-host-size)
	height: var(--fireside-host-size)

.-click-capture
	display: flex
	flex-direction: column
	align-items: center
	cursor: pointer
	user-select: none

.-display-thumb
	rounded-corners()
	flex: auto
	display: flex
	align-items: center
	justify-content: center
	width: 100%
	background-color: var(--theme-bg-subtle)
	overflow: hidden

	&.-hidden
		visibility: hidden

.-stream-player
	width: 100%
	height: 100%

.-avatar-wrap
	position: absolute
	width: calc(var(--fireside-host-size) * 0.5)
	height: calc(var(--fireside-host-size) * 0.5)
	bottom: 0
	transition: all 250ms $strong-ease-out

	&.-full
		width: calc(var(--fireside-host-size) - 12px)
		height: calc(var(--fireside-host-size) - 12px)
		bottom: 12px

.-spacer
	flex: none
	height: calc(var(--fireside-host-size) * 0.3)

.-active-indicator
	flex: none
	border-radius: 40%
	height: 4px
	width: 0
	opacity: 0
	background-color: var(--theme-link)
	transition: width 400ms $ease-out-back, opacity 250ms

	&.-active
		width: 30px
		opacity: 1

.-options
	position: absolute
	display: flex
	flex-direction: row
	justify-content: flex-end
	bottom: 8px
	left: 8px
	right: 8px
	grid-gap: 4px
	z-index: 2

	&-spacer
		flex: auto

.-option
	flex: none
	elevate-1()
	img-circle()
	display: flex
	width: 24px
	height: 24px
	background-color: var(--theme-bg)
	align-items: center
	justify-content: center
	color: var(--theme-fg)
	cursor: default

	a&
		cursor: pointer

		&:hover
			color: var(--theme-bi-fg)
			background-color: var(--theme-bi-bg)

	&-warn
		color: var(--theme-notice)

.-option-show-hover
	display: none

.-thumb:hover
	.-option-show-hover
		display: flex
</style>
