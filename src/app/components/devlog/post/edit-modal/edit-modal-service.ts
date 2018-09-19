import { FiresidePost } from 'game-jolt-frontend-lib/components/fireside/post/post-model';
import { Modal } from 'game-jolt-frontend-lib/components/modal/modal.service';
import { asyncComponentLoader } from 'game-jolt-frontend-lib/utils/utils';

export type DevlogPostEditModalOptions = {
	attachmentType?: string;
};

export class DevlogPostEditModal {
	static async show(post: FiresidePost, options: DevlogPostEditModalOptions = {}) {
		options = options || {};
		return await Modal.show<FiresidePost>({
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "DevlogPostEditModal" */ './edit-modal')
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
