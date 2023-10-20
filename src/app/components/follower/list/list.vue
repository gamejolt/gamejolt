<script lang="ts">
import { Options, Prop, Vue, Watch } from 'vue-property-decorator';
import { Api } from '../../../../_common/api/api.service';
import AppLoading from '../../../../_common/loading/AppLoading.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import AppUserCard from '../../../../_common/user/card/AppUserCard.vue';
import AppUserCardPlaceholder from '../../../../_common/user/card/AppUserCardPlaceholder.vue';
import { UserModel } from '../../../../_common/user/user.model';

@Options({
	components: {
		AppUserCard,
		AppUserCardPlaceholder,
		AppLoading,
	},
})
export default class AppFollowerList extends Vue {
	@Prop(String)
	url!: string;

	@Prop(Number)
	count!: number;

	@Prop(Array)
	initialUsers!: UserModel[];

	users: UserModel[] = [];
	page = 1;
	isLoading = false;
	reachedEnd = false;

	@Watch('initialUsers', { immediate: true })
	onInitialUsersChange(users: UserModel[]) {
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
		return UserModel.populate(payload.users);
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
</script>

<template>
	<div class="follower-list">
		<div v-if="!users.length" class="-list">
			<div v-for="i of placeholderCount" :key="i">
				<AppUserCardPlaceholder />
			</div>
		</div>
		<template v-else>
			<div class="-list">
				<div v-for="_user of users" :key="_user.id">
					<AppUserCard :user="_user" elevate />
				</div>
			</div>

			<AppLoading v-if="isLoading" centered />
			<div v-else-if="shouldShowLoadMore" class="page-cut">
				<AppButton v-app-track-event="`profile-followers:more`" trans @click="loadMore()">
					<AppTranslate>Load More</AppTranslate>
				</AppButton>
			</div>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
.-list
	display: grid
	grid-template-columns: repeat(auto-fill, minmax(250px, 1fr))
	grid-gap: 0px 16px
</style>
