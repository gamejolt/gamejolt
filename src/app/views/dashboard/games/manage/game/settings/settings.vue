<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../../../_common/api/api.service';
import AppExpand from '../../../../../../../_common/expand/AppExpand.vue';
import { GameStatus } from '../../../../../../../_common/game/game.model';
import { showSuccessGrowl } from '../../../../../../../_common/growls/growls.service';
import {
	BaseRouteComponent,
	OptionsForRoute,
} from '../../../../../../../_common/route/route-component';
import { Scroll } from '../../../../../../../_common/scroll/scroll.service';
import { useCommonStore } from '../../../../../../../_common/store/common-store';
import FormGameSettings from '../../../../../../components/forms/game/settings/settings.vue';
import { useGameDashRouteController } from '../../manage.store';

@Options({
	name: 'RouteDashGamesManageGameSettings',
	components: {
		FormGameSettings,
		AppExpand,
	},
})
@OptionsForRoute({
	deps: { params: ['id'] },
	resolver: ({ route }) =>
		Api.sendRequest(`/web/dash/developer/games/settings/view/${route.params.id}`),
})
export default class RouteDashGamesManageGameSettings extends BaseRouteComponent {
	routeStore = setup(() => useGameDashRouteController()!);
	commonStore = setup(() => useCommonStore());

	get user() {
		return this.commonStore.user;
	}

	get game() {
		return this.routeStore.game!;
	}

	get isWizard() {
		return this.routeStore.isWizard;
	}

	hasCompetitionEntries = false;

	get routeTitle() {
		if (this.game) {
			return this.$gettextInterpolate('Settings for %{ game }', {
				game: this.game.title,
			});
		}
		return null;
	}

	get isUnlisted() {
		return this.game.status === GameStatus.Hidden;
	}

	get isCanceled() {
		return this.game.canceled;
	}

	get isCollaborator() {
		return this.user!.id !== this.game.developer.id;
	}

	routeResolved($payload: any) {
		this.hasCompetitionEntries = $payload.hasCompetitionEntries;
	}

	onSaved() {
		showSuccessGrowl(
			this.$gettext('Your game settings have been saved.'),
			this.$gettext('Settings Saved')
		);
		Scroll.to(0);
	}
}
</script>

<template>
	<div class="row">
		<div class="col-md-8">
			<template v-if="!isCollaborator">
				<FormGameSettings :model="game" @submit="onSaved" />

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
							<p v-if="hasCompetitionEntries" v-translate>
								<b>Warning:</b>
								This will remove your game from any jams that you have entered it
								into.
							</p>
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
						<p v-translate>
							Removing your game page will remove it from the site completely.
							<b>This is permanent!</b>
						</p>
						<p v-if="hasCompetitionEntries" v-translate>
							<b>Warning:</b>
							This will also remove your game from any jams that you have entered it
							into.
						</p>
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
