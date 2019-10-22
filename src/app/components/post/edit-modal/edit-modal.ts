import { Component, Prop, Watch } from 'vue-property-decorator';
import { CommunityChannel } from '../../../../_common/community/channel/channel.model';
import { Community } from '../../../../_common/community/community.model';
import { FiresidePost } from '../../../../_common/fireside/post/post-model';
import AppLoadingFade from '../../../../_common/loading/fade/fade.vue';
import { BaseModal } from '../../../../_common/modal/base';
import FormPost from '../../forms/post/post.vue';
import AppPostAddPlaceholder from '../add-placeholder/add-placeholder.vue';

@Component({
	components: {
		FormPost,
		AppPostAddPlaceholder,
		AppLoadingFade,
	},
})
export default class AppPostEditModal extends BaseModal {
	@Prop()
	postProvider!: FiresidePost | Promise<FiresidePost>;

	@Prop(Community)
	community?: Community;

	@Prop(CommunityChannel)
	channel?: CommunityChannel;

	post: FiresidePost | null = null;

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
}
