<script lang="ts">
import { mixins, Options, Prop, Watch } from 'vue-property-decorator';
import AppBackground from '../../../../_common/background/AppBackground.vue';
import { BackgroundModel } from '../../../../_common/background/background.model';
import { CommunityChannelModel } from '../../../../_common/community/channel/channel.model';
import { CommunityModel } from '../../../../_common/community/community.model';
import { FiresidePostModel } from '../../../../_common/fireside/post/post-model';
import AppLoadingFade from '../../../../_common/loading/AppLoadingFade.vue';
import { BaseModal } from '../../../../_common/modal/base';
import { RealmModel } from '../../../../_common/realm/realm-model';
import { Screen } from '../../../../_common/screen/screen-service';
import AppTheme from '../../../../_common/theme/AppTheme.vue';
import { VideoStatus } from '../../forms/post/_video/video.vue';
import AppFormPost from '../../forms/post/AppFormPost.vue';
import AppPostAddPlaceholder from '../add-placeholder/AppPostAddPlaceholder.vue';

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
	postProvider!: FiresidePostModel | Promise<FiresidePostModel>;

	@Prop(Object)
	community?: CommunityModel;

	@Prop(Object)
	channel?: CommunityChannelModel;

	@Prop(Object)
	realm?: RealmModel;

	post: FiresidePostModel | null = null;
	videoUploadStatus: VideoStatus = VideoStatus.IDLE;
	background: BackgroundModel | null = null;

	readonly Screen = Screen;

	get closeButtonDisabled() {
		return this.videoUploadStatus === VideoStatus.UPLOADING;
	}

	get overlay() {
		return !!this.background;
	}

	@Watch('postProvider', { immediate: true })
	async postProviderSet() {
		if (this.postProvider instanceof FiresidePostModel) {
			this.post = this.postProvider;
		} else {
			this.post = await this.postProvider;
		}

		this.background = this.post.background || null;
	}

	onSubmitted(post: FiresidePostModel) {
		this.modal.resolve(post);
	}

	onVideoUploadStatusChanged(videoStatus: VideoStatus) {
		this.videoUploadStatus = videoStatus;
	}

	onBackgroundChange(background?: BackgroundModel) {
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
