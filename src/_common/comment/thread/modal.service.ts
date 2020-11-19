import { VueRouter } from 'vue-router/types/router';
import { asyncComponentLoader } from '../../../utils/utils';
import { Modal } from '../../modal/modal.service';
import { Model } from '../../model/model.service';
import { DisplayMode } from '../modal/modal.service';

interface CommentThreadModalOptions {
	model: Model;
	commentId: number;
	displayMode: DisplayMode;
	autofocus?: boolean;
}

export type CommentThreadModalPermalinkDeregister = () => void;

export class CommentThreadModal {
	static async show(options: CommentThreadModalOptions) {
		const { model, commentId, displayMode, autofocus } = options;

		return await Modal.show<void>({
			modalId: 'CommentThread-' + [model.constructor.name, model.id, commentId].join('-'),
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "CommentThreadModal" */ './modal.vue')
				),
			props: {
				model,
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
	static async showFromPermalink(router: VueRouter, model: Model, displayMode: DisplayMode) {
		const hash = router.currentRoute.hash;
		if (!hash || hash.indexOf('#comment-') !== 0) {
			return;
		}

		const id = parseInt(hash.substring('#comment-'.length), 10);
		if (!id) {
			return;
		}

		CommentThreadModal.show({ commentId: id, model, displayMode });
	}

	static watchForPermalink(router: VueRouter, model: Model, displayMode: DisplayMode) {
		const checkPath = router.currentRoute.path;
		return router.afterEach((to, _from) => {
			if (checkPath === to.path && !!to.hash) {
				this.showFromPermalink(router, model, displayMode);
			}
		}) as CommentThreadModalPermalinkDeregister;
	}
}
