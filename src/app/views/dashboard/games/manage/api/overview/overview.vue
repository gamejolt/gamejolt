<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../../../_common/api/api.service';
import { formatDuration } from '../../../../../../../_common/filters/duration';
import { formatNumber } from '../../../../../../../_common/filters/number';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../../../_common/route/route-component';
import { AppTooltip } from '../../../../../../../_common/tooltip/tooltip-directive';
import { useGameDashRouteController } from '../../manage.store';

@Options({
	name: 'RouteDashGamesManageApiOverview',
	directives: {
		AppTooltip,
	},
})
@RouteResolver({
	deps: {},
	resolver: ({ route }) => Api.sendRequest('/web/dash/developer/games/api/' + route.params.id),
})
export default class RouteDashGamesManageApiOverview extends BaseRouteComponent {
	routeStore = setup(() => useGameDashRouteController()!);

	get game() {
		return this.routeStore.game!;
	}

	numActiveSessions = 0;
	numActiveTrophies = 0;
	numGlobalItems = 0;
	totalAchievedTrophies = 0;
	totalScores = 0;
	totalTrophyExp = 0;
	totalUsersWithScores = 0;
	totalUsersWithTrophies = 0;
	sessionStats: {
		avg: number;
		time: number;
		'user-count': number;
	} = {} as any;

	readonly formatNumber = formatNumber;
	readonly formatDuration = formatDuration;

	get routeTitle() {
		if (this.game) {
			return this.$gettextInterpolate('Game API for %{ game }', {
				game: this.game.title,
			});
		}
		return null;
	}

	routeResolved($payload: any) {
		this.sessionStats = $payload.sessionStats;

		const fields = [
			'numActiveTrophies',
			'totalTrophyExp',
			'totalAchievedTrophies',
			'totalUsersWithTrophies',
			'totalScores',
			'totalUsersWithScores',
			'numActiveSessions',
			'numGlobalItems',
		];

		fields.forEach(field => {
			(this as any)[field] = $payload[field] || 0;
		});
	}
}
</script>

<template>
	<div>
		<h2 class="section-header">
			<AppTranslate>dash.games.api.overview.heading</AppTranslate>
		</h2>

		<div class="page-help">
			<p>
				<AppTranslate>
					The Game API lets you spice up your game with scoreboards, trophies, cloud data
					storage, session logging, and more.
				</AppTranslate>
			</p>
			<p>
				<AppTranslate>
					You can check the links below to see if the community has already written an API
					library or plugin for the engine/tool/language you use. Of course, you can
					always write one yourself and share it in the forums!
				</AppTranslate>
			</p>
			<p>
				<router-link class="link-help" :to="{ name: 'landing.game-api' }">
					<AppTranslate>dash.games.api.overview.page_help_link</AppTranslate>
				</router-link>
				<br />
				<router-link
					class="link-help"
					:to="{
						name: 'forums.channels.view',
						params: { name: 'gj-game-api', sort: 'active' },
					}"
				>
					<AppTranslate>dash.games.api.overview.page_forum_link</AppTranslate>
				</router-link>
			</p>
		</div>

		<h2 class="sans-margin-bottom">
			<AppTranslate>dash.games.api.overview.sessions_heading</AppTranslate>
		</h2>

		<p class="text-muted small">
			<AppTranslate>dash.games.api.overview.sessions_help</AppTranslate>
		</p>

		<div class="well fill-offset full-bleed-xs sans-margin-bottom">
			<div class="row">
				<div class="col-xs-6 col-sm-3">
					<div class="stat-big stat-big-smaller sans-margin-bottom text-center">
						<div class="stat-big-label">
							<AppTranslate>dash.games.api.overview.sessions_active_label</AppTranslate>
						</div>
						<div class="stat-big-digit">
							{{ formatNumber(numActiveSessions) }}
						</div>
					</div>
				</div>
				<div class="col-xs-6 col-sm-3">
					<div class="stat-big stat-big-smaller sans-margin-bottom text-center">
						<div class="stat-big-label">
							<AppTranslate>dash.games.api.overview.sessions_time_label</AppTranslate>
						</div>
						<div class="stat-big-digit">
							{{ formatDuration(sessionStats.time || 0) }}
						</div>
					</div>
				</div>
				<div class="col-xs-6 col-sm-3">
					<div class="stat-big stat-big-smaller sans-margin-bottom text-center">
						<div class="stat-big-label">
							<AppTranslate>dash.games.api.overview.sessions_avg_label</AppTranslate>
						</div>
						<div class="stat-big-digit">
							{{ formatDuration(sessionStats.avg || 0) }}
						</div>
					</div>
				</div>
				<div class="col-xs-6 col-sm-3">
					<div class="stat-big stat-big-smaller sans-margin-bottom text-center">
						<div class="stat-big-label">
							<AppTranslate>dash.games.api.overview.sessions_users_label</AppTranslate>
						</div>
						<div class="stat-big-digit">
							{{ formatNumber(sessionStats['user-count']) }}
						</div>
					</div>
				</div>
			</div>
		</div>

		<h2>
			<router-link
				class="link-unstyled"
				:to="{ name: 'dash.games.manage.api.trophies.list' }"
			>
				<AppTranslate>dash.games.api.overview.trophies_heading</AppTranslate>
			</router-link>
		</h2>

		<div class="well fill-offset full-bleed-xs sans-margin-bottom">
			<div class="row">
				<div class="col-xs-6 col-sm-3">
					<div class="stat-big stat-big-smaller sans-margin-bottom text-center">
						<div class="stat-big-label">
							<AppTranslate>dash.games.api.overview.trophies_label</AppTranslate>
						</div>
						<div class="stat-big-digit">
							{{ formatNumber(numActiveTrophies) }}
						</div>
					</div>
				</div>
				<div class="col-xs-6 col-sm-3">
					<div class="stat-big stat-big-smaller sans-margin-bottom text-center">
						<div class="stat-big-label">
							<AppTranslate>dash.games.api.overview.trophies_exp_label</AppTranslate>
							<AppJolticon
								v-app-tooltip.touchable="
									$gettext(`dash.games.api.overview.trophies_exp_tooltip`)
								"
								icon="help-circle"
							/>
						</div>
						<div class="stat-big-digit">
							<template v-if="!numActiveTrophies">
								<AppTranslate>dash.games.api.overview.na</AppTranslate>
							</template>
							<template v-else>
								{{ formatNumber(totalTrophyExp) }}
								<AppTranslate>leveling.exp</AppTranslate>
							</template>
						</div>
					</div>
				</div>
				<div class="col-xs-6 col-sm-3">
					<div class="stat-big stat-big-smaller sans-margin-bottom text-center">
						<div class="stat-big-label">
							<AppTranslate>dash.games.api.overview.trophies_achieved_label</AppTranslate>
						</div>
						<div class="stat-big-digit">
							{{ formatNumber(totalAchievedTrophies) }}
						</div>
					</div>
				</div>
				<div class="col-xs-6 col-sm-3">
					<div class="stat-big stat-big-smaller sans-margin-bottom text-center">
						<div class="stat-big-label">
							<AppTranslate>dash.games.api.overview.trophies_users_label</AppTranslate>
						</div>
						<div class="stat-big-digit">
							{{ formatNumber(totalUsersWithTrophies) }}
						</div>
					</div>
				</div>
			</div>
		</div>

		<h2>
			<router-link
				class="link-unstyled"
				:to="{ name: 'dash.games.manage.api.scoreboards.list' }"
			>
				<AppTranslate>dash.games.api.overview.scores_heading</AppTranslate>
			</router-link>
		</h2>

		<div class="well fill-offset full-bleed-xs sans-margin-bottom">
			<div class="row">
				<div class="col-xs-6 col-sm-3">
					<div class="stat-big stat-big-smaller sans-margin-bottom text-center">
						<div class="stat-big-label">
							<AppTranslate>dash.games.api.overview.scores_label</AppTranslate>
							<AppJolticon
								v-app-tooltip.touchable="
									$gettext(`dash.games.api.overview.scores_tooltip`)
								"
								icon="help-circle"
							/>
						</div>
						<div class="stat-big-digit">
							{{ formatNumber(totalScores) }}
						</div>
					</div>
				</div>
				<div class="col-xs-6 col-sm-3">
					<div class="stat-big stat-big-smaller sans-margin-bottom text-center">
						<div class="stat-big-label">
							<AppTranslate>dash.games.api.overview.scores_users_label</AppTranslate>
							<AppJolticon
								v-app-tooltip.touchable="
									$gettext(`dash.games.api.overview.scores_users_tooltip`)
								"
								icon="help-circle"
							/>
						</div>
						<div class="stat-big-digit">
							{{ formatNumber(totalUsersWithScores) }}
						</div>
					</div>
				</div>
			</div>
		</div>

		<h2>
			<router-link
				class="link-unstyled"
				:to="{ name: 'dash.games.manage.api.data-storage.items.list' }"
			>
				<AppTranslate>dash.games.api.overview.data_heading</AppTranslate>
			</router-link>
		</h2>

		<div class="well fill-offset full-bleed-xs sans-margin-bottom">
			<div class="row">
				<div class="col-xs-6 col-sm-3">
					<div class="stat-big stat-big-smaller sans-margin-bottom text-center">
						<div class="stat-big-label">
							<AppTranslate>dash.games.api.overview.data_items_label</AppTranslate>
							<AppJolticon
								v-app-tooltip.touchable="
									$gettext(`dash.games.api.overview.data_items_tooltip`)
								"
								icon="help-circle"
							/>
						</div>
						<div class="stat-big-digit">
							{{ formatNumber(numGlobalItems) }}
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
