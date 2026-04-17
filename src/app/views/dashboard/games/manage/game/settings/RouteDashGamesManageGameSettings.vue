<script lang="ts">
import { computed, ref } from 'vue';

import FormGameSettings from '~app/components/forms/game/settings/FormGameSettings.vue';
import { useGameDashRouteController } from '~app/views/dashboard/games/manage/manage.store';
import { Api } from '~common/api/api.service';
import AppButton from '~common/button/AppButton.vue';
import { GameStatus } from '~common/game/game.model';
import { showSuccessGrowl } from '~common/growls/growls.service';
import { createAppRoute, defineAppRouteOptions } from '~common/route/route-component';
import { Scroll } from '~common/scroll/scroll.service';
import { useCommonStore } from '~common/store/common-store';
import AppTranslate from '~common/translate/AppTranslate.vue';
import { $gettext } from '~common/translate/translate.service';

export default {
	name: 'RouteDashGamesManageGameSettings',
	...defineAppRouteOptions({
		reloadOn: { params: ['id'] },
		resolver: ({ route }) =>
			Api.sendRequest(`/web/dash/developer/games/settings/view/${route.params.id}`),
	}),
};
</script>

<script lang="ts" setup>
const routeStore = useGameDashRouteController()!;
const { user } = useCommonStore();

const game = computed(() => routeStore.game.value!);
const isWizard = computed(() => routeStore.isWizard);

const hasCompetitionEntries = ref(false);

const isUnlisted = computed(() => game.value.status === GameStatus.Hidden);
const isCanceled = computed(() => game.value.canceled);
const isCollaborator = computed(() => user.value!.id !== game.value.developer.id);

function onSaved() {
	showSuccessGrowl($gettext('Your game settings have been saved.'), $gettext('Settings Saved'));
	Scroll.to(0);
}

createAppRoute({
	routeTitle: computed(() => {
		if (game.value) {
			return $gettext('Settings for %{ game }', {
				game: game.value.title,
			});
		}
		return null;
	}),
	onResolved({ payload }) {
		hasCompetitionEntries.value = payload.hasCompetitionEntries;
	},
});
</script>

<template>
	<div class="row">
		<div class="col-md-8">
			<template v-if="!isCollaborator">
				<FormGameSettings :model="game!" @submit="onSaved" />

				<br />
			</template>

			<div v-if="!isWizard" class="-danger-zone well fill-offset">
				<template v-if="isCollaborator">
					<h4>
						<AppTranslate>Leave Project</AppTranslate>
					</h4>

					<div class="page-help">
						<p>
							<AppTranslate>
								You are currently a collaborator on this project. Leaving the
								project will revoke all management access to the game, including any
								devlog posts you may have written for it.
							</AppTranslate>
						</p>
					</div>

					<AppButton @click="routeStore.leaveProject()">
						<AppTranslate>Leave Project</AppTranslate>
					</AppButton>
				</template>
				<template v-else>
					<template v-if="!isUnlisted">
						<h4>
							<AppTranslate>Unlist Game</AppTranslate>
						</h4>

						<div class="page-help">
							<p>
								<AppTranslate>
									Your game page is currently published. You can unlist it to hide
									it from the game listings. People with the link will still be
									able to view it.
								</AppTranslate>
							</p>
							<AppTranslate v-if="hasCompetitionEntries" tag="p">
								Warning: This will remove your game from any jams that you have
								entered it into.
							</AppTranslate>
						</div>

						<AppButton @click="routeStore.hide()">
							<AppTranslate>Unlist Game</AppTranslate>
						</AppButton>
					</template>

					<template v-if="!isCanceled">
						<h4>
							<AppTranslate>Cancel Game</AppTranslate>
						</h4>

						<div class="page-help">
							<p>
								<AppTranslate>
									Canceling your game will signal to everyone that you're no
									longer working on it. People will still be able to view the game
									page and access your published packages, but it will not show in
									game listings.
								</AppTranslate>
							</p>
							<p>
								<AppTranslate>
									If you've transitioned development off of Game Jolt, you must
									remove your game instead.
								</AppTranslate>
							</p>
						</div>

						<AppButton @click="routeStore.cancel()">
							<AppTranslate>Cancel Game</AppTranslate>
						</AppButton>
					</template>

					<h4>
						<AppTranslate>Remove Game</AppTranslate>
					</h4>

					<div class="page-help">
						<AppTranslate tag="p">
							Removing your game page will remove it from the site completely. This is
							permanent!
						</AppTranslate>
						<AppTranslate v-if="hasCompetitionEntries" tag="p">
							Warning: This will also remove your game from any jams that you have
							entered it into.
						</AppTranslate>
					</div>

					<div v-if="game.has_sales" class="alert">
						<AppTranslate>
							You can't remove games with active sales at this time.
						</AppTranslate>
					</div>

					<AppButton :disabled="game.has_sales" @click="routeStore.removeGame()">
						<AppTranslate>Remove Game</AppTranslate>
					</AppButton>
				</template>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-danger-zone
	h4:first-of-type
		margin-top: 0
</style>
