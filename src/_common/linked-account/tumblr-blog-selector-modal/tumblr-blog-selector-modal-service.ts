import { defineAsyncComponent } from 'vue';
import { showModal } from '../../modal/modal.service';
import { LinkedAccount, TumblrBlog } from '../linked-account.model';

export class ModalTumblrBlogSelector {
	static async show(account: LinkedAccount, title = 'Confirm...') {
		return await showModal<TumblrBlog | false>({
			modalId: 'TumblrBlogSelector',
			size: 'sm',
			component: defineAsyncComponent(() => import('./tumblr-blog-selector-modal.vue')),
			props: { account, title },
		});
	}
}
