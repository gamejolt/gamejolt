<script lang="ts">
import { computed, ref } from 'vue';

import { Api } from '../../../../../_common/api/api.service';
import AppButton from '../../../../../_common/button/AppButton.vue';
import { GameModel } from '../../../../../_common/game/game.model';
import AppGameThumbnail from '../../../../../_common/game/thumbnail/AppGameThumbnail.vue';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../_common/route/route-component';
import { useCommonStore } from '../../../../../_common/store/common-store';
import AppTranslate from '../../../../../_common/translate/AppTranslate.vue';
import { $gettext } from '../../../../../_common/translate/translate.service';
import AppTrophyCompletion from '../../../../../_common/trophy/AppTrophyCompletion.vue';
import AppTrophyListPaged from '../../../../../_common/trophy/list/AppTrophyListPaged.vue';
import { populateTrophies } from '../../../../../_common/user/trophy/trophy-utils';
import { UserBaseTrophyModel } from '../../../../../_common/user/trophy/user-base-trophy.model';
import { RouteLocationRedirect } from '../../../../../utils/router';
import { useProfileRouteStore } from '../../RouteProfile.vue';

export default {
	name: 'RouteProfileTrophiesGame',
	...defineAppRouteOptions({
		reloadOn: { params: ['id'] },
		async resolver({ route }) {
			const payload = await Api.sendRequest(
				'/web/profile/trophies/game/@' + route.params.username + '/' + route.params.id
			);

			if (!payload.trophies || payload.trophies.length === 0) {
				const redirect = new RouteLocationRedirect({
					name: 'profile.trophies',
				});
				return redirect;
			}

			return payload;
		},
	}),
};
</script>

<script lang="ts" setup>
type CompletionData = {
	experience: number;
	totalCount: number;
	achievedCount: number;
};

const { user } = useProfileRouteStore()!;
const { user: appUser } = useCommonStore();

const game = ref<GameModel | null>(null);
const trophies = ref<UserBaseTrophyModel[]>([]);
const completion = ref<CompletionData | null>(null);

const listLoadMoreUrl = computed(() => {
	if (game.value) {
		return `/web/profile/trophies/game/@${user.value!.username}/${game.value.id}`;
	}
	return undefined;
});

const isLoggedInUser = computed(
	() => user.value && appUser.value && appUser.value.id === user.value.id
);

createAppRoute({
	routeTitle: computed(() => {
		if (user.value && game.value) {
			return $gettext(`@%{ user }'s achieved Trophies for the game %{ title }`, {
				user: user.value.username,
				title: game.value.title,
			});
		}
		return null;
	}),
	onResolved({ payload }) {
		game.value = new GameModel(payload.game);
		if (payload.trophies) {
			trophies.value = populateTrophies(payload.trophies);
		}
		if (payload.completion) {
			completion.value = payload.completion;
		}
	},
});
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
					:is-logged-in-user="!!isLoggedInUser"
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
		<AppTrophyListPaged :initial-trophies="trophies" :url="listLoadMoreUrl ?? ''" />
	</div>
</template>

<style lang="stylus" scoped>
.-game-thumbnail
	margin-bottom: 0
</style>
