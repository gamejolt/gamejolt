import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import { BaseModal } from 'game-jolt-frontend-lib/components/modal/base';
import { User } from 'game-jolt-frontend-lib/components/user/user.model';
import AppLoading from 'game-jolt-frontend-lib/vue/components/loading/loading.vue'
import { number } from 'game-jolt-frontend-lib/vue/filters/number';
import { Component, Prop } from 'vue-property-decorator';
import AppUserList from '../../../user/list/list.vue'

const UsersPerPage = 20;

@Component({
	components: {
		AppLoading,
		AppUserList,
	},
})
export default class AppSupportersModal extends BaseModal {
	@Prop(Game)
	game!: Game;

	@Prop(Number)
	supporterCount!: number;

	readonly number = number;

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
