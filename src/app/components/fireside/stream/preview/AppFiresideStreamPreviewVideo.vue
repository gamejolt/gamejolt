<script lang="ts" setup>
import { computed, onBeforeUnmount, PropType, watch } from 'vue';
import { Fireside } from '../../../../../_common/fireside/fireside.model';
import AppTranslate from '../../../../../_common/translate/AppTranslate.vue';
import AppUserAvatarList from '../../../../../_common/user/user-avatar/list/list.vue';
import { User } from '../../../../../_common/user/user.model';
import { AppFiresideContainer } from '../../container/container';
import { createFiresideController } from '../../controller/controller';
import AppFiresideStreamVideo from '../AppFiresideStreamVideo.vue';

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

const c = createFiresideController(props.fireside, {
	isMuted: true,
});

const { rtc, isShowingStreamSetup, isStreaming, cleanup: cleanupController } = c;

const cohosts = computed(() => {
	const result: User[] = [];

	for (const rtcUser of rtc.value?.listableStreamingUsers ?? []) {
		// Since we're iterating over listable users they will always have their userModel.
		const userModel = rtcUser.userModel!;

		// Filter out creator of the fireside.
		// TODO(big-pp-event) why are we doing this?
		if (userModel !== props.fireside.user) {
			result.push(userModel);
		}
	}

	return result;
});

const focusedUser = computed(() => rtc.value?.focusedUser);

const hasVideo = computed(() => focusedUser.value?.hasVideo === true);

const shouldShowVideo = computed(() => {
	// We can only show local videos in one place at a time. This will
	// re-grab the video feed when it gets rebuilt.
	return hasVideo.value && !(isShowingStreamSetup.value && rtc.value?.isFocusingMe);
});

watch([isStreaming, hasVideo], () => {
	emit('changed', hasVideo.value, isStreaming.value);
});

// TODO(big-pp-event) should we use onUnmounted here?
onBeforeUnmount(() => cleanupController());
</script>

<template>
	<AppFiresideContainer class="-stream theme-dark" :controller="c">
		<div v-if="focusedUser && shouldShowVideo" :key="focusedUser.uid">
			<AppFiresideStreamVideo class="-video-player" :rtc-user="focusedUser" />

			<div class="-overlay">
				<div v-if="showLive" class="-center">
					<div class="-live">
						<AppTranslate>LIVE</AppTranslate>
					</div>
				</div>
				<div v-if="showLiveUsers" class="-live-users">
					<AppUserAvatarList :users="cohosts" sm inline />
				</div>
			</div>
		</div>
		<div v-else />
	</AppFiresideContainer>
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
