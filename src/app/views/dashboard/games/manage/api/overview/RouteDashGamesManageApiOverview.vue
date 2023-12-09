<script lang="ts">
import { Ref, computed, ref } from 'vue';
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

		const fields: Record<string, Ref<number>> = {
			numActiveTrophies: numActiveTrophies,
			totalTrophyExp: totalTrophyExp,
			totalAchievedTrophies: totalAchievedTrophies,
			totalUsersWithTrophies: totalUsersWithTrophies,
			totalScores: totalScores,
			totalUsersWithScores: totalUsersWithScores,
			numActiveSessions: numActiveSessions,
			numGlobalItems: numGlobalItems,
		};

		for (const [key, field] of Object.entries(fields)) {
			field.value = payload[key] || 0;
		}
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
			{{ $gettext(`Sessions`) }}
		</h2>

		<p class="text-muted small">
			{{ $gettext(`Sessions show you who's playing your game and for how long.`) }}
		</p>

		<div class="well fill-offset full-bleed-xs sans-margin-bottom">
			<div class="row">
				<div class="col-xs-6 col-sm-3">
					<div class="stat-big stat-big-smaller sans-margin-bottom text-center">
						<div class="stat-big-label">
							{{ $gettext(`Active Sessions`) }}
						</div>
						<div class="stat-big-digit">
							{{ formatNumber(numActiveSessions) }}
						</div>
					</div>
				</div>
				<div class="col-xs-6 col-sm-3">
					<div class="stat-big stat-big-smaller sans-margin-bottom text-center">
						<div class="stat-big-label">
							{{ $gettext(`Total Time`) }}
						</div>
						<div class="stat-big-digit">
							{{ formatDuration(sessionStats.time || 0) }}
						</div>
					</div>
				</div>
				<div class="col-xs-6 col-sm-3">
					<div class="stat-big stat-big-smaller sans-margin-bottom text-center">
						<div class="stat-big-label">
							{{ $gettext(`Avg. Session Time`) }}
						</div>
						<div class="stat-big-digit">
							{{ formatDuration(sessionStats.avg || 0) }}
						</div>
					</div>
				</div>
				<div class="col-xs-6 col-sm-3">
					<div class="stat-big stat-big-smaller sans-margin-bottom text-center">
						<div class="stat-big-label">
							{{ $gettext(`Users w/ Sessions`) }}
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
				{{ $gettext(`Trophies`) }}
			</RouterLink>
		</h2>

		<div class="well fill-offset full-bleed-xs sans-margin-bottom">
			<div class="row">
				<div class="col-xs-6 col-sm-3">
					<div class="stat-big stat-big-smaller sans-margin-bottom text-center">
						<div class="stat-big-label">
							{{ $gettext(`Trophies`) }}
						</div>
						<div class="stat-big-digit">
							{{ formatNumber(numActiveTrophies) }}
						</div>
					</div>
				</div>
				<div class="col-xs-6 col-sm-3">
					<div class="stat-big stat-big-smaller sans-margin-bottom text-center">
						<div class="stat-big-label">
							{{ $gettext(`Trophy EXP`) }}
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
								{{ $gettext(`EXP`) }}
							</template>
						</div>
					</div>
				</div>
				<div class="col-xs-6 col-sm-3">
					<div class="stat-big stat-big-smaller sans-margin-bottom text-center">
						<div class="stat-big-label">
							{{ $gettext(`Trophies Achieved`) }}
						</div>
						<div class="stat-big-digit">
							{{ formatNumber(totalAchievedTrophies) }}
						</div>
					</div>
				</div>
				<div class="col-xs-6 col-sm-3">
					<div class="stat-big stat-big-smaller sans-margin-bottom text-center">
						<div class="stat-big-label">
							{{ $gettext(`Users w/ Trophies`) }}
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
				{{ $gettext(`Scores`) }}
			</RouterLink>
		</h2>

		<div class="well fill-offset full-bleed-xs sans-margin-bottom">
			<div class="row">
				<div class="col-xs-6 col-sm-3">
					<div class="stat-big stat-big-smaller sans-margin-bottom text-center">
						<div class="stat-big-label">
							{{ $gettext(`Total Scores`) }}
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
				{{ $gettext(`Data Store`) }}
			</RouterLink>
		</h2>

		<div class="well fill-offset full-bleed-xs sans-margin-bottom">
			<div class="row">
				<div class="col-xs-6 col-sm-3">
					<div class="stat-big stat-big-smaller sans-margin-bottom text-center">
						<div class="stat-big-label">
							{{ $gettext(`Global Items`) }}
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
