<script lang="ts" setup>
import { computed, ref, watch } from 'vue';

import AppBackground from '../../../../_common/background/AppBackground.vue';
import { BackgroundModel } from '../../../../_common/background/background.model';
import AppButton from '../../../../_common/button/AppButton.vue';
import { CommunityChannelModel } from '../../../../_common/community/channel/channel.model';
import { CommunityModel } from '../../../../_common/community/community.model';
import { FiresidePostModel } from '../../../../_common/fireside/post/post-model';
import AppLoadingFade from '../../../../_common/loading/AppLoadingFade.vue';
import AppModal from '../../../../_common/modal/AppModal.vue';
import { useModal } from '../../../../_common/modal/modal.service';
import { RealmModel } from '../../../../_common/realm/realm-model';
import { Screen } from '../../../../_common/screen/screen-service';
import AppTheme from '../../../../_common/theme/AppTheme.vue';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { VideoStatus } from '../../forms/post/_video/FormPostVideo.vue';
import AppFormPost from '../../forms/post/AppFormPost.vue';
import AppPostAddPlaceholder from '../add-placeholder/AppPostAddPlaceholder.vue';

type Props = {
	postProvider: FiresidePostModel | Promise<FiresidePostModel>;
	community?: CommunityModel;
	channel?: CommunityChannelModel;
	realm?: RealmModel;
};

const { postProvider, community, channel, realm } = defineProps<Props>();

const modal = useModal()!;

const post = ref<FiresidePostModel | null>(null);
const videoUploadStatus = ref<VideoStatus>(VideoStatus.IDLE);
const background = ref<BackgroundModel | null>(null);

const closeButtonDisabled = computed(() => {
	return videoUploadStatus.value === VideoStatus.UPLOADING;
});

const overlay = computed(() => {
	return !!background.value;
});

watch(
	() => postProvider,
	async provider => {
		if (provider instanceof FiresidePostModel) {
			post.value = provider;
		} else {
			post.value = await provider;
		}

		background.value = post.value.background || null;
	},
	{ immediate: true }
);

function onSubmitted(submittedPost: FiresidePostModel) {
	modal.resolve(submittedPost);
}

function onVideoUploadStatusChanged(videoStatus: VideoStatus) {
	videoUploadStatus.value = videoStatus;
}

function onBackgroundChange(bg?: BackgroundModel) {
	background.value = bg || null;
}
</script>

<template>
	<AppModal>
		<AppBackground
			class="-background"
			:background="background || undefined"
			:darken="overlay"
			:backdrop-style="
				Screen.isXs
					? undefined
					: {
							overflow: 'hidden',
							'border-radius': '12px',
					  }
			"
		>
			<AppTheme class="modal-controls" :force-dark="overlay">
				<AppButton
					:disabled="closeButtonDisabled"
					:overlay="overlay"
					@click="modal.dismiss()"
				>
					<AppTranslate>Close</AppTranslate>
				</AppButton>
			</AppTheme>

			<div class="modal-body">
				<AppLoadingFade :is-loading="!post">
					<AppPostAddPlaceholder v-if="!post" />
					<AppFormPost
						v-else
						:model="post"
						:default-community="community"
						:default-channel="channel"
						:default-realm="realm"
						:overlay="overlay"
						@submit="onSubmitted"
						@video-upload-status-change="onVideoUploadStatusChanged"
						@background-change="onBackgroundChange"
					/>
				</AppLoadingFade>
			</div>
		</AppBackground>
	</AppModal>
</template>

<style lang="stylus" scoped>
.-background
	@media $media-xs
		min-height: 100vh
</style>
