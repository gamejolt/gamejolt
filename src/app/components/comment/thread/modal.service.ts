import { defineAsyncComponent } from 'vue';
import { Router } from 'vue-router';
import { showModal } from '../../../../_common/modal/modal.service';
import { Model } from '../../../../_common/model/model.service';
import { DisplayMode } from '../modal/modal.service';

interface CommentThreadModalOptions {
	router: Router;
	model: Model;
	commentId: number;
	displayMode: DisplayMode;
	autofocus?: boolean;
}

export type CommentThreadModalPermalinkDeregister = () => void;

export async function showCommentThreadModal(options: CommentThreadModalOptions) {
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

export async function showCommentThreadModalFromPermalink(
	router: Router,
	model: Model,
	displayMode: DisplayMode
) {
	const hash = router.currentRoute.value.hash;
	if (!hash || hash.indexOf('#comment-') !== 0) {
		return;
	}

	const id = parseInt(hash.substring('#comment-'.length), 10);
	if (!id) {
		return;
	}

	showCommentThreadModal({ router, commentId: id, model, displayMode });
}

export function watchForCommentThreadModalPermalink(
	router: Router,
	model: Model,
	displayMode: DisplayMode
) {
	const checkPath = router.currentRoute.value.path;
	return router.afterEach((to, _from) => {
		if (checkPath === to.path && !!to.hash) {
			showCommentThreadModalFromPermalink(router, model, displayMode);
		}
	}) as CommentThreadModalPermalinkDeregister;
}

function _removeFromPermalink(router: Router) {
	const hash = router.currentRoute.value.hash;
	if (!hash || hash.indexOf('#comment-') !== 0) {
		return;
	}

	router.replace({ ...router.currentRoute.value, hash: '' });
}
