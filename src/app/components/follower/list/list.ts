import View from '!view!./list.html?style=./list.styl';
import { AppTrackEvent } from 'game-jolt-frontend-lib/components/analytics/track-event.directive.vue';
import { AppUserCard } from 'game-jolt-frontend-lib/components/user/card/card';
import { AppUserCardPlaceholder } from 'game-jolt-frontend-lib/components/user/card/placeholder/placeholder';
import { AppLoading } from 'game-jolt-frontend-lib/vue/components/loading/loading';
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { Api } from './../../../../lib/gj-lib-client/components/api/api.service';
import { Screen } from './../../../../lib/gj-lib-client/components/screen/screen-service';
import { User } from './../../../../lib/gj-lib-client/components/user/user.model';

@View
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
export class AppFollowerList extends Vue {
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
