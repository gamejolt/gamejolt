import { State } from 'vuex-class';
import { Component } from 'vue-property-decorator';
import View from '!view!./overview.html';

import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { CommentVideo } from '../../../../../lib/gj-lib-client/components/comment/video/video-model';
import { Notification } from '../../../../../lib/gj-lib-client/components/notification/notification-model';
import { FiresidePost } from '../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { Screen } from '../../../../../lib/gj-lib-client/components/screen/screen-service';
import { Environment } from '../../../../../lib/gj-lib-client/components/environment/environment.service';
import { Store } from '../../../../store/index';
import { AppTrackEvent } from '../../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { AppJolticon } from '../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppTooltip } from '../../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { AppExpand } from '../../../../../lib/gj-lib-client/components/expand/expand';
import { AppCard } from '../../../../../lib/gj-lib-client/components/card/card';
import { AppCommentVideoThumbnail } from '../../../../../lib/gj-lib-client/components/comment/video/thumbnail/thumbnail';
import { currency } from '../../../../../lib/gj-lib-client/vue/filters/currency';
import { number } from '../../../../../lib/gj-lib-client/vue/filters/number';
import { AppPopover } from '../../../../../lib/gj-lib-client/components/popover/popover';
import { AppPopoverTrigger } from '../../../../../lib/gj-lib-client/components/popover/popover-trigger.directive.vue';
import { numberSort } from '../../../../../lib/gj-lib-client/utils/array';
import { Jam } from '../../../../../lib/gj-lib-client/components/jam/jam.model';
import { GameCollaborator } from '../../../../../lib/gj-lib-client/components/game/collaborator/collaborator.model';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteDashMainOverview',
	components: {
		AppJolticon,
		AppExpand,
		AppCard,
		AppCommentVideoThumbnail,
		AppPopover,
	},
	directives: {
		AppTrackEvent,
		AppTooltip,
		AppPopoverTrigger,
	},
	filters: {
		currency,
		number,
	},
})
export default class RouteDashMainOverview extends BaseRouteComponent {
	@State app: Store['app'];

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
