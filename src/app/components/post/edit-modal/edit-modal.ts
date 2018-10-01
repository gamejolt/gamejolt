import View from '!view!./edit-modal.html';
import { FiresidePost } from 'game-jolt-frontend-lib/components/fireside/post/post-model';
import { BaseModal } from 'game-jolt-frontend-lib/components/modal/base';
import { AppJolticon } from 'game-jolt-frontend-lib/vue/components/jolticon/jolticon';
import { Component, Prop } from 'vue-property-decorator';
import { FormPost } from '../../forms/post/post';

@View
@Component({
	components: {
		AppJolticon,
		FormPost,
	},
})
export default class AppPostEditModal extends BaseModal {
	@Prop(FiresidePost)
	post!: FiresidePost;

	@Prop(String)
	attachmentType!: string;

	onSubmitted(post: FiresidePost) {
		this.modal.resolve(post);
	}
}
