<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../../../_common/api/api.service';
import AppExpand from '../../../../../../../_common/expand/AppExpand.vue';
import { formatNumber } from '../../../../../../../_common/filters/number';
import AppGraphWidget from '../../../../../../../_common/graph/AppGraphWidget.vue';
import AppProgressBar from '../../../../../../../_common/progress/AppProgressBar.vue';
import AppProgressPoller from '../../../../../../../_common/progress/poller/AppProgressPoller.vue';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../../../../_common/route/legacy-route-component';
import { useCommonStore } from '../../../../../../../_common/store/common-store';
import { vAppTooltip } from '../../../../../../../_common/tooltip/tooltip-directive';
import AppCommunityPerms from '../../../../../../components/community/perms/AppCommunityPerms.vue';
import AppGameDevStageSelector from '../../../../../../components/forms/game/dev-stage-selector/AppGameDevStageSelector.vue';
import { AppGamePerms } from '../../../../../../components/game/perms/perms';
import { useGameDashRouteController } from '../../manage.store';

@Options({
	name: 'RouteDashGamesManageGameOverview',
	components: {
		AppProgressPoller,
		AppProgressBar,
		AppExpand,
		AppGameDevStageSelector,
		AppGraphWidget,
		AppGamePerms,
		AppCommunityPerms,
	},
	directives: {
		AppTooltip: vAppTooltip,
	},
})
@OptionsForLegacyRoute({
	deps: {},
	resolver: ({ route }) =>
		Api.sendRequest('/web/dash/developer/games/overview/' + route.params.id),
})
export default class RouteDashGamesManageGameOverview extends LegacyRouteComponent {
	routeStore = setup(() => useGameDashRouteController()!);
	commonStore = setup(() => useCommonStore());

	get user() {
		return this.commonStore.user;
	}

	get game() {
		return this.routeStore.game!;
	}

	get canPublish() {
		return this.routeStore.canPublish;
	}

	viewCount = 0;
	downloadCount = 0;
	commentCount = 0;
	dislikeCount = 0;

	hasBuildsProcessing = false;

	readonly formatNumber = formatNumber;

	get routeTitle() {
		if (this.game) {
			return this.$gettext('Manage %{ game }', {
				game: this.game.title,
			});
		}
		return null;
	}

	get likeCount() {
		return this.game.like_count || 0;
	}

	get voteCount() {
		return this.likeCount + this.dislikeCount;
	}

	get averageRating() {
		if (!this.voteCount) {
			return '-';
		}

		return formatNumber(this.likeCount / this.voteCount, {
			style: 'percent',
			maximumFractionDigits: 2,
		});
	}

	routeResolved($payload: any) {
		this.viewCount = $payload.viewCount || 0;
		this.downloadCount = $payload.downloadCount || 0;
		this.commentCount = $payload.commentCount || 0;
		this.dislikeCount = $payload.dislikeCount || 0;

		this.hasBuildsProcessing = $payload.hasBuildsProcessing || false;
	}

	// This is called if they loaded up the page and had builds in a processing
	// state but then the progress polling eventually found that they were all
	// processed. We just want to give the green light.
	onAllBuildsProcessed() {
		this.hasBuildsProcessing = false;
	}
}
</script>

<template>
	<div>
		<div class="row">
			<div class="col-lg-8">
				<div v-if="game.isVisible" class="alert alert-highlight">
					<AppJolticon icon="check" />
					<AppTranslate>This game page is published to the site.</AppTranslate>
				</div>

				<!-- Show a little message if they still have builds being processed. -->
				<div v-if="hasBuildsProcessing" class="alert">
					<AppProgressPoller
						:url="`/web/dash/developer/games/poll-build-progress/${game.id}`"
						@complete="onAllBuildsProcessed"
					/>

					<AppProgressBar thin active indeterminate :percent="100" />

					<p>
						<span v-translate>
							<strong>You still have builds that are being processed.</strong>
							They won't show on your game page until they're finished processing.
						</span>
					</p>
				</div>

				<AppExpand :when="!game.isVisible && canPublish">
					<div class="alert alert-highlight">
						<p>
							<AppTranslate>
								Your game page is ready to publish to the site for all to see!
							</AppTranslate>
						</p>

						<AppGamePerms required="all" tag="div" class="alert-actions">
							<!-- TODO(vue3) translate-comment="Flavor text that shows up when you hover over the publish game button" -->
							<AppButton
								v-app-tooltip="$gettext(`Ohhhh, yeah!`)"
								primary
								block
								@click="routeStore.publish()"
							>
								<AppTranslate>Publish Game</AppTranslate>
							</AppButton>
						</AppGamePerms>
					</div>
				</AppExpand>

				<AppExpand :when="game.canceled">
					<div class="alert">
						<p>
							<AppTranslate>
								Your game is set as being a canceled game. You can transition back
								to a normal game page at any time!
							</AppTranslate>
						</p>

						<AppGamePerms required="all" tag="div" class="alert-actions">
							<AppButton
								v-app-tooltip="$gettext(`This will make your game active again.`)"
								primary
								block
								@click="routeStore.uncancel()"
							>
								<AppTranslate>Uncancel Game</AppTranslate>
							</AppButton>
						</AppGamePerms>
					</div>
				</AppExpand>
			</div>
		</div>

		<div v-if="game.community" class="row">
			<AppCommunityPerms :community="game.community">
				<div class="col-lg-8">
					<router-link :to="game.community.routeEditLocation">
						<AppButton icon="users">Edit Community</AppButton>
					</router-link>
				</div>
			</AppCommunityPerms>
		</div>

		<h2>
			<AppTranslate>Quick Stats</AppTranslate>
		</h2>

		<div class="row">
			<div class="col-lg-8">
				<AppGraphWidget
					class="-graph"
					:url="`/web/dash/developer/games/graphs/overview/${game.id}`"
				/>
			</div>
			<div class="col-lg-4">
				<div class="row">
					<div class="col-xs-6 col-sm-4 col-lg-6">
						<div class="stat-big">
							<div class="stat-big-label">
								<AppTranslate>Views</AppTranslate>
							</div>
							<div class="stat-big-digit">
								{{ formatNumber(viewCount) }}
							</div>
						</div>
					</div>
					<div class="col-xs-6 col-sm-4 col-lg-6">
						<div class="stat-big">
							<div class="stat-big-label">
								<AppTranslate>Plays/Downloads</AppTranslate>
							</div>
							<div class="stat-big-digit">
								{{ formatNumber(downloadCount) }}
							</div>
						</div>
					</div>
					<div class="col-xs-6 col-sm-4 col-lg-6">
						<div class="stat-big">
							<div class="stat-big-label">
								<AppTranslate>Likes</AppTranslate>
							</div>
							<div class="stat-big-digit">
								{{ formatNumber(likeCount) }}
							</div>
						</div>
					</div>
					<div class="col-xs-6 col-sm-4 col-lg-6">
						<div class="stat-big">
							<div class="stat-big-label">
								<AppTranslate>Avg. Rating</AppTranslate>
							</div>
							<div class="stat-big-digit">
								{{ averageRating }}
							</div>
						</div>
					</div>
					<div class="col-xs-6 col-sm-4 col-lg-6">
						<div class="stat-big">
							<div class="stat-big-label">
								<AppTranslate>Comments</AppTranslate>
							</div>
							<div class="stat-big-digit">
								{{ formatNumber(commentCount) }}
							</div>
						</div>
					</div>
					<div class="col-xs-6 col-sm-4 col-lg-6">
						<div class="stat-big">
							<div class="stat-big-label">
								<AppTranslate>Followers</AppTranslate>
							</div>
							<div class="stat-big-digit">
								{{ formatNumber(game.follower_count) }}
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
					params: { resource: 'Game', resourceId: game.id },
				}"
			>
				<AppTranslate>View Game Analytics</AppTranslate>
			</AppButton>
		</AppGamePerms>
	</div>
</template>

<style lang="stylus" scoped>
.-graph
	::v-deep(.graph)
		rounded-corners-lg()
</style>
