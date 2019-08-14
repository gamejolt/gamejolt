import { Community } from '../../../../_common/community/community.model';
import { FiresidePost } from '../../../../_common/fireside/post/post-model';
import { Modal } from '../../../../_common/modal/modal.service';
import { asyncComponentLoader } from '../../../../utils/utils';

export type PostEditModalOptions = {
	community?: Community;
};

export class PostEditModal {
	static async show(post: FiresidePost, options: PostEditModalOptions = {}) {
		options = options || {};
		return await Modal.show<FiresidePost>({
			modalId: 'PostEdit',
			component: () =>
				asyncComponentLoader(import(/* webpackChunkName: "PostEditModal" */ './edit-modal.vue')),
			noBackdropClose: true,
			noEscClose: true,
			size: 'sm',
			props: {
				post: post,
				community: options.community,
			},
		});
	}
}
