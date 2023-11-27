<script lang="ts">
import { computed, ref } from 'vue';
import { Api } from '../../../../../../../_common/api/api.service';
import { formatDuration } from '../../../../../../../_common/filters/duration';
import { formatNumber } from '../../../../../../../_common/filters/number';
import AppJolticon from '../../../../../../../_common/jolticon/AppJolticon.vue';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../../../_common/route/route-component';
import { vAppTooltip } from '../../../../../../../_common/tooltip/tooltip-directive';
import { $gettext } from '../../../../../../../_common/translate/translate.service';
import { useGameDashRouteController } from '../../manage.store';

export default {
	...defineAppRouteOptions({
		deps: {},
		resolver: ({ route }) =>
			Api.sendRequest('/web/dash/developer/games/api/' + route.params.id),
	}),
};
</script>

<script lang="ts" setup>
const { game } = useGameDashRouteController()!;

const numActiveSessions = ref(0);
const numActiveTrophies = ref(0);
const numGlobalItems = ref(0);
const totalAchievedTrophies = ref(0);
const totalScores = ref(0);
const totalTrophyExp = ref(0);
const totalUsersWithScores = ref(0);
const totalUsersWithTrophies = ref(0);

const sessionStats = ref<{
	avg: number;
	time: number;
	'user-count': number;
}>({} as any);

createAppRoute({
	routeTitle: computed(() => {
		if (game.value) {
			return $gettext('Game API for %{ game }', {
				game: game.value.title,
			});
		}
		return null;
	}),
	onResolved({ payload }) {
		sessionStats.value = payload.sessionStats;

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
			(this as any)[field] = payload[field] || 0;
		});
	},
});
</script>

<template>
	<div>
		<h2 class="section-header">
			{{ $gettext(`Game API Overview`) }}
		</h2>

		<div class="page-help">
			<p>
				{{
					$gettext(
						`The Game API lets you spice up your game with scoreboards, trophies, cloud data storage, session logging, and more.`
					)
				}}
			</p>
			<p>
				{{
					$gettext(
						`You can check the links below to see if the community has already written an API library or plugin for the engine/tool/language you use. Of course, you can always write one yourself and share it in the forums!`
					)
				}}
			</p>
			<p>
				<RouterLink class="link-help" :to="{ name: 'landing.game-api' }">
					{{ $gettext(`Learn more about the Game API...`) }}
				</RouterLink>
				<br />
				<RouterLink
					class="link-help"
					:to="{
						name: 'forums.channels.view',
						params: { name: 'gj-game-api', sort: 'archived' },
					}"
				>
					{{ $gettext(`Find help in the API forums...`) }}
				</RouterLink>
			</p>
		</div>

		<h2 class="sans-margin-bottom">
			<AppTranslate translate-comment="This refers to game API sessions"
				>Sessions</AppTranslate
			>
		</h2>

		<p class="text-muted small">
			{{ $gettext(`Sessions show you who's playing your game and for how long.`) }}
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
			<RouterLink class="link-unstyled" :to="{ name: 'dash.games.manage.api.trophies.list' }">
				<AppTranslate translate-comment="This refers to game trophies">
					Trophies
				</AppTranslate>
			</RouterLink>
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
								{{ $gettext(`N/A`) }}
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
			<RouterLink
				class="link-unstyled"
				:to="{ name: 'dash.games.manage.api.scoreboards.list' }"
			>
				<AppTranslate translate-comment="This refers to game scores">Scores</AppTranslate>
			</RouterLink>
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
							{{ $gettext(`Users w/ Scores`) }}
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
			<RouterLink
				class="link-unstyled"
				:to="{ name: 'dash.games.manage.api.data-storage.items.list' }"
			>
				<AppTranslate translate-comment="This is referring to the Game API data store">
					Data Store
				</AppTranslate>
			</RouterLink>
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
