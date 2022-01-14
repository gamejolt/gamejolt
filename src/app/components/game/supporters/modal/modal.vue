<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import { Api } from '../../../../../_common/api/api.service';
import { formatNumber } from '../../../../../_common/filters/number';
import { Game } from '../../../../../_common/game/game.model';
import AppLoading from '../../../../../_common/loading/loading.vue';
import { BaseModal } from '../../../../../_common/modal/base';
import { User } from '../../../../../_common/user/user.model';
import AppUserList from '../../../user/list/list.vue';

const UsersPerPage = 20;

@Options({
	components: {
		AppLoading,
		AppUserList,
	},
})
export default class AppSupportersModal extends mixins(BaseModal) {
	@Prop(Object)
	game!: Game;

	@Prop(Number)
	supporterCount!: number;

	readonly formatNumber = formatNumber;

	reachedEnd = false;
	isLoading = false;
	currentPage = 0;
	users: User[] = [];

	get shouldShowLoadMore() {
		return !this.isLoading && !this.reachedEnd;
	}

	async created() {
		await this.loadMore();
	}

	async loadMore() {
		if (this.isLoading) {
			return;
		}

		this.isLoading = true;
		++this.currentPage;
		const payload = await Api.sendRequest(
			'/web/discover/games/supporters/' + this.game.id + '?page=' + this.currentPage
		);

		const users = User.populate(payload.supporters);
		this.users = this.users.concat(users);

		if (users.length < UsersPerPage || users.length === this.supporterCount) {
			this.reachedEnd = true;
		}

		this.isLoading = false;
	}
}
</script>

<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>

		<div class="modal-header">
			<h2 class="modal-title">
				<translate
					:translate-n="supporterCount"
					:translate-params="{ count: formatNumber(supporterCount) }"
					translate-plural="%{ count } supporters"
				>
					1 supporter
				</translate>
			</h2>
			<p>
				<translate
					>The kind people that supported by paying more than the minimum.</translate
				>
			</p>
		</div>

		<div class="modal-body">
			<app-user-list :users="users" />

			<app-loading v-if="isLoading" centered />

			<div v-if="shouldShowLoadMore" class="page-cut">
				<app-button trans @click="loadMore()">
					<translate>Load More</translate>
				</app-button>
			</div>
		</div>
	</app-modal>
</template>
