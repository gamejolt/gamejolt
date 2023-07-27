<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../../../_common/api/api.service';
import { formatDuration } from '../../../../../../../_common/filters/duration';
import { formatNumber } from '../../../../../../../_common/filters/number';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../../../../_common/route/legacy-route-component';
import { vAppTooltip } from '../../../../../../../_common/tooltip/tooltip-directive';
import { useGameDashRouteController } from '../../manage.store';

@Options({
	name: 'RouteDashGamesManageApiOverview',
	directives: {
		AppTooltip: vAppTooltip,
	},
})
@OptionsForLegacyRoute({
	deps: {},
	resolver: ({ route }) => Api.sendRequest('/web/dash/developer/games/api/' + route.params.id),
})
export default class RouteDashGamesManageApiOverview extends LegacyRouteComponent {
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
			<AppTranslate>Game API Overview</AppTranslate>
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
					<AppTranslate>Learn more about the Game API...</AppTranslate>
				</router-link>
				<br />
				<router-link
					class="link-help"
					:to="{
						name: 'forums.channels.view',
						params: { name: 'gj-game-api', sort: 'archived' },
					}"
				>
					<AppTranslate>Find help in the API forums...</AppTranslate>
				</router-link>
			</p>
		</div>

		<h2 class="sans-margin-bottom">
			<AppTranslate translate-comment="This refers to game API sessions"
				>Sessions</AppTranslate
			>
		</h2>

		<p class="text-muted small">
			<AppTranslate>Sessions show you who's playing your game and for how long.</AppTranslate>
		</p>

		<div class="well fill-offset full-bleed-xs sans-margin-bottom">
			<div class="row">
				<div class="col-xs-6 col-sm-3">
					<div class="stat-big stat-big-smaller sans-margin-bottom text-center">
						<div class="stat-big-label">
							<AppTranslate translate-comment="This refers to game API sessions">
								Active Sessions
							</AppTranslate>
						</div>
						<div class="stat-big-digit">
							{{ formatNumber(numActiveSessions) }}
						</div>
					</div>
				</div>
				<div class="col-xs-6 col-sm-3">
					<div class="stat-big stat-big-smaller sans-margin-bottom text-center">
						<div class="stat-big-label">
							<AppTranslate
								translate-comment="This refers to the total session time logged for a game"
							>
								Total Time
							</AppTranslate>
						</div>
						<div class="stat-big-digit">
							{{ formatDuration(sessionStats.time || 0) }}
						</div>
					</div>
				</div>
				<div class="col-xs-6 col-sm-3">
					<div class="stat-big stat-big-smaller sans-margin-bottom text-center">
						<div class="stat-big-label">
							<AppTranslate translate-comment="This refers to game API sessions">
								Avg. Session Time
							</AppTranslate>
						</div>
						<div class="stat-big-digit">
							{{ formatDuration(sessionStats.avg || 0) }}
						</div>
					</div>
				</div>
				<div class="col-xs-6 col-sm-3">
					<div class="stat-big stat-big-smaller sans-margin-bottom text-center">
						<div class="stat-big-label">
							<AppTranslate tarnslate-comment="This refers to game API sessions">
								Users w/ Sessions
							</AppTranslate>
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
				<AppTranslate translate-comment="This refers to game trophies">
					Trophies
				</AppTranslate>
			</router-link>
		</h2>

		<div class="well fill-offset full-bleed-xs sans-margin-bottom">
			<div class="row">
				<div class="col-xs-6 col-sm-3">
					<div class="stat-big stat-big-smaller sans-margin-bottom text-center">
						<div class="stat-big-label">
							<AppTranslate translate-comment="This refers to game trophies">
								Trophies
							</AppTranslate>
						</div>
						<div class="stat-big-digit">
							{{ formatNumber(numActiveTrophies) }}
						</div>
					</div>
				</div>
				<div class="col-xs-6 col-sm-3">
					<div class="stat-big stat-big-smaller sans-margin-bottom text-center">
						<div class="stat-big-label">
							<AppTranslate translate-comment="This refers to game trophies">
								Trophy EXP
							</AppTranslate>
							{{ ' ' }}
							<AppJolticon
								v-app-tooltip.touchable="
									$gettext(`The total awardable EXP for trophies in your game.`)
								"
								icon="help-circle"
							/>
						</div>
						<div class="stat-big-digit">
							<template v-if="!numActiveTrophies">
								<AppTranslate>N/A</AppTranslate>
							</template>
							<template v-else>
								{{ formatNumber(totalTrophyExp) + ' ' }}
								<AppTranslate
									translate-comment="As in abbreviation for experience. If one doesnt exist for your language, or if its not a short word just leave it as EXP."
								>
									EXP
								</AppTranslate>
							</template>
						</div>
					</div>
				</div>
				<div class="col-xs-6 col-sm-3">
					<div class="stat-big stat-big-smaller sans-margin-bottom text-center">
						<div class="stat-big-label">
							<AppTranslate translate-comment="This refers to game trophies">
								Trophies Achieved
							</AppTranslate>
						</div>
						<div class="stat-big-digit">
							{{ formatNumber(totalAchievedTrophies) }}
						</div>
					</div>
				</div>
				<div class="col-xs-6 col-sm-3">
					<div class="stat-big stat-big-smaller sans-margin-bottom text-center">
						<div class="stat-big-label">
							<AppTranslate translate-comment="This refers to game trophies">
								Users w/ Trophies
							</AppTranslate>
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
				<AppTranslate translate-comment="This refers to game scores">Scores</AppTranslate>
			</router-link>
		</h2>

		<div class="well fill-offset full-bleed-xs sans-margin-bottom">
			<div class="row">
				<div class="col-xs-6 col-sm-3">
					<div class="stat-big stat-big-smaller sans-margin-bottom text-center">
						<div class="stat-big-label">
							<AppTranslate translate-comment="This refers to game scores">
								Total Scores
							</AppTranslate>
							{{ ' ' }}
							<AppJolticon
								v-app-tooltip.touchable="
									$gettext(
										`The total number of scores across all of the game's scoreboards, including guest scores.`
									)
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
							<AppTranslate>Users w/ Scores</AppTranslate>
							{{ ' ' }}
							<AppJolticon
								v-app-tooltip.touchable="
									$gettext(
										`The number of users with scores on any of the game's scoreboards. Does not include guests.`
									)
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
				<AppTranslate translate-comment="This is referring to the Game API data store">
					Data Store
				</AppTranslate>
			</router-link>
		</h2>

		<div class="well fill-offset full-bleed-xs sans-margin-bottom">
			<div class="row">
				<div class="col-xs-6 col-sm-3">
					<div class="stat-big stat-big-smaller sans-margin-bottom text-center">
						<div class="stat-big-label">
							<AppTranslate
								translate-comment="This is referring to global items set in the Game API data store."
							>
								Global Items
							</AppTranslate>
							{{ ' ' }}
							<AppJolticon
								v-app-tooltip.touchable="
									$gettext(`The total number of stored global data items.`)
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
