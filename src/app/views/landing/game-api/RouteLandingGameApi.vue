<script lang="ts">
import { computed, ref } from 'vue';
import { Api } from '../../../../_common/api/api.service';
import AppButton from '../../../../_common/button/AppButton.vue';
import { formatNumber } from '../../../../_common/filters/number';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import AppThemeSvg from '../../../../_common/theme/svg/AppThemeSvg.vue';
import { $gettext } from '../../../../_common/translate/translate.service';
import { imageJolt } from '../../../img/images';

export default {
	...defineAppRouteOptions({
		cache: true,
		lazy: true,
		deps: {},
		resolver: () => Api.sendRequest('/web/landing/game-api'),
	}),
};
</script>

<script lang="ts" setup>
const totalScores = ref(0);
const totalAchievedTrophies = ref(0);
const sessionTime = ref(0);

const assetPaths = import.meta.glob('./*.svg', { eager: true, as: 'url' });

createAppRoute({
	routeTitle: computed(() => $gettext(`Game API`)),
	onResolved({ payload }) {
		totalScores.value = payload.totalScores || 0;
		totalAchievedTrophies.value = payload.totalAchievedTrophies || 0;
		sessionTime.value = payload.sessionTime ? Math.floor(payload.sessionTime / 60 / 60) : 0;
	},
});
</script>

<template>
	<div>
		<section class="section landing-header text-center">
			<div class="container">
				<h1>
					<AppThemeSvg
						:src="imageJolt"
						alt=""
						:width="17 * 3"
						:height="18 * 3"
						strict-colors
					/>
					{{ $gettext(`Game API`) }}
				</h1>

				<div class="row">
					<div class="col-sm-10 col-md-8 col-lg-6 col-centered">
						<p>
							{{
								$gettext(
									`By implementing the Game Jolt Game API you can add trophies, leaderboards, cloud data storage, and sessions to your games to get players coming back for more!`
								)
							}}
						</p>

						<div class="text-center">
							<AppButton primary :to="{ name: 'landing.game-api-doc' }">
								{{ $gettext(`Get Started`) }}
							</AppButton>
						</div>
					</div>
				</div>
			</div>
		</section>

		<section class="section">
			<div class="container">
				<div class="row text-center">
					<div class="col-lg-3" />
					<div v-if="totalScores" class="col-lg-2">
						<div class="stat-big">
							<div class="stat-big-digit">
								{{ formatNumber(totalScores) }}
							</div>
							<div class="stat-big-label">{{ $gettext(`Scores Logged`) }}</div>
						</div>
					</div>
					<div class="col-lg-2">
						<div v-if="totalAchievedTrophies" class="stat-big">
							<div class="stat-big-digit">
								{{ formatNumber(totalAchievedTrophies) }}
							</div>
							<div class="stat-big-label">{{ $gettext(`Trophies Achieved`) }}</div>
						</div>
					</div>
					<div class="col-lg-2">
						<div v-if="sessionTime" class="stat-big">
							<div class="stat-big-digit">
								{{ formatNumber(sessionTime) }}
							</div>
							<div class="stat-big-label">{{ $gettext(`Hours Logged`) }}</div>
						</div>
					</div>
				</div>
			</div>
		</section>

		<section class="section">
			<div class="container">
				<div class="row">
					<div class="col-lg-4">
						<div class="landing-graphic">
							<AppThemeSvg
								:src="assetPaths['./leaderboards.svg']"
								alt="Leaderboards"
							/>
						</div>

						<h4 class="text-center">{{ $gettext(`Leaderboards`) }}</h4>

						<p>
							{{
								$gettext(
									`Implement leaderboards in your game to allow anyone to battle it out for the top spots. You create the leaderboards, you control the scoring. You can even allow guests to score without a Game Jolt account.`
								)
							}}
						</p>
					</div>

					<div class="col-lg-4">
						<div class="landing-graphic">
							<AppThemeSvg :src="assetPaths['./trophies.svg']" alt="Trophies" />
						</div>

						<h4 class="text-center">{{ $gettext(`Trophies`) }}</h4>

						<p>
							{{
								$gettext(
									`Feed into your player base's hunger for trophy hunting. Trophies will sync to their Game Jolt profile for all to see as badges of honor.`
								)
							}}
						</p>
					</div>

					<div class="col-lg-4">
						<div class="landing-graphic">
							<AppThemeSvg
								:src="assetPaths['./data-storage.svg']"
								alt="Data Storage"
							/>
						</div>

						<h4 class="text-center">{{ $gettext(`Cloud Data Storage`) }}</h4>

						<p>
							{{
								$gettext(
									`Sync saved games, user-created levels, friend lists, debug logs--save any bit of data to the player's account, or globally for your game. The clouds are the limit!`
								)
							}}
						</p>
					</div>

					<div class="landing-break-lg" />

					<div class="col-lg-4 col-centered-lg">
						<div class="landing-graphic">
							<AppThemeSvg :src="assetPaths['./sessions.svg']" alt="Sessions" />
						</div>

						<h4 class="text-center">{{ $gettext(`Sessions`) }}</h4>

						<p>
							{{
								$gettext(
									`Track when and how long each player is active in your game. You can then view stats such as avg. play time per session, total time played across users, and even see how many people are playing your game in real time.`
								)
							}}
						</p>
					</div>
				</div>

				<div class="row">
					<div class="col-lg-6 col-centered text-center">
						<h1>{{ $gettext(`Sounds cool, yeah?`) }}</h1>
						<hr class="underbar underbar-center" />

						<AppButton primary lg :to="{ name: 'landing.game-api-doc' }">
							{{ $gettext(`Get Started`) }}
						</AppButton>
					</div>
				</div>
			</div>
		</section>
	</div>
</template>
