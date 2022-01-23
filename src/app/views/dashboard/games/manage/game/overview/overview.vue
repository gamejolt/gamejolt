<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../../../_common/api/api.service';
import AppExpand from '../../../../../../../_common/expand/AppExpand.vue';
import { formatNumber } from '../../../../../../../_common/filters/number';
import { Game } from '../../../../../../../_common/game/game.model';
import AppGraphWidget from '../../../../../../../_common/graph/widget/widget.vue';
import AppProgressBar from '../../../../../../../_common/progress/bar/bar.vue';
import { AppProgressPoller } from '../../../../../../../_common/progress/poller/poller';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../../../_common/route/route-component';
import { useCommonStore } from '../../../../../../../_common/store/common-store';
import { AppTooltip } from '../../../../../../../_common/tooltip/tooltip-directive';
import { AppCommunityPerms } from '../../../../../../components/community/perms/perms';
import AppGameDevStageSelector from '../../../../../../components/forms/game/dev-stage-selector/dev-stage-selector.vue';
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
		AppTooltip,
	},
})
@RouteResolver({
	deps: {},
	resolver: ({ route }) =>
		Api.sendRequest('/web/dash/developer/games/overview/' + route.params.id),
})
export default class RouteDashGamesManageGameOverview extends BaseRouteComponent {
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

	readonly Game = Game;
	readonly formatNumber = formatNumber;

	get routeTitle() {
		if (this.game) {
			return this.$gettextInterpolate('Manage %{ game }', {
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
					<app-jolticon icon="check" />
					<translate>This game page is published to the site.</translate>
				</div>

				<!-- Show a little message if they still have builds being processed. -->
				<div v-if="hasBuildsProcessing" class="alert">
					<app-progress-poller
						:url="`/web/dash/developer/games/poll-build-progress/${game.id}`"
						@complete="onAllBuildsProcessed"
					/>

					<app-progress-bar thin active indeterminate :percent="100" />

					<p>
						<span v-translate>
							<strong>You still have builds that are being processed.</strong>
							They won't show on your game page until they're finished processing.
						</span>
					</p>
				</div>

				<app-expand :when="!game.isVisible && canPublish">
					<div class="alert alert-highlight">
						<p>
							<translate>
								Your game page is ready to publish to the site for all to see!
							</translate>
						</p>

						<app-game-perms required="all" tag="div" class="alert-actions">
							<app-button
								v-app-tooltip="
									$gettext(`dash.games.overview.todo_info_publish_button_tooltip`)
								"
								primary
								block
								@click="routeStore.publish()"
							>
								<translate>dash.games.overview.todo_info_publish_button</translate>
							</app-button>
						</app-game-perms>
					</div>
				</app-expand>

				<app-expand :when="game.canceled">
					<div class="alert">
						<p>
							<translate>
								Your game is set as being a canceled game. You can transition back
								to a normal game page at any time!
							</translate>
						</p>

						<app-game-perms required="all" tag="div" class="alert-actions">
							<app-button
								v-app-tooltip="$gettext(`This will make your game active again.`)"
								primary
								block
								@click="routeStore.uncancel()"
							>
								<translate>Uncancel Game</translate>
							</app-button>
						</app-game-perms>
					</div>
				</app-expand>
			</div>
		</div>

		<div v-if="game.community" class="row">
			<app-community-perms :community="game.community" tag="div">
				<div class="col-lg-8">
					<router-link :to="game.community.routeEditLocation">
						<app-button icon="users">Edit Community</app-button>
					</router-link>
				</div>
			</app-community-perms>
		</div>

		<h2>
			<translate>dash.games.overview.stats_heading</translate>
		</h2>

		<div class="row">
			<div class="col-lg-8">
				<app-graph-widget
					class="-graph"
					:url="`/web/dash/developer/games/graphs/overview/${game.id}`"
				/>
			</div>
			<div class="col-lg-4">
				<div class="row">
					<div class="col-xs-6 col-sm-4 col-lg-6">
						<div class="stat-big">
							<div class="stat-big-label">
								<translate>dash.games.overview.stats_views</translate>
							</div>
							<div class="stat-big-digit">
								{{ formatNumber(viewCount) }}
							</div>
						</div>
					</div>
					<div class="col-xs-6 col-sm-4 col-lg-6">
						<div class="stat-big">
							<div class="stat-big-label">
								<translate>dash.games.overview.stats_plays</translate>
							</div>
							<div class="stat-big-digit">
								{{ formatNumber(downloadCount) }}
							</div>
						</div>
					</div>
					<div class="col-xs-6 col-sm-4 col-lg-6">
						<div class="stat-big">
							<div class="stat-big-label">
								<translate>Likes</translate>
							</div>
							<div class="stat-big-digit">
								{{ formatNumber(likeCount) }}
							</div>
						</div>
					</div>
					<div class="col-xs-6 col-sm-4 col-lg-6">
						<div class="stat-big">
							<div class="stat-big-label">
								<translate>Avg. Rating</translate>
							</div>
							<div class="stat-big-digit">
								{{ averageRating }}
							</div>
						</div>
					</div>
					<div class="col-xs-6 col-sm-4 col-lg-6">
						<div class="stat-big">
							<div class="stat-big-label">
								<translate>dash.games.overview.stats_comments</translate>
							</div>
							<div class="stat-big-digit">
								{{ formatNumber(commentCount) }}
							</div>
						</div>
					</div>
					<div class="col-xs-6 col-sm-4 col-lg-6">
						<div class="stat-big">
							<div class="stat-big-label">
								<translate>dash.games.overview.stats_followers</translate>
							</div>
							<div class="stat-big-digit">
								{{ formatNumber(game.follower_count) }}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<app-game-perms required="analytics" tag="div" class="visible-xs">
			<app-button
				block
				icon="chart"
				:to="{
					name: 'dash.analytics',
					params: { resource: 'Game', resourceId: game.id },
				}"
			>
				<translate>View Game Analytics</translate>
			</app-button>
		</app-game-perms>
	</div>
</template>

<style lang="stylus" scoped>
.-graph
	::v-deep(.graph)
		rounded-corners-lg()
</style>
