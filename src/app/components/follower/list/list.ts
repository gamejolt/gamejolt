import { AppTrackEvent } from '../../../../_common/analytics/track-event.directive';
import { Api } from '../../../../_common/api/api.service';
import { Screen } from '../../../../_common/screen/screen-service';
import AppUserCard from '../../../../_common/user/card/card.vue';
import AppUserCardPlaceholder from '../../../../_common/user/card/placeholder/placeholder.vue';
import { User } from '../../../../_common/user/user.model';
import AppLoading from '../../../../_common/loading/loading.vue';
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';

@Component({
	components: {
		AppUserCard,
		AppUserCardPlaceholder,
		AppLoading,
	},
	directives: {
		AppTrackEvent,
	},
})
export default class AppFollowerList extends Vue {
	@Prop(String)
	url!: string;

	@Prop(Number)
	count!: number;

	@Prop(Array)
	initialUsers!: User[];

	users: User[] = [];
	page = 1;
	isLoading = false;
	reachedEnd = false;

	@Watch('initialUsers', { immediate: true })
	onInitialUsersChange(users: User[]) {
		// If the initial users changed, it means that the route was bootstrapped. Gotta clear
		// everything out again.

		this.users = [];
		this.page = 1;
		this.reachedEnd = false;

		if (users) {
			this.users.push(...users);
		}
	}

	get placeholderCount() {
		// 2 rows, except for xs.
		if (Screen.isXs) {
			return 1;
		} else if (Screen.isSm) {
			return 4;
		} else if (Screen.isMd) {
			return 6;
		}
		return 8;
	}

	get shouldShowLoadMore() {
		return this.users.length < this.count && !this.reachedEnd;
	}

	async loadPage() {
		let url = this.url;

		if (this.page) {
			url += `?page=${this.page}`;
		}

		const payload = await Api.sendRequest(url);
		return User.populate(payload.users);
	}

	async loadMore() {
		if (this.isLoading) {
			return;
		}

		this.page++;
		this.isLoading = true;

		const pageUsers = await this.loadPage();
		if (!pageUsers || !pageUsers.length) {
			this.page--;
			this.reachedEnd = true;
		} else {
			this.users.push(...pageUsers);
		}

		this.isLoading = false;
	}
}
