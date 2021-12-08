import { Options, Prop } from 'vue-property-decorator';
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
export default class AppSupportersModal extends BaseModal {
	@Prop(Game)
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
