import { FiresidePost } from 'game-jolt-frontend-lib/components/fireside/post/post-model';
import { Modal } from 'game-jolt-frontend-lib/components/modal/modal.service';
import { asyncComponentLoader } from 'game-jolt-frontend-lib/utils/utils';

export type PostEditModalOptions = {
	attachmentType?: string;
};

export class PostEditModal {
	static async show(post: FiresidePost, options: PostEditModalOptions = {}) {
		options = options || {};
		return await Modal.show<FiresidePost>({
			modalId: 'PostEdit',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "PostEditModal" */ './edit-modal')
				),
			noBackdropClose: true,
			noEscClose: true,
			size: 'sm',
			props: {
				post: post,
				attachmentType: options.attachmentType || '',
			},
		});
	}
}
