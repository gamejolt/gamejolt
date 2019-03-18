import { Community } from 'game-jolt-frontend-lib/components/community/community.model';
import { FiresidePost } from 'game-jolt-frontend-lib/components/fireside/post/post-model';
import { BaseModal } from 'game-jolt-frontend-lib/components/modal/base';
import AppJolticon from 'game-jolt-frontend-lib/vue/components/jolticon/jolticon.vue'
import { Component, Prop } from 'vue-property-decorator';
import FormPost from '../../forms/post/post.vue';

@Component({
	components: {
		AppJolticon,
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
