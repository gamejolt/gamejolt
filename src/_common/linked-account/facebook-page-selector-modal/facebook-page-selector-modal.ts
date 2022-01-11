import { mixins, Options, Prop } from 'vue-property-decorator';
import { stringSort } from '../../../utils/array';
import { Api } from '../../api/api.service';
import AppLoading from '../../loading/loading.vue';
import { BaseModal } from '../../modal/base';
import { FacebookPage, LinkedAccount } from '../linked-account.model';
import AppLinkedAccount from '../linked-account.vue';

@Options({
	components: {
		AppLinkedAccount,
		AppLoading,
	},
})
export default class AppModalFacebookPageSelector extends mixins(BaseModal) {
	@Prop(String)
	message!: string;

	@Prop(Object)
	account!: LinkedAccount;

	@Prop(String)
	title!: string;

	isLoading = true;
	pages: FacebookPage[] = [];
	selectedPage: FacebookPage | null = null;

	get canConfirm() {
		return !!this.selectedPage;
	}

	get hasPages() {
		return this.pages && this.pages.length > 0;
	}

	async created() {
		const payload = await Api.sendRequest(
			'/web/dash/linked-accounts/facebook-pages/' +
				this.account.game_id +
				'/' +
				this.account.id,
			null,
			{ detach: true }
		);

		this.pages = payload.pages.sort((a: FacebookPage, b: FacebookPage) =>
			stringSort(a.name, b.name)
		);

		if (this.account.facebookSelectedPage) {
			this.selectedPage = this.account.facebookSelectedPage;
		} else if (this.pages.length > 0) {
			this.selectedPage = this.pages[0];
		}

		this.isLoading = false;
	}

	changeSelected(pageId: number) {
		const page = this.pages.find(p => p.id === pageId);
		if (page) {
			this.selectedPage = page;
		}
	}

	ok() {
		this.modal.resolve(this.selectedPage);
	}

	cancel() {
		this.modal.resolve(false);
	}
}
