<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import { Api } from '../api/api.service';
import { Comment } from '../comment/comment-model';
import { formatNumber } from '../filters/number';
import { FiresidePost } from '../fireside/post/post-model';
import { Game } from '../game/game.model';
import AppLoading from '../loading/AppLoading.vue';
import { BaseModal } from '../modal/base';
import AppUserList from '../user/list/AppUserList.vue';
import { User } from '../user/user.model';
import { LikersResource } from './modal.service';

const UsersPerPage = 20;

@Options({
	components: {
		AppLoading,
		AppUserList,
	},
})
export default class AppLikesModal extends mixins(BaseModal) {
	@Prop(Number)
	count!: number;

	@Prop(Object)
	resource?: LikersResource;

	readonly formatNumber = formatNumber;

	reachedEnd = false;
	isLoading = false;
	currentPage = 0;
	users: User[] = [];

	// Just for display purposes, if we have more users than the count passed in, display that instead.
	// This can happen when the count was fetched before new users were added to the list.
	get realCount() {
		return Math.max(this.count, this.users.length);
	}

	get requestUrl() {
		if (this.resource) {
			if (this.resource instanceof Comment) {
				return '/comments/likers/' + this.resource.id;
			} else if (this.resource instanceof FiresidePost) {
				return '/web/posts/likers/' + this.resource.id;
			} else if (this.resource instanceof Game) {
				return '/web/discover/games/likers/' + this.resource.id;
			}
		}
	}

	get shouldShowLoadMore() {
		return !this.isLoading && !this.reachedEnd;
	}

	async created() {
		this.loadMore();
	}

	async loadMore() {
		if (this.isLoading) {
			return;
		}

		this.isLoading = true;
		++this.currentPage;
		const payload = await Api.sendRequest(this.requestUrl + '?page=' + this.currentPage);

		const users = User.populate(payload.users);
		this.users = this.users.concat(users);

		if (users.length < UsersPerPage || this.users.length === this.count) {
			this.reachedEnd = true;
		}

		this.isLoading = false;
	}
}
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				<AppTranslate>Close</AppTranslate>
			</AppButton>
		</div>

		<div class="modal-header">
			<h2 class="modal-title">
				<AppTranslate
					:translate-n="realCount"
					:translate-params="{ count: formatNumber(realCount) }"
					translate-plural="%{ count } likes"
				>
					1 like
				</AppTranslate>
			</h2>
		</div>

		<div class="modal-body">
			<AppUserList :users="users" />

			<AppLoading v-if="isLoading" centered />

			<div v-if="shouldShowLoadMore" class="page-cut">
				<AppButton trans @click="loadMore()">
					<AppTranslate>Load More</AppTranslate>
				</AppButton>
			</div>
		</div>
	</AppModal>
</template>
