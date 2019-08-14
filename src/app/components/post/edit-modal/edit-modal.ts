import { Component, Prop } from 'vue-property-decorator';
import { Community } from '../../../../_common/community/community.model';
import { FiresidePost } from '../../../../_common/fireside/post/post-model';
import { BaseModal } from '../../../../_common/modal/base';
import FormPost from '../../forms/post/post.vue';

@Component({
	components: {
		FormPost,
	},
})
export default class AppPostEditModal extends BaseModal {
	@Prop(FiresidePost)
	post!: FiresidePost;

	@Prop(Community)
	community?: Community;

	onSubmitted(post: FiresidePost) {
		this.modal.resolve(post);
	}
}
