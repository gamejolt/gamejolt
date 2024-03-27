<script lang="ts">
import { ref, toRef } from 'vue';
import { RouterLink } from 'vue-router';
import { Api } from '../../../../../../_common/api/api.service';
import AppButton from '../../../../../../_common/button/AppButton.vue';
import AppCardList from '../../../../../../_common/card/list/AppCardList.vue';
import AppCardListDraggable from '../../../../../../_common/card/list/AppCardListDraggable.vue';
import AppCardListItem from '../../../../../../_common/card/list/AppCardListItem.vue';
import { $saveCommunityGameSort } from '../../../../../../_common/community/community.model';
import { GameModel } from '../../../../../../_common/game/game.model';
import AppGameThumbnailImg from '../../../../../../_common/game/thumbnail/AppGameThumbnailImg.vue';
import { showErrorGrowl } from '../../../../../../_common/growls/growls.service';
import AppJolticon from '../../../../../../_common/jolticon/AppJolticon.vue';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../../_common/route/route-component';
import { vAppTooltip } from '../../../../../../_common/tooltip/tooltip-directive';
import { $gettext } from '../../../../../../_common/translate/translate.service';
import { showCommunityLinkGameModal } from '../../../../../components/community/link-game-modal/link-game-modal.service';
import AppCommunityPerms from '../../../../../components/community/perms/AppCommunityPerms.vue';
import AppCommunitiesViewPageContainer from '../../_page-container/page-container.vue';
import { useCommunityRouteStore } from '../../view.store';

export default {
	...defineAppRouteOptions({
		deps: { params: ['id'] },
		resolver({ route }) {
			return Api.sendRequest('/web/dash/communities/games/' + route.params.id);
		},
	}),
};
</script>

<script lang="ts" setup>
const { community } = useCommunityRouteStore()!;

const maxLinkedGames = ref(10);
const hasMoreGamesToLink = ref(false);

const hasLinkedGames = toRef(() => community.value?.games && community.value?.games.length > 0);
const canLinkNewGames = toRef(
	() => community.value?.games && community.value?.games.length < maxLinkedGames.value
);

async function saveSort(sortedGames: GameModel[]) {
	if (!community.value || !community.value.games) {
		return;
	}

	// Reorder the games to see the result of the ordering right away.
	community.value.games.splice(0, community.value.games.length, ...sortedGames);

	try {
		await $saveCommunityGameSort(community.value);
	} catch (e) {
		console.error(e);
		showErrorGrowl($gettext(`Could not save game arrangement.`));
	}
}

async function onClickLinkGame() {
	if (!community.value) {
		return;
	}

	const game = await showCommunityLinkGameModal(community.value);
	if (!game) {
		return;
	}

	try {
		const payload = await Api.sendRequest(
			'/web/dash/communities/games/link',
			{
				community_id: community.value.id,
				game_id: game.id,
			},
			{ noErrorRedirect: true }
		);

		if (payload.success) {
			community.value.games = GameModel.populate(payload.community.games);
		}
	} catch (e) {
		console.error(e);
		showErrorGrowl($gettext(`Failed to link game to community.`));
	}
}

async function onClickUnlinkGame(game: GameModel) {
	if (!community.value) {
		return;
	}

	try {
		const payload = await Api.sendRequest(
			'/web/dash/communities/games/unlink',
			{
				community_id: community.value.id,
				game_id: game.id,
			},
			{ noErrorRedirect: true }
		);

		if (payload.success) {
			community.value.games = GameModel.populate(payload.community.games);
			// After unlinking a game, there is a free slot and at least one
			// more game to link.
			hasMoreGamesToLink.value = true;
		}
	} catch (e) {
		console.error(e);
		showErrorGrowl($gettext(`Failed to unlink game from community.`));
	}
}

createAppRoute({
	onResolved({ payload }) {
		hasMoreGamesToLink.value = !!payload.hasMoreGamesToLink;
		maxLinkedGames.value = payload.maxLinkedGames;
	},
});
</script>

<template>
	<AppCommunitiesViewPageContainer>
		<AppCommunityPerms v-if="community" :community="community" required="community-channels">
			<h2 class="section-header">
				{{ $gettext(`Linked Games`) }}
			</h2>

			<div class="page-help">
				<p>
					{{
						$gettext(
							`Link your games to this community. Doing so will show the game in your community sidebar as well as showing the community on your game page. Each of your games can only be linked to a single community.`
						)
					}}
				</p>
			</div>

			<div v-if="!canLinkNewGames">
				<p>
					{{
						$gettext(
							`You've reached the maximum limit of %{ count } games linked to this community.`,
							{
								count: maxLinkedGames,
							}
						)
					}}
				</p>
			</div>
			<div v-else-if="!hasMoreGamesToLink">
				<p>
					{{
						$gettext(
							`All your games are linked to a community. Remember, each game can only be linked to a single community at this time.`
						)
					}}
				</p>
			</div>
			<div v-else>
				<AppButton block primary @click="onClickLinkGame">
					{{ $gettext(`Link Game`) }}
				</AppButton>
			</div>

			<br />

			<AppCardList v-if="community && hasLinkedGames" :items="community.games" is-draggable>
				<AppCardListDraggable item-key="id" @change="saveSort">
					<template #item="{ element: game }">
						<AppCardListItem :id="`game-container-${game.id}`" :item="game">
							<div class="row">
								<div class="col-xs-6 col-xs-offset-3 col-sm-2 col-sm-offset-0">
									<RouterLink
										:to="{ name: game.getSref(), params: game.getSrefParams() }"
									>
										<AppGameThumbnailImg :game="game" />
									</RouterLink>

									<br class="visible-xs" />
								</div>
								<div class="col-xs-12 col-sm-10">
									<a
										v-app-tooltip="$gettext(`Unlink Game`)"
										class="card-remove"
										@click.stop="onClickUnlinkGame(game)"
									>
										<AppJolticon icon="remove" />
									</a>

									<div class="card-title">
										<h5>{{ game.title }}</h5>
									</div>

									<div v-if="!game.isVisible" class="card-meta card-meta-sm">
										<div
											v-app-tooltip.bottom="
												$gettext(
													`This game is unlisted and won't show in the community sidebar until you publish it.`
												)
											"
										>
											{{ $gettext(`(Unlisted)`) }}
										</div>
									</div>
								</div>
							</div>
						</AppCardListItem>
					</template>
				</AppCardListDraggable>
			</AppCardList>
		</AppCommunityPerms>
	</AppCommunitiesViewPageContainer>
</template>
