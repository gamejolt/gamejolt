import View from '!view!./overview.html';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { AppTrackEvent } from '../../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { AppCard } from '../../../../../lib/gj-lib-client/components/card/card';
import { AppCommentVideoThumbnail } from '../../../../../lib/gj-lib-client/components/comment/video/thumbnail/thumbnail';
import { CommentVideo } from '../../../../../lib/gj-lib-client/components/comment/video/video-model';
import { Environment } from '../../../../../lib/gj-lib-client/components/environment/environment.service';
import { AppExpand } from '../../../../../lib/gj-lib-client/components/expand/expand';
import { FiresidePost } from '../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { GameCollaborator } from '../../../../../lib/gj-lib-client/components/game/collaborator/collaborator.model';
import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';
import { Jam } from '../../../../../lib/gj-lib-client/components/jam/jam.model';
import { Notification } from '../../../../../lib/gj-lib-client/components/notification/notification-model';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../lib/gj-lib-client/components/route/route-component';
import { Screen } from '../../../../../lib/gj-lib-client/components/screen/screen-service';
import { AppTooltip } from '../../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { numberSort } from '../../../../../lib/gj-lib-client/utils/array';
import { currency } from '../../../../../lib/gj-lib-client/vue/filters/currency';
import { number } from '../../../../../lib/gj-lib-client/vue/filters/number';
import { AppBroadcastCard } from '../../../../components/broadcast-card/broadcast-card';
import { Store } from '../../../../store/index';

@View
@Component({
	name: 'RouteDashMainOverview',
	components: {
		AppExpand,
		AppCard,
		AppCommentVideoThumbnail,
		AppBroadcastCard,
	},
	directives: {
		AppTrackEvent,
		AppTooltip,
	},
	filters: {
		currency,
		number,
	},
})
export default class RouteDashMainOverview extends BaseRouteComponent {
	@State
	app!: Store['app'];

	revenueTotal = 0;
	revenueWithdrawn = 0;
	revenueSpent = 0;
	revenueCurrent = 0;
	revenuePendingWithdraw = 0;
	revenuePendingActivation = 0;
	walletBalance = 0;

	games: Game[] = [];
	collabs: GameCollaborator[] = [];
	videos: CommentVideo[] = [];
	videosCount = 0;
	jams: Jam[] = [];

	activityNotifications: Notification[] = [];
	latestBroadcast: FiresidePost | null = null;

	isShowingRevenueBreakdown = false;
	gamesExpanded = false;
	jamsExpanded = false;

	isFullyIntegrated = true;
	integration: any = null;
	integrationKeys: string[] = [
		'played_game',
		'rated_game',
		'got_trophy',
		'got_score',
		'has_friend',
	];

	readonly number = number;
	readonly Game = Game;
	readonly Screen = Screen;
	readonly Environment = Environment;
	readonly currency = currency;

	get inViewGames() {
		if (!this.games) {
			return [];
		}

		return this.games.slice(0, this.gamesExpanded ? this.games.length : 5);
	}

	get integrationTranslations() {
		return {
			played_game: this.$gettext('dash.integrate.played_game_html'),
			rated_game: this.$gettext('dash.integrate.rated_game_html'),
			got_trophy: this.$gettext('dash.integrate.got_trophy_html'),
			got_score: this.$gettext('dash.integrate.got_score_html'),
			has_friend: this.$gettext('dash.integrate.has_friend_html'),
		};
	}

	@RouteResolve({ cache: true })
	routeResolve() {
		return Api.sendRequest('/web/dash');
	}

	get routeTitle() {
		return this.$gettext('dash.overview.page_title');
	}

	routed($payload: any) {
		// Keep them undefined if not on the payload.
		// This will ensure that if they aren't an account with revenue, it won't show the revenue widget.
		if (typeof $payload.revenueTotal !== 'undefined' && $payload.revenueTotal !== null) {
			this.revenueTotal = $payload.revenueTotal || 0;
			this.revenueWithdrawn = $payload.revenueWithdrawn || 0;
			this.revenueSpent = $payload.revenueSpent || 0;
			this.revenueCurrent = $payload.revenueCurrent || 0;
			this.revenuePendingWithdraw = $payload.revenuePendingWithdraw || 0;
			this.revenuePendingActivation = $payload.revenuePendingActivation || 0;
			this.walletBalance = $payload.walletBalance || 0;
		}

		const items: (Game | GameCollaborator)[] = [];
		this.games = items
			.concat(Game.populate($payload.games))
			.concat(GameCollaborator.populate($payload.collaborations))
			.sort((a, b) =>
				numberSort(
					a instanceof Game ? a.posted_on : a.accepted_on,
					b instanceof Game ? b.posted_on : b.accepted_on
				)
			)
			.reverse()
			.map(i => (i instanceof Game ? i : i.game!));

		this.videos = CommentVideo.populate($payload.videos);
		this.videosCount = $payload.videosCount || 0;

		this.jams = Jam.populate($payload.jams);

		this.activityNotifications = Notification.populate($payload.activityNotifications);
		this.latestBroadcast = $payload.latestBroadcast
			? new FiresidePost($payload.latestBroadcast)
			: null;

		this.integration = $payload.integration || {};

		this.integrationKeys.forEach(key => {
			if (this.integration[key] && !this.integration[key].achieved) {
				this.isFullyIntegrated = false;
			}
		});
	}
}
