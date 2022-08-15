<script lang="ts">
import { Options, Prop, Vue, Watch } from 'vue-property-decorator';
import { Api } from '../../../../../_common/api/api.service';
import AppLoading from '../../../../../_common/loading/AppLoading.vue';
import { Screen } from '../../../../../_common/screen/screen-service';
import { populateTrophies } from '../../../../../_common/user/trophy/trophy-utils';
import { UserBaseTrophy } from '../../../../../_common/user/trophy/user-base-trophy.model';
import AppTrophyCard from '../../card/card.vue';

const PAGE_SIZE = 12;

@Options({
	components: {
		AppTrophyCard,
		AppLoading,
	},
})
export default class AppTrophyListPaged extends Vue {
	@Prop(String)
	url!: string;

	@Prop(Array)
	initialTrophies!: UserBaseTrophy[];

	trophies: UserBaseTrophy[] = [];
	isLoading = false;
	reachedEnd = false;

	@Watch('initialTrophies', { immediate: true })
	onInitialTrophiesChange(trophies: UserBaseTrophy[]) {
		// If the initial trophies changed, it means that the route was bootstrapped. Gotta clear
		// everything out again.

		this.trophies = [];
		this.reachedEnd = false;

		if (trophies) {
			this.trophies.push(...trophies);
		}

		if (this.trophies.length < PAGE_SIZE) {
			this.reachedEnd = true;
		}
	}

	get placeholderCount() {
		// 2 rows, except for xs.
		if (Screen.isXs) {
			return 1;
		} else if (Screen.isSm) {
			return 4;
		}
		return 6;
	}

	get shouldShowLoadMore() {
		return !this.reachedEnd;
	}

	async loadNext() {
		let url = this.url;
		if (this.trophies.length > 0) {
			const lastTrophy = this.trophies[this.trophies.length - 1];
			url += `?scroll=${lastTrophy.logged_on}`;
		}

		const payload = await Api.sendRequest(url);
		const trophies = populateTrophies(payload.trophies);
		return trophies;
	}

	async onClickLoadMore() {
		if (this.isLoading) {
			return;
		}

		this.isLoading = true;
		const nextTrophies = await this.loadNext();
		if (!nextTrophies || !nextTrophies.length) {
			this.reachedEnd = true;
		} else {
			this.trophies.push(...nextTrophies);
			if (nextTrophies.length < PAGE_SIZE) {
				this.reachedEnd = true;
			}
		}

		this.isLoading = false;
	}
}
</script>

<template>
	<div>
		<div v-if="!trophies.length" class="row">
			<div v-for="i of placeholderCount" :key="i" class="-item col-sm-6 col-md-4 col-lg-4">
				<!-- TODO: Make real placeholder -->
				placeholder
			</div>
		</div>
		<template v-else>
			<div class="row">
				<div
					v-for="trophy of trophies"
					:key="trophy.key"
					class="-item col-sm-6 col-md-4 col-lg-4"
				>
					<AppTrophyCard :user-trophy="trophy" />
				</div>
			</div>

			<AppLoading v-if="isLoading" centered />
			<div v-else-if="shouldShowLoadMore" class="page-cut">
				<AppButton
					v-app-track-event="`profile-trophies:more`"
					trans
					@click="onClickLoadMore()"
				>
					<AppTranslate>Load More</AppTranslate>
				</AppButton>
			</div>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
.-item
	@media $media-sm
		&:nth-child(2n+1)
			clear: both

	@media $media-md
		&:nth-child(3n+1)
			clear: both

	@media $media-lg
		&:nth-child(3n+1)
			clear: both
</style>
