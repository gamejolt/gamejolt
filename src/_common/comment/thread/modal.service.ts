import Vue from 'vue';
import { VueRouter } from 'vue-router/types/router';
import { asyncComponentLoader } from '../../../utils/utils';
import { Modal } from '../../modal/modal.service';
import { Model } from '../../model/model.service';
import { DisplayMode } from '../modal/modal.service';

export interface CommentThreadModalOptions {
	model: Model;
	/** The id of the parent of the thread. */
	parentId: number;
	/** Id of the "active" comment that will be scrolled to. */
	commentId: number;
	displayMode: DisplayMode;
	autofocus?: boolean;
}

export type CommentThreadModalPermalinkDeregister = () => void;

export class CommentThreadModal {
	private static getModalId(options: CommentThreadModalOptions) {
		return (
			'CommentThread-' +
			[options.model.constructor.name, options.model.id, options.parentId].join('-')
		);
	}

	static async show(options: CommentThreadModalOptions) {
		const { model, commentId, parentId, displayMode, autofocus } = options;

		// Check if there already is a thread modal open for this parent's thread.
		// If there is, scroll to the input comment id and bring the modal to the front of the stack.
		const openModal = this.getOpenModal(options);
		if (openModal) {
			// Unset the comment id and set it back to the intended id.
			// This is so that is scrolls to the comment even if it was the previously
			// focused comment (since no change in id would occur).
			Vue.set(openModal.props, 'commentId', 0);
			// Wait a tick for the change to take place.
			await Vue.nextTick();
			Vue.set(openModal.props, 'commentId', commentId);

			Modal.toFront(openModal);
			return;
		}

		return await Modal.show<void>({
			modalId: this.getModalId(options),
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "CommentThreadModal" */ './modal.vue')
				),
			props: {
				model,
				parentId,
				commentId,
				displayMode,
				autofocus: autofocus || false,
			},
			size: 'sm',
		});
	}

	static getOpenModal(options: CommentThreadModalOptions) {
		const modalId = this.getModalId(options);
		const modal = Modal.modals.find(i => i.modalId === modalId);
		if (modal) {
			return modal;
		}
	}

	/**
	 * Checks if the url has a comment permalink and opens the modal
	 */
	static async showFromPermalink(router: VueRouter, model: Model, displayMode: DisplayMode) {
		const hash = router.currentRoute.hash;
		if (!hash || !hash.includes('#comment-')) {
			return;
		}

		const idStr = hash.substring('#comment-'.length);
		let commentId = 0;
		let parentId = 0;

		// If the input string is in the format "#comment-123-123",
		// the first number is the comment's id, the second the parent's id.
		// If there is no second id, the comment is a parent.
		if (idStr.includes('-')) {
			const commentIdStr = idStr.split('-')[0];
			const parentIdStr = idStr.split('-')[1];
			commentId = parseInt(commentIdStr, 10);
			parentId = parseInt(parentIdStr, 10);
		} else {
			const id = parseInt(hash.substring('#comment-'.length), 10);
			commentId = id;
			parentId = id;
		}

		if (!commentId || !parentId) {
			return;
		}

		CommentThreadModal.show({ commentId, parentId, model, displayMode });
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
