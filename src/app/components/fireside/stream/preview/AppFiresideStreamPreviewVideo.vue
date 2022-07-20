<script lang="ts" setup>
import { computed, onBeforeUnmount, PropType, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useDrawerStore } from '../../../../../_common/drawer/drawer-store';
import AppFiresideLiveTag from '../../../../../_common/fireside/AppFiresideLiveTag.vue';
import { Fireside } from '../../../../../_common/fireside/fireside.model';
import { useCommonStore } from '../../../../../_common/store/common-store';
import AppUserAvatarList from '../../../../../_common/user/user-avatar/list/list.vue';
import { User } from '../../../../../_common/user/user.model';
import { useAppStore } from '../../../../store';
import { useChatStore } from '../../../chat/chat-store';
import { createFiresideController, provideFiresideController } from '../../controller/controller';
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
	appStore: useAppStore(),
	commonStore: useCommonStore(),
	drawerStore: useDrawerStore(),
	chatStore: useChatStore()!,
	router: useRouter(),
});
provideFiresideController(c);

const { rtc, isShowingStreamSetup, isStreaming, cleanup: cleanupController } = c;

const cohosts = computed(() => {
	const result: User[] = [];

	for (const rtcUser of rtc.value?.listableStreamingUsers ?? []) {
		// Since we're iterating over listable users they will always have their userModel.
		const userModel = rtcUser.userModel!;

		// Filter out creator of the fireside.
		//
		// TODO(big-pp-event) why are we doing this?
		//
		// Note: this would probably not exclude the remote instance of the
		// creator of the fireside. Intentional?
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
	<div class="-stream-preview-video theme-dark">
		<div v-if="focusedUser && shouldShowVideo" :key="focusedUser.uid">
			<AppFiresideStreamVideo class="-stream-preview-video-inner" :rtc-user="focusedUser" />

			<div class="-overlay">
				<div v-if="showLive" class="-center">
					<AppFiresideLiveTag size="lg" />
				</div>
				<div v-if="showLiveUsers" class="-live-users">
					<AppUserAvatarList :users="cohosts" sm inline />
				</div>
			</div>
		</div>
		<div v-else />
	</div>
</template>

<style lang="stylus" scoped>
.-stream-preview-video
.-stream-preview-video-inner
.-overlay
	position: absolute !important
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

.-live-users
	position: absolute
	right: 16px
	bottom: 0
</style>
