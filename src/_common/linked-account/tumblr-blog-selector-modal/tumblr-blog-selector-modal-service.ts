import { defineAsyncComponent } from 'vue';
import { Modal } from '../../modal/modal.service';
import { LinkedAccount, TumblrBlog } from '../linked-account.model';

export class ModalTumblrBlogSelector {
	static async show(account: LinkedAccount, title = 'Confirm...') {
		return await Modal.show<TumblrBlog | false>({
			modalId: 'TumblrBlogSelector',
			size: 'sm',
			component: defineAsyncComponent(
				() =>
					import(
						/* webpackChunkName: "ModalTumblrBlogSelector" */ './tumblr-blog-selector-modal.vue'
					)
			),
			props: { account, title },
		});
	}
}
