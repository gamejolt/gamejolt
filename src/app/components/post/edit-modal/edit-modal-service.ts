import { FiresidePost } from 'game-jolt-frontend-lib/components/fireside/post/post-model';
import { Modal } from 'game-jolt-frontend-lib/components/modal/modal.service';
import { asyncComponentLoader } from 'game-jolt-frontend-lib/utils/utils';

export type PostEditModalOptions = {
	attachmentType?: string;
};

const MODAL_ID = 'PostEditModal';

export class PostEditModal {
	static _isBlocked = false;

	static blockModal() {
		this._isBlocked = true;
	}

	static unblockModal() {
		this._isBlocked = false;
	}

	static get canShow() {
		return !this._isBlocked && Modal.canAddToStack(MODAL_ID);
	}

	static async show(post: FiresidePost, options: PostEditModalOptions = {}) {
		options = options || {};
		return await Modal.show<FiresidePost>({
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
			modalId: MODAL_ID,
		});
	}
}
