<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import { stringSort } from '../../../utils/array';
import { Api } from '../../api/api.service';
import AppLoading from '../../loading/AppLoading.vue';
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
</script>

<template>
	<AppModal>
		<div class="modal-header">
			<h2 class="modal-title">
				{{ title }}
			</h2>
		</div>

		<div class="modal-body">
			<p>{{ message }}</p>

			<div class="row">
				<AppLinkedAccount provider="facebook" :account="account" preview>
					<AppLoading v-if="isLoading" />
					<div v-else>
						<div v-if="!hasPages">
							<small class="text-muted">
								<AppTranslate>
									You have no Facebook Pages associated with your account.
								</AppTranslate>
							</small>
						</div>
						<div v-for="page of pages" :key="page.id">
							<input
								:id="page.id"
								type="radio"
								:value="page.id"
								name="pages"
								:checked="page.id === selectedPage.id"
								@change="changeSelected($event.target.value)"
							/>
							<label :for="page.id">{{ page.name }}</label>
							<small
								v-if="
									account.facebookSelectedPage &&
									page.id === account.facebookSelectedPage.id
								"
								class="text-muted"
							>
								<AppTranslate>Currently Linked</AppTranslate>
							</small>
						</div>
					</div>
				</AppLinkedAccount>
			</div>
		</div>

		<div class="modal-footer">
			<AppButton primary solid :disabled="!canConfirm" @click="ok">
				<AppTranslate>OK</AppTranslate>
			</AppButton>
			<AppButton trans @click="cancel">
				<AppTranslate>Cancel</AppTranslate>
			</AppButton>
		</div>
	</AppModal>
</template>
