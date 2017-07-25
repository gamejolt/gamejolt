import { FiresidePost } from '../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { asyncComponentLoader } from '../../../../../lib/gj-lib-client/utils/utils';
import { Modal } from '../../../../../lib/gj-lib-client/components/modal/modal.service';

export class DevlogPostEditModal {
	static async show(post: FiresidePost) {
		return await Modal.show<FiresidePost>({
			component: () =>
				asyncComponentLoader(import(/* webpackChunkName: "DevlogPostEditModal" */ './edit-modal')),
			noBackdropClose: true,
			noEscClose: true,
			size: 'sm',
			props: { post },
		});
	}
}
