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
			<translate>Game API Overview</translate>
		</h2>

		<div class="page-help">
			<p>
				<translate>
					The Game API lets you spice up your game with scoreboards, trophies, cloud data
					storage, session logging, and more.
				</translate>
			</p>
			<p>
				<translate>
					You can check the links below to see if the community has already written an API
					library or plugin for the engine/tool/language you use. Of course, you can
					always write one yourself and share it in the forums!
				</translate>
			</p>
			<p>
				<router-link class="link-help" :to="{ name: 'landing.game-api' }">
					<translate>Learn more about the Game API...</translate>
				</router-link>
				<br />
				<router-link
					class="link-help"
					:to="{
						name: 'forums.channels.view',
						params: { name: 'gj-game-api', sort: 'active' },
					}"
				>
					<translate>Find help in the API forums...</translate>
				</router-link>
			</p>
		</div>

		<h2 class="sans-margin-bottom">
			<translate translate-comment="This refers to game API sessions">Sessions</translate>
		</h2>

		<p class="text-muted small">
			<translate>Sessions show you who's playing your game and for how long.</translate>
		</p>

		<div class="well fill-offset full-bleed-xs sans-margin-bottom">
			<div class="row">
				<div class="col-xs-6 col-sm-3">
					<div class="stat-big stat-big-smaller sans-margin-bottom text-center">
						<div class="stat-big-label">
							<translate translate-comment="This refers to game API sessions">
								Active Sessions
							</translate>
						</div>
						<div class="stat-big-digit">
							{{ formatNumber(numActiveSessions) }}
						</div>
					</div>
				</div>
				<div class="col-xs-6 col-sm-3">
					<div class="stat-big stat-big-smaller sans-margin-bottom text-center">
						<div class="stat-big-label">
							<translate
								translate-comment="This refers to the total session time logged for a game"
							>
								Total Time
							</translate>
						</div>
						<div class="stat-big-digit">
							{{ formatDuration(sessionStats.time || 0) }}
						</div>
					</div>
				</div>
				<div class="col-xs-6 col-sm-3">
					<div class="stat-big stat-big-smaller sans-margin-bottom text-center">
						<div class="stat-big-label">
							<translate translate-comment="This refers to game API sessions">
								Avg. Session Time
							</translate>
						</div>
						<div class="stat-big-digit">
							{{ formatDuration(sessionStats.avg || 0) }}
						</div>
					</div>
				</div>
				<div class="col-xs-6 col-sm-3">
					<div class="stat-big stat-big-smaller sans-margin-bottom text-center">
						<div class="stat-big-label">
							<translate tarnslate-comment="This refers to game API sessions">
								Users w/ Sessions
							</translate>
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
				<translate translate-comment="This refers to game trophies">Trophies</translate>
			</router-link>
		</h2>

		<div class="well fill-offset full-bleed-xs sans-margin-bottom">
			<div class="row">
				<div class="col-xs-6 col-sm-3">
					<div class="stat-big stat-big-smaller sans-margin-bottom text-center">
						<div class="stat-big-label">
							<translate translate-comment="This refers to game trophies">
								Trophies
							</translate>
						</div>
						<div class="stat-big-digit">
							{{ formatNumber(numActiveTrophies) }}
						</div>
					</div>
				</div>
				<div class="col-xs-6 col-sm-3">
					<div class="stat-big stat-big-smaller sans-margin-bottom text-center">
						<div class="stat-big-label">
							<translate translate-comment="This refers to game trophies">
								Trophy EXP
							</translate>
							<app-jolticon
								v-app-tooltip.touchable="
									$gettext(`The total awardable EXP for trophies in your game.`)
								"
								icon="help-circle"
							/>
						</div>
						<div class="stat-big-digit">
							<template v-if="!numActiveTrophies">
								<translate>N/A</translate>
							</template>
							<template v-else>
								{{ formatNumber(totalTrophyExp) }}
								<translate
									translate-comment="As in abbreviation for experience. If one doesnt exist for your language, or if its not a short word just leave it as EXP."
								>
									EXP
								</translate>
							</template>
						</div>
					</div>
				</div>
				<div class="col-xs-6 col-sm-3">
					<div class="stat-big stat-big-smaller sans-margin-bottom text-center">
						<div class="stat-big-label">
							<translate translate-comment="This refers to game trophies">
								Trophies Achieved
							</translate>
						</div>
						<div class="stat-big-digit">
							{{ formatNumber(totalAchievedTrophies) }}
						</div>
					</div>
				</div>
				<div class="col-xs-6 col-sm-3">
					<div class="stat-big stat-big-smaller sans-margin-bottom text-center">
						<div class="stat-big-label">
							<translate translate-comment="This refers to game trophies">
								Users w/ Trophies
							</translate>
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
				<translate translate-comment="This refers to game scores">Scores</translate>
			</router-link>
		</h2>

		<div class="well fill-offset full-bleed-xs sans-margin-bottom">
			<div class="row">
				<div class="col-xs-6 col-sm-3">
					<div class="stat-big stat-big-smaller sans-margin-bottom text-center">
						<div class="stat-big-label">
							<translate translate-comment="This refers to game scores">
								Total Scores
							</translate>
							<app-jolticon
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
							<translate>Users w/ Scores</translate>
							<app-jolticon
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
				<translate translate-comment="This is referring to the Game API data store">
					Data Store
				</translate>
			</router-link>
		</h2>

		<div class="well fill-offset full-bleed-xs sans-margin-bottom">
			<div class="row">
				<div class="col-xs-6 col-sm-3">
					<div class="stat-big stat-big-smaller sans-margin-bottom text-center">
						<div class="stat-big-label">
							<translate
								translate-comment="This is referring to global items set in the Game API data store."
							>
								Global Items
							</translate>
							<app-jolticon
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
