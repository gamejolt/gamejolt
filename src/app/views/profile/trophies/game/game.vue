<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../_common/api/api.service';
import { GameModel } from '../../../../../_common/game/game.model';
import AppGameThumbnail from '../../../../../_common/game/thumbnail/AppGameThumbnail.vue';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../../_common/route/legacy-route-component';
import { useCommonStore } from '../../../../../_common/store/common-store';
import AppTrophyCard from '../../../../../_common/trophy/AppTrophyCard.vue';
import AppTrophyCompletion from '../../../../../_common/trophy/AppTrophyCompletion.vue';
import AppTrophyListPaged from '../../../../../_common/trophy/list/AppTrophyListPaged.vue';
import { populateTrophies } from '../../../../../_common/user/trophy/trophy-utils';
import { UserBaseTrophyModel } from '../../../../../_common/user/trophy/user-base-trophy.model';
import { RouteLocationRedirect } from '../../../../../utils/router';
import { useProfileRouteStore } from '../../RouteProfile.vue';

type CompletionData = {
	experience: number;
	totalCount: number;
	achievedCount: number;
};

@Options({
	name: 'RouteProfileTrophiesGame',
	components: {
		AppTrophyCard,
		AppTrophyListPaged,
		AppTrophyCompletion,
		AppGameThumbnail,
	},
})
@OptionsForLegacyRoute({
	reloadOn: { params: ['id'] },
	async resolver({ route }) {
		const payload = await Api.sendRequest(
			'/web/profile/trophies/game/@' + route.params.username + '/' + route.params.id
		);

		// If the game doesn't have any trophies or the user has not achieved any for this game, redirect to their overview.
		// This is to prevent showing an empty game page with no entry in the left nav.
		if (!payload.trophies || payload.trophies.length === 0) {
			const redirect = new RouteLocationRedirect({
				name: 'profile.trophies',
			});
			return redirect;
		}

		return payload;
	},
})
export default class RouteProfileTrophiesGame extends LegacyRouteComponent {
	routeStore = setup(() => useProfileRouteStore()!);
	commonStore = setup(() => useCommonStore());

	game: GameModel | null = null;
	trophies: UserBaseTrophyModel[] = [];
	completion: CompletionData | null = null;

	get user() {
		return this.routeStore.user;
	}

	get app() {
		return this.commonStore;
	}

	get routeTitle() {
		if (this.user && this.game) {
			return this.$gettext(`@%{ user }'s achieved Trophies for the game %{ title }`, {
				user: this.user.username,
				title: this.game.title,
			});
		}
		return null;
	}

	get listLoadMoreUrl() {
		if (this.game) {
			return `/web/profile/trophies/game/@${this.user!.username}/${this.game.id}`;
		}
		return undefined;
	}

	get isLoggedInUser() {
		return this.user && this.app.user && this.app.user.id === this.user.id;
	}

	routeResolved(payload: any) {
		this.game = new GameModel(payload.game);
		if (payload.trophies) {
			this.trophies = populateTrophies(payload.trophies);
		}
		if (payload.completion) {
			this.completion = payload.completion;
		}
	}
}
</script>

<template>
	<div>
		<div v-if="game" class="row">
			<div class="col-sm-7">
				<AppTrophyCompletion
					v-if="completion"
					class="-completion"
					:total="completion.totalCount"
					:achieved="completion.achievedCount"
					:experience="completion.experience"
					:is-logged-in-user="isLoggedInUser"
				/>
				<p>
					<AppButton :to="game.routeLocation">
						<AppTranslate>View Game</AppTranslate>
					</AppButton>
					<AppButton
						:to="{
							name: 'discover.games.view.trophies.list',
							params: game.getSrefParams(),
						}"
					>
						<AppTranslate>View All Trophies</AppTranslate>
					</AppButton>
				</p>
			</div>
			<div class="col-sm-5 hidden-xs">
				<AppGameThumbnail class="-game-thumbnail" :game="game" />
			</div>
		</div>
		<hr class="hidden-xs" />
		<AppTrophyListPaged :initial-trophies="trophies" :url="listLoadMoreUrl" />
	</div>
</template>

<style lang="stylus" scoped>
.-game-thumbnail
	margin-bottom: 0
</style>
