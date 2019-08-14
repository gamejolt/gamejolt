import { VueRouter } from 'vue-router/types/router';
import { Modal } from '../../../components/modal/modal.service';
import { asyncComponentLoader } from '../../../utils/utils';
import { DisplayMode } from '../modal/modal.service';

interface CommentThreadModalOptions {
	resource: string;
	resourceId: number;
	commentId: number;
	displayMode: DisplayMode;
	autofocus?: boolean;
}

export class CommentThreadModal {
	static async show(options: CommentThreadModalOptions) {
		const { resource, resourceId, commentId, displayMode, autofocus } = options;

		return await Modal.show<void>({
			modalId: 'CommentThread-' + [resource, resourceId, commentId].join('-'),
			component: () =>
				asyncComponentLoader(import(/* webpackChunkName: "CommentModal" */ './modal.vue')),
			props: {
				resource,
				resourceId,
				commentId,
				displayMode,
				autofocus: autofocus || false,
			},
			size: 'sm',
		});
	}

	/**
	 * Checks if the url has a comment permalink and opens the modal
	 */
	static async showFromPermalink(
		router: VueRouter,
		resource: string,
		resourceId: number,
		displayMode: DisplayMode
	) {
		const hash = router.currentRoute.hash;
		if (!hash || hash.indexOf('#comment-') !== 0) {
			return;
		}

		const id = parseInt(hash.substring('#comment-'.length), 10);
		if (!id) {
			return;
		}

		CommentThreadModal.show({ commentId: id, resource, resourceId, displayMode });
	}
}
