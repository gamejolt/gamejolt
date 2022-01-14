<script lang="ts" setup>
import { computed, PropType, watch } from 'vue';
import { Fireside } from '../../../../../_common/fireside/fireside.model';
import { User } from '../../../../../_common/user/user.model';
import { createFiresideController } from '../../controller/controller';

const props = defineProps({
	fireside: {
		type: Object as PropType<Fireside>,
		required: true,
	},
	showLive: {
		type: Boolean,
		default: true,
	},
	showLiveUsers: {
		type: Boolean,
		default: true,
	},
});

const emit = defineEmits({
	changed: (_hasVideo: boolean, _isStreaming: boolean) => true,
});

const c = createFiresideController(props.fireside, { isMuted: true });

const rtcUsers = computed(() => {
	if (!c.rtc.value) {
		return [];
	}

	const users: User[] = [];
	c.rtc.value.users.forEach(i => {
		if (!i.userModel || i.userModel === props.fireside.user) {
			return;
		}
		users.push(i.userModel);
	});
	return users;
});

const focusedUser = computed(() => {
	return c.rtc.value?.focusedUser;
});

const hasVideo = computed(() => {
	return focusedUser.value?.hasVideo === true;
});

const shouldShowVideo = computed(() => {
	// We can only show local videos in one place at a time. This will
	// re-grab the video feed when it gets rebuilt.
	return hasVideo.value && !(c.isShowingStreamSetup.value && c.rtc.value?.isFocusingMe);
});

watch([c.isStreaming, hasVideo], () => {
	emit('changed', hasVideo.value, c.isStreaming.value);
});
</script>

<template>
	<app-fireside-container class="-stream theme-dark" :controller="c">
		<div v-if="focusedUser && shouldShowVideo" :key="focusedUser.uid">
			<app-fireside-stream-video class="-video-player" :rtc-user="focusedUser" />

			<div class="-overlay">
				<div v-if="showLive" class="-center">
					<div class="-live">
						<translate>LIVE</translate>
					</div>
				</div>
				<div v-if="showLiveUsers" class="-live-users">
					<app-user-avatar-list :users="rtcUsers" sm inline />
				</div>
			</div>
		</div>
		<div v-else />
	</app-fireside-container>
</template>

<style lang="stylus" scoped>
.-stream
.-video-player
.-overlay
	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0
	color: var(--theme-fg)

.-overlay
	z-index: 1
	background-color: rgba($black, 0.54)

.-center
	width: 100%
	height: 100%
	display: flex
	justify-content: center
	align-items: center

.-live
	rounded-corners-lg()
	margin: 0
	padding: 4px 8px
	font-size: $font-size-h1
	font-weight: 700
	font-family: $font-family-heading
	text-shadow: none
	box-shadow: 1px 1px 3px $black
	letter-spacing: 2px
	color: $white
	background-color: $gj-overlay-notice

.-live-users
	position: absolute
	right: 16px
	bottom: 0
</style>
