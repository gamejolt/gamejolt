<script lang="ts" setup>
import { computed, onBeforeUnmount, PropType, watch } from 'vue';
import { useRouter } from 'vue-router';
import AppFiresideLiveTag from '../../../../../_common/fireside/AppFiresideLiveTag.vue';
import { Fireside } from '../../../../../_common/fireside/fireside.model';
import { useStickerStore } from '../../../../../_common/sticker/sticker-store';
import { useCommonStore } from '../../../../../_common/store/common-store';
import AppUserAvatarList from '../../../../../_common/user/user-avatar/list/list.vue';
import { User } from '../../../../../_common/user/user.model';
import { useGridStore } from '../../../grid/grid-store';
import { createFiresideController, provideFiresideController } from '../../controller/controller';
import AppFiresideStreamVideoPortal from '../AppFiresideStreamVideoPortal.vue';

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
	commonStore: useCommonStore(),
	stickerStore: useStickerStore(),
	gridStore: useGridStore(),
	router: useRouter(),
});
provideFiresideController(c);

const {
	streamingHosts,
	isShowingStreamSetup,
	isStreaming,
	focusedHost,
	isFocusingMe,
	destroy: destroyController,
} = c;

const cohosts = computed(() => {
	const result: User[] = [];

	for (const host of streamingHosts.value ?? []) {
		const userModel = host.userModel!;

		// Filter out creator of the fireside since they're the main host, not a
		// cohost.
		if (userModel.id !== props.fireside.user.id) {
			result.push(userModel);
		}
	}

	return result;
});

const hasVideo = computed(() => focusedHost.value?.hasVideo === true);

const shouldShowVideo = computed(() => {
	// We can only show local videos in one place at a time. This will
	// re-grab the video feed when it gets rebuilt.
	return hasVideo.value && !(isShowingStreamSetup.value && isFocusingMe.value);
});

watch([isStreaming, hasVideo], () => {
	emit('changed', hasVideo.value, isStreaming.value);
});

onBeforeUnmount(() => destroyController());
</script>

<template>
	<div class="-stream-preview-video theme-dark">
		<div v-if="focusedHost && shouldShowVideo" :key="focusedHost.userId">
			<AppFiresideStreamVideoPortal
				class="-stream-preview-video-inner"
				:rtc-user="focusedHost"
			/>

			<div class="-overlay">
				<div v-if="showLive" class="-center">
					<AppFiresideLiveTag />
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
