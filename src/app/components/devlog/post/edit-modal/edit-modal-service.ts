import { FiresidePost } from 'game-jolt-frontend-lib/components/fireside/post/post-model';
import { Modal } from 'game-jolt-frontend-lib/components/modal/modal.service';
import { asyncComponentLoader } from 'game-jolt-frontend-lib/utils/utils';

type DevlogPostEditModalType = 'add' | 'edit';

export class DevlogPostEditModal {
	static async show(post: FiresidePost, editMode: DevlogPostEditModalType = 'add') {
		return await Modal.show<FiresidePost>({
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "DevlogPostEditModal" */ './edit-modal')
				),
			noBackdropClose: true,
			noEscClose: true,
			size: 'sm',
			props: { post, editMode },
		});
	}
}
