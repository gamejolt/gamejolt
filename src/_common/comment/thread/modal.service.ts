import { defineAsyncComponent } from 'vue';
import { Router } from 'vue-router';
import { showModal } from '../../modal/modal.service';
import { Model } from '../../model/model.service';
import { DisplayMode } from '../modal/modal.service';

interface CommentThreadModalOptions {
	router: Router;
	model: Model;
	commentId: number;
	displayMode: DisplayMode;
	autofocus?: boolean;
}

export type CommentThreadModalPermalinkDeregister = () => void;

export class CommentThreadModal {
	static async show(options: CommentThreadModalOptions) {
		const { router, model, commentId, displayMode, autofocus } = options;

		return await showModal<void>({
			modalId: 'CommentThread-' + [model.constructor.name, model.id, commentId].join('-'),
			component: defineAsyncComponent(() => import('./AppCommentThreadModal.vue')),
			props: {
				model,
				commentId,
				displayMode,
				autofocus: autofocus || false,
			},
			size: 'sm',
			onDismiss(reason) {
				// If the modal is closing because of a route change, we don't
				// want to mess with the URL.
				if (reason !== 'route-change') {
					_removeFromPermalink(router);
				}
			},
		});
	}

	/**
	 * Checks if the url has a comment permalink and opens the modal
	 */
	static async showFromPermalink(router: Router, model: Model, displayMode: DisplayMode) {
		const hash = router.currentRoute.value.hash;
		if (!hash || hash.indexOf('#comment-') !== 0) {
			return;
		}

		const id = parseInt(hash.substring('#comment-'.length), 10);
		if (!id) {
			return;
		}

		CommentThreadModal.show({ router, commentId: id, model, displayMode });
	}

	static watchForPermalink(router: Router, model: Model, displayMode: DisplayMode) {
		const checkPath = router.currentRoute.value.path;
		return router.afterEach((to, _from) => {
			if (checkPath === to.path && !!to.hash) {
				this.showFromPermalink(router, model, displayMode);
			}
		}) as CommentThreadModalPermalinkDeregister;
	}
}

function _removeFromPermalink(router: Router) {
	const hash = router.currentRoute.value.hash;
	if (!hash || hash.indexOf('#comment-') !== 0) {
		return;
	}

	router.replace({ ...router.currentRoute.value, hash: '' });
}
