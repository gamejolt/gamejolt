import { Component, Prop } from 'vue-property-decorator';
import { stringSort } from '../../../utils/array';
import AppLoading from '../../../vue/components/loading/loading.vue'
import { Api } from '../../api/api.service';
import { BaseModal } from '../../modal/base';
import AppLinkedAccount from '../linked-account.vue';
import { LinkedAccount, TumblrBlog } from '../linked-account.model';

@Component({
	components: {
		AppLinkedAccount,
		AppLoading,
	},
})
export default class AppModalTumblrBlogSelector extends BaseModal {
	@Prop(String)
	message!: string;

	@Prop(LinkedAccount)
	account!: LinkedAccount;

	@Prop(String)
	title!: string;

	isLoading = true;
	blogs: TumblrBlog[] = [];
	selectedBlog: TumblrBlog | null = null;

	get canConfirm() {
		return !!this.selectedBlog;
	}

	get hasBlogs() {
		return this.blogs && this.blogs.length > 0;
	}

	async created() {
		let url = '/web/dash/linked-accounts/tumblr-blogs/' + this.account.id;
		if (this.account.game_id) {
			url += '?resource=Game&resourceId=' + this.account.game_id;
		} else {
			url += '?resource=User';
		}

		const payload = await Api.sendRequest(url, null, { detach: true });

		this.blogs = payload.blogs.sort((a: TumblrBlog, b: TumblrBlog) => stringSort(a.name, b.name));

		if (this.account.tumblrSelectedBlog) {
			this.selectedBlog = this.account.tumblrSelectedBlog;
		} else if (this.blogs.length > 0) {
			this.selectedBlog = this.blogs[0];
		}

		this.isLoading = false;
	}

	changeSelected(blogName: string) {
		const blog = this.blogs.find(b => b.name === blogName);
		if (blog) {
			this.selectedBlog = blog;
		}
	}

	ok() {
		this.modal.resolve(this.selectedBlog);
	}

	cancel() {
		this.modal.resolve(false);
	}
}
