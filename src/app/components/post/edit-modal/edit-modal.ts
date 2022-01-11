import { mixins, Options, Prop, Watch } from 'vue-property-decorator';
import { CommunityChannel } from '../../../../_common/community/channel/channel.model';
import { Community } from '../../../../_common/community/community.model';
import { FiresidePost } from '../../../../_common/fireside/post/post-model';
import AppLoadingFade from '../../../../_common/loading/AppLoadingFade.vue';
import { BaseModal } from '../../../../_common/modal/base';
import FormPost from '../../forms/post/post.vue';
import { VideoStatus } from '../../forms/post/_video/video';
import AppPostAddPlaceholder from '../add-placeholder/add-placeholder.vue';

@Options({
	components: {
		FormPost,
		AppPostAddPlaceholder,
		AppLoadingFade,
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

	get closeButtonDisabled() {
		return this.videoUploadStatus === VideoStatus.UPLOADING;
	}

	@Watch('postProvider', { immediate: true })
	async postProviderSet() {
		if (this.postProvider instanceof FiresidePost) {
			this.post = this.postProvider;
		} else {
			this.post = await this.postProvider;
		}
	}

	onSubmitted(post: FiresidePost) {
		this.modal.resolve(post);
	}

	onVideoUploadStatusChanged(videoStatus: VideoStatus) {
		this.videoUploadStatus = videoStatus;
	}
}
