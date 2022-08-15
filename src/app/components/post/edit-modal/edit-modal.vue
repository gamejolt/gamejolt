<script lang="ts">
import { mixins, Options, Prop, Watch } from 'vue-property-decorator';
import AppBackground from '../../../../_common/background/AppBackground.vue';
import { Background } from '../../../../_common/background/background.model';
import { CommunityChannel } from '../../../../_common/community/channel/channel.model';
import { Community } from '../../../../_common/community/community.model';
import { FiresidePost } from '../../../../_common/fireside/post/post-model';
import AppLoadingFade from '../../../../_common/loading/AppLoadingFade.vue';
import { BaseModal } from '../../../../_common/modal/base';
import { Screen } from '../../../../_common/screen/screen-service';
import AppTheme from '../../../../_common/theme/AppTheme.vue';
import AppFormPost from '../../forms/post/AppFormPost.vue';
import { VideoStatus } from '../../forms/post/_video/video.vue';
import AppPostAddPlaceholder from '../add-placeholder/add-placeholder.vue';

@Options({
	components: {
		AppFormPost,
		AppPostAddPlaceholder,
		AppLoadingFade,
		AppBackground,
		AppTheme,
	},
})
export default class AppPostEditModal extends mixins(BaseModal) {
	@Prop({ type: [Object, async () => Object] })
	postProvider!: FiresidePost | Promise<FiresidePost>;

	@Prop(Object)
	community?: Community;

	@Prop(Object)
	channel?: CommunityChannel;

	post: FiresidePost | null = null;
	videoUploadStatus: VideoStatus = VideoStatus.IDLE;
	background: Background | null = null;

	readonly Screen = Screen;

	get closeButtonDisabled() {
		return this.videoUploadStatus === VideoStatus.UPLOADING;
	}

	get overlay() {
		return !!this.background;
	}

	@Watch('postProvider', { immediate: true })
	async postProviderSet() {
		if (this.postProvider instanceof FiresidePost) {
			this.post = this.postProvider;
		} else {
			this.post = await this.postProvider;
		}

		this.background = this.post.background || null;
	}

	onSubmitted(post: FiresidePost) {
		this.modal.resolve(post);
	}

	onVideoUploadStatusChanged(videoStatus: VideoStatus) {
		this.videoUploadStatus = videoStatus;
	}

	onBackgroundChange(background?: Background) {
		this.background = background || null;
	}
}
</script>

<template>
	<AppModal>
		<AppBackground
			class="-background"
			:background="background"
			:darken="overlay"
			:background-style="
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
