<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../../../../../_common/api/api.service';
import { GameScoreTableModel } from '../../../../../../../../../_common/game/score-table/score-table.model';
import { showSuccessGrowl } from '../../../../../../../../../_common/growls/growls.service';
import { showModalConfirm } from '../../../../../../../../../_common/modal/confirm/confirm-service';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../../../../../../_common/route/legacy-route-component';
import { vAppTooltip } from '../../../../../../../../../_common/tooltip/tooltip-directive';
import { UserGameScoreModel } from '../../../../../../../../../_common/user/game-score/game-score.model';
import { UserModel } from '../../../../../../../../../_common/user/user.model';
import { useGameDashRouteController } from '../../../../manage.store';
import AppManageGameListScores from '../../_list-scores/list-scores.vue';

@Options({
	name: 'RouteDashGamesManageApiScoreboardsScoresUser',
	components: {
		AppManageGameListScores,
	},
	directives: {
		AppTooltip: vAppTooltip,
	},
})
@OptionsForLegacyRoute({
	deps: { params: ['table', 'user'] },
	resolver: ({ route }) =>
		Api.sendRequest(
			'/web/dash/developer/games/api/scores/list-table-user-scores/' +
				route.params.id +
				'/' +
				route.params.table +
				'/' +
				route.params.user
		),
})
export default class RouteDashGamesManageApiScoreboardsScoresUser extends LegacyRouteComponent {
	routeStore = setup(() => useGameDashRouteController()!);

	get game() {
		return this.routeStore.game!;
	}

	user: UserModel = null as any;
	scoreTable: GameScoreTableModel = null as any;
	scores: UserGameScoreModel[] = [];

	get routeTitle() {
		if (this.game && this.user && this.scoreTable) {
			return this.$gettext('View Scores for %{ user } on %{ table } - %{ game }', {
				game: this.game.title,
				user: this.user.display_name,
				table: this.scoreTable.name,
			});
		}
		return null;
	}

	routeResolved($payload: any) {
		this.user = new UserModel($payload.user);
		this.scoreTable = new GameScoreTableModel($payload.scoreTable);
		this.scores = UserGameScoreModel.populate($payload.scores);
	}

	onScoreRemoved(score: UserGameScoreModel) {
		const index = this.scores.findIndex(i => i.id === score.id);
		if (index !== -1) {
			this.scores.splice(index, 1);
		}
	}

	async removeAll() {
		const result = await showModalConfirm(
			this.$gettext(
				`Are you sure you want to remove all of the user's scores from this scoreboard?`
			)
		);

		if (!result) {
			return;
		}

		await this.scoreTable.$removeAllUserScores(this.user.id);

		showSuccessGrowl(
			this.$gettext(`All of the user's scores have been removed from the scoreboard.`),
			this.$gettext(`Scores Removed`)
		);

		this.$router.push({
			name: 'dash.games.manage.api.scoreboards.scores.list',
			params: {
				table: this.scoreTable.id + '',
			},
		});
	}
}
</script>

<template>
	<div v-if="isRouteBootstrapped">
		<h2 class="section-header">
			<div class="section-header-controls">
				<AppButton
					v-app-tooltip="$gettext(`Remove All Scores`)"
					sparse
					icon="remove"
					@click="removeAll"
				/>
			</div>

			<!--
				TODO: this translation block is horrible but im not sure
				how we want to solve it. Can we avoid splitting it to like 5 lines while
				keeping the router links somehow.
			-->
			<AppTranslate>View scores</AppTranslate>
			{{ ' ' }}
			<small>
				<AppTranslate>for user</AppTranslate>
				{{ ' ' }}
				<router-link class="link-unstyled" :to="user.url">
					<strong>{{ user.display_name }}</strong>
				</router-link>
				{{ ' ' }}
				<AppTranslate>on table</AppTranslate>
				{{ ' ' }}
				<router-link
					class="link-unstyled"
					:to="{
						name: 'dash.games.manage.api.scoreboards.scores.list',
						params: { table: scoreTable.id },
					}"
				>
					<strong>{{ scoreTable.name }}</strong>
				</router-link>
			</small>
		</h2>

		<div v-if="!scores.length" class="alert alert-notice anim-fade-in">
			<p>
				<AppTranslate>The user has no scores on this scoreboard.</AppTranslate>
			</p>
		</div>

		<AppManageGameListScores
			v-if="scores.length"
			:score-table="scoreTable"
			:scores="scores"
			:is-for-user="true"
			@remove="onScoreRemoved"
		/>
	</div>
</template>
