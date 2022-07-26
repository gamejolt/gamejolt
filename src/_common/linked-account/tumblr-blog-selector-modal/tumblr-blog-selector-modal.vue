<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import { stringSort } from '../../../utils/array';
import { Api } from '../../api/api.service';
import AppLoading from '../../loading/AppLoading.vue';
import { BaseModal } from '../../modal/base';
import { LinkedAccount, TumblrBlog } from '../linked-account.model';
import AppLinkedAccount from '../linked-account.vue';

@Options({
	components: {
		AppLinkedAccount,
		AppLoading,
	},
})
export default class AppModalTumblrBlogSelector extends mixins(BaseModal) {
	@Prop(String)
	message!: string;

	@Prop(Object)
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

		this.blogs = payload.blogs.sort((a: TumblrBlog, b: TumblrBlog) =>
			stringSort(a.name, b.name)
		);

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
</script>

<template>
	<AppModal>
		<div class="modal-header">
			<h2 class="modal-title">
				{{ title }}
			</h2>
		</div>

		<div class="modal-body">
			<div class="full-bleed">
				<AppLinkedAccount provider="tumblr" :account="account" :preview="true">
					<AppLoading v-if="isLoading" />
					<div v-else>
						<div v-if="!hasBlogs">
							<small class="text-muted">
								<AppTranslate>
									You have no Tumblr blogs associated with your account.
								</AppTranslate>
							</small>
						</div>

						<div v-for="blog of blogs" :key="blog.name">
							<input
								:id="blog.name"
								type="radio"
								:value="blog.name"
								name="blogs"
								:checked="blog.name === selectedBlog.name"
								@change="changeSelected($event.target.value)"
							/>
							<label :for="blog.id">{{ blog.title }}</label>
							<small
								v-if="
									account.tumblrSelectedBlog &&
									blog.name === account.tumblrSelectedBlog.name
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
