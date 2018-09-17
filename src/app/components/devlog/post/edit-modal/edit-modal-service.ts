import { FiresidePost } from '../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { asyncComponentLoader } from '../../../../../lib/gj-lib-client/utils/utils';
import { Modal } from '../../../../../lib/gj-lib-client/components/modal/modal.service';

type DevlogPostEditModalType = 'add' | 'edit';

export type DevlogPostEditModalOptions = {
	editMode?: DevlogPostEditModalType;
	attachmentType?: string;
};

export class DevlogPostEditModal {
	static async show(post: FiresidePost, options: DevlogPostEditModalOptions) {
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
				editMode: options.editMode || 'add',
				attachmentType: options.attachmentType || '',
			},
		});
	}
}
