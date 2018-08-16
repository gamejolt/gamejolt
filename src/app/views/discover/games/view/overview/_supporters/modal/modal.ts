import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./modal.html';

import { BaseModal } from '../../../../../../../../lib/gj-lib-client/components/modal/base';
import { AppLoading } from '../../../../../../../../lib/gj-lib-client/vue/components/loading/loading';
import { User } from '../../../../../../../../lib/gj-lib-client/components/user/user.model';
import { Api } from '../../../../../../../../lib/gj-lib-client/components/api/api.service';
import { RouteState, RouteStore } from '../../../view.store';

const UsersPerPage = 20;

@View
@Component({
	components: {
		AppLoading,
	},
})
export default class AppSupportersModal extends BaseModal {
	@Prop(Array) supporters: User[];
	@Prop(Number) supporterCount: number;

	@RouteState game: RouteStore['game'];

	reachedEnd = false;
	currentPage = 1; // start with the first page already loaded
	isLoading = false;
	users: User[] = [];

	get title() {
		return this.$gettextInterpolate('%{ amount } people support this game', {
			amount: this.supporterCount,
		});
	}

	get shouldShowLoadMore() {
		return !this.isLoading && !this.reachedEnd;
	}

	async created() {
		this.users = this.supporters;
		this.reachedEnd = this.users.length === this.supporterCount;
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
