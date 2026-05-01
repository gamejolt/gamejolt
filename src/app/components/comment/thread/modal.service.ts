import { defineAsyncComponent } from 'vue';

import { DisplayMode } from '~app/components/comment/modal/modal.service';
import { showModal } from '~common/modal/modal.service';
import { Model } from '~common/model/model.service';
import { getCurrentRouter } from '~common/route/current-router-service';

interface CommentThreadModalOptions {
	model: Model;
	commentId: number;
	displayMode: DisplayMode;
	autofocus?: boolean;
}

export type CommentThreadModalPermalinkDeregister = () => void;

export async function showCommentThreadModal(options: CommentThreadModalOptions) {
	const { model, commentId, displayMode, autofocus } = options;

	return await showModal<void>({
		modalId: 'CommentThread-' + [model.constructor.name, model.id, commentId].join('-'),
		component: defineAsyncComponent(
			() => import('~app/components/comment/thread/AppCommentThreadModal.vue')
		),
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
				_removeFromPermalink();
			}
		},
	});
}

export async function showCommentThreadModalFromPermalink(model: Model, displayMode: DisplayMode) {
	const router = getCurrentRouter();
	const hash = router.currentRoute.value.hash;
	if (!hash || hash.indexOf('#comment-') !== 0) {
		return;
	}

	const id = parseInt(hash.substring('#comment-'.length), 10);
	if (!id) {
		return;
	}

	showCommentThreadModal({ commentId: id, model, displayMode });
}

export function watchForCommentThreadModalPermalink(model: Model, displayMode: DisplayMode) {
	const router = getCurrentRouter();
	const checkPath = router.currentRoute.value.path;
	return router.afterEach((to, _from) => {
		if (checkPath === to.path && !!to.hash) {
			showCommentThreadModalFromPermalink(model, displayMode);
		}
	}) as CommentThreadModalPermalinkDeregister;
}

function _removeFromPermalink() {
	const router = getCurrentRouter();
	const hash = router.currentRoute.value.hash;
	if (!hash || hash.indexOf('#comment-') !== 0) {
		return;
	}

	router.replace({ ...router.currentRoute.value, hash: '' });
}
