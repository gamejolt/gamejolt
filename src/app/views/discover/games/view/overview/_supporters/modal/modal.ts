import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./modal.html';

import { BaseModal } from '../../../../../../../../lib/gj-lib-client/components/modal/base';
import { AppLoading } from '../../../../../../../../lib/gj-lib-client/vue/components/loading/loading';
import { User } from '../../../../../../../../lib/gj-lib-client/components/user/user.model';
import { Api } from '../../../../../../../../lib/gj-lib-client/components/api/api.service';
import { RouteState, RouteStore } from '../../../view.store';

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

	static readonly USERS_PER_PAGE = 20;

	reachedEnd = false;
	currentPage = 1; // start with the first page already loaded
	loading = false;
	users: User[] = [];

	get title() {
		return this.$gettextInterpolate('%{ amount } people support this game', {
			amount: this.supporterCount,
		});
	}

	get shouldShowLoadMore() {
		return !this.loading && !this.reachedEnd;
	}

	async created() {
		this.users = this.supporters;
		this.reachedEnd = this.users.length === this.supporterCount;
	}

	async loadMore() {
		this.currentPage++;
		this._loadPage();
	}

	private async _loadPage() {
		this.loading = true;
		let requestUrl = '/web/discover/games/supporters/' + this.game.id + '/' + this.currentPage;
		const payload = await Api.sendRequest(requestUrl);
		if (payload.success) {
			const newUsers = User.populate(payload.users);
			this.users = this.users.concat(newUsers);
			if (newUsers.length < AppSupportersModal.USERS_PER_PAGE) {
				this.reachedEnd = true;
			}
		} else {
			this.currentPage--;
		}
		this.loading = false;
	}
}
