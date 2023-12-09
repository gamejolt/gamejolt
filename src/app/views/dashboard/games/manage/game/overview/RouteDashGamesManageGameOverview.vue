<script lang="ts">
import { computed, ref, toRef } from 'vue';
import { RouterLink } from 'vue-router';
import { Api } from '../../../../../../../_common/api/api.service';
import AppButton from '../../../../../../../_common/button/AppButton.vue';
import AppExpand from '../../../../../../../_common/expand/AppExpand.vue';
import { formatNumber } from '../../../../../../../_common/filters/number';
import AppGraphWidget from '../../../../../../../_common/graph/AppGraphWidget.vue';
import AppJolticon from '../../../../../../../_common/jolticon/AppJolticon.vue';
import AppProgressBar from '../../../../../../../_common/progress/AppProgressBar.vue';
import AppProgressPoller from '../../../../../../../_common/progress/poller/AppProgressPoller.vue';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../../../_common/route/route-component';
import { vAppTooltip } from '../../../../../../../_common/tooltip/tooltip-directive';
import { $gettext } from '../../../../../../../_common/translate/translate.service';
import AppCommunityPerms from '../../../../../../components/community/perms/AppCommunityPerms.vue';
import { AppGamePerms } from '../../../../../../components/game/perms/perms';
import { useGameDashRouteController } from '../../manage.store';

export default {
	...defineAppRouteOptions({
		deps: {},
		resolver: ({ route }) =>
			Api.sendRequest('/web/dash/developer/games/overview/' + route.params.id),
	}),
};
</script>

<script lang="ts" setup>
const routeStore = useGameDashRouteController()!;
const { game, canPublish } = routeStore;

const viewCount = ref(0);
const downloadCount = ref(0);
const commentCount = ref(0);
const dislikeCount = ref(0);
const hasBuildsProcessing = ref(false);

const likeCount = toRef(() => game.value!.like_count || 0);
const voteCount = toRef(() => likeCount.value + dislikeCount.value);

const averageRating = computed(() => {
	if (!voteCount.value) {
		return '-';
	}

	return formatNumber(likeCount.value / voteCount.value, {
		style: 'percent',
		maximumFractionDigits: 2,
	});
});

// This is called if they loaded up the page and had builds in a processing
// state but then the progress polling eventually found that they were all
// processed. We just want to give the green light.
function onAllBuildsProcessed() {
	hasBuildsProcessing.value = false;
}

createAppRoute({
	routeTitle: computed(() => {
		if (game.value) {
			return $gettext('Manage %{ game }', {
				game: game.value.title,
			});
		}
		return null;
	}),
	onResolved({ payload }) {
		viewCount.value = payload.viewCount || 0;
		downloadCount.value = payload.downloadCount || 0;
		commentCount.value = payload.commentCount || 0;
		dislikeCount.value = payload.dislikeCount || 0;

		hasBuildsProcessing.value = payload.hasBuildsProcessing || false;
	},
});
</script>

<template>
	<div>
		<div class="row">
			<div class="col-lg-8">
				<div v-if="game!.isVisible" class="alert alert-highlight">
					<AppJolticon icon="check" />
					{{ $gettext(`This game page is published to the site.`) }}
				</div>

				<!-- Show a little message if they still have builds being processed. -->
				<div v-if="hasBuildsProcessing" class="alert">
					<AppProgressPoller
						:url="`/web/dash/developer/games/poll-build-progress/${game!.id}`"
						@complete="onAllBuildsProcessed"
					/>

					<AppProgressBar thin active indeterminate :percent="100" />

					<p>
						<span>
							<strong>
								{{ $gettext(`You still have builds that are being processed.`) }}
							</strong>
							{{ ' ' }}
							{{
								$gettext(
									`They won't show on your game page until they're finished processing.`
								)
							}}
						</span>
					</p>
				</div>

				<AppExpand :when="!game!.isVisible && canPublish">
					<div class="alert alert-highlight">
						<p>
							{{
								$gettext(
									`Your game page is ready to publish to the site for all to see!`
								)
							}}
						</p>

						<AppGamePerms required="all" tag="div" class="alert-actions">
							<AppButton
								v-app-tooltip="$gettext(`Ohhhh, yeah!`)"
								primary
								block
								@click="routeStore.publish()"
							>
								{{ $gettext(`Publish Game`) }}
							</AppButton>
						</AppGamePerms>
					</div>
				</AppExpand>

				<AppExpand :when="game!.canceled">
					<div class="alert">
						<p>
							{{
								$gettext(
									`Your game is set as being a canceled game. You can transition back to a normal game page at any time!`
								)
							}}
						</p>

						<AppGamePerms required="all" tag="div" class="alert-actions">
							<AppButton
								v-app-tooltip="$gettext(`This will make your game active again.`)"
								primary
								block
								@click="routeStore.uncancel()"
							>
								{{ $gettext(`Uncancel Game`) }}
							</AppButton>
						</AppGamePerms>
					</div>
				</AppExpand>
			</div>
		</div>

		<div v-if="game!.community" class="row">
			<AppCommunityPerms :community="game!.community">
				<div class="col-lg-8">
					<RouterLink :to="game!.community.routeEditLocation">
						<AppButton icon="users">{{ $gettext(`Edit Community`) }}</AppButton>
					</RouterLink>
				</div>
			</AppCommunityPerms>
		</div>

		<h2>
			{{ $gettext(`Quick Stats`) }}
		</h2>

		<div class="row">
			<div class="col-lg-8">
				<AppGraphWidget
					class="-graph"
					:url="`/web/dash/developer/games/graphs/overview/${game!.id}`"
				/>
			</div>
			<div class="col-lg-4">
				<div class="row">
					<div class="col-xs-6 col-sm-4 col-lg-6">
						<div class="stat-big">
							<div class="stat-big-label">
								{{ $gettext(`Views`) }}
							</div>
							<div class="stat-big-digit">
								{{ formatNumber(viewCount) }}
							</div>
						</div>
					</div>
					<div class="col-xs-6 col-sm-4 col-lg-6">
						<div class="stat-big">
							<div class="stat-big-label">
								{{ $gettext(`Plays/Downloads`) }}
							</div>
							<div class="stat-big-digit">
								{{ formatNumber(downloadCount) }}
							</div>
						</div>
					</div>
					<div class="col-xs-6 col-sm-4 col-lg-6">
						<div class="stat-big">
							<div class="stat-big-label">
								{{ $gettext(`Likes`) }}
							</div>
							<div class="stat-big-digit">
								{{ formatNumber(likeCount) }}
							</div>
						</div>
					</div>
					<div class="col-xs-6 col-sm-4 col-lg-6">
						<div class="stat-big">
							<div class="stat-big-label">
								{{ $gettext(`Avg. Rating`) }}
							</div>
							<div class="stat-big-digit">
								{{ averageRating }}
							</div>
						</div>
					</div>
					<div class="col-xs-6 col-sm-4 col-lg-6">
						<div class="stat-big">
							<div class="stat-big-label">
								{{ $gettext(`Comments`) }}
							</div>
							<div class="stat-big-digit">
								{{ formatNumber(commentCount) }}
							</div>
						</div>
					</div>
					<div class="col-xs-6 col-sm-4 col-lg-6">
						<div class="stat-big">
							<div class="stat-big-label">
								{{ $gettext(`Followers`) }}
							</div>
							<div class="stat-big-digit">
								{{ formatNumber(game!.follower_count) }}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<AppGamePerms required="analytics" tag="div" class="visible-xs">
			<AppButton
				block
				icon="chart"
				:to="{
					name: 'dash.analytics',
					params: { resource: 'Game', resourceId: game!.id },
				}"
			>
				{{ $gettext(`View Game Analytics`) }}
			</AppButton>
		</AppGamePerms>
	</div>
</template>

<style lang="stylus" scoped>
.-graph
	::v-deep(.graph)
		rounded-corners-lg()
</style>
