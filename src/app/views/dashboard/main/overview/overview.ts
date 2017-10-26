import { State } from 'vuex-class';
import { Component } from 'vue-property-decorator';
import View from '!view!./overview.html';

import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { CommentVideo } from '../../../../../lib/gj-lib-client/components/comment/video/video-model';
import { Notification } from '../../../../../lib/gj-lib-client/components/notification/notification-model';
import { FiresidePost } from '../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { makeObservableService } from '../../../../../lib/gj-lib-client/utils/vue';
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
import { ModalConfirm } from '../../../../../lib/gj-lib-client/components/modal/confirm/confirm-service';
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

	gamesOrCollabs: (Game | GameCollaborator)[] = [];
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
	readonly Screen = makeObservableService(Screen);
	readonly Environment = Environment;
	readonly currency = currency;

	get inViewGamesOrCollabs() {
		if (!this.gamesOrCollabs) {
			return [];
		}

		return this.gamesOrCollabs.slice(0, this.gamesExpanded ? this.gamesOrCollabs.length : 5);
	}

	get games() {
		const games: Game[] = [];
		for (let gameOrCollab of this.inViewGamesOrCollabs) {
			games.push(gameOrCollab instanceof Game ? gameOrCollab : gameOrCollab.game!);
		}
		return games;
	}

	get gameAnalyticsPerms() {
		const hasPerms: boolean[] = [];
		for (let gameOrCollab of this.inViewGamesOrCollabs) {
			const game = gameOrCollab instanceof Game ? gameOrCollab : gameOrCollab.game!;
			hasPerms.push(game.hasPerms('analytics'));
		}
		return hasPerms;
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

	routed() {
		// Keep them undefined if not on the payload.
		// This will ensure that if they aren't an account with revenue, it won't show the revenue widget.
		if (typeof this.$payload.revenueTotal !== 'undefined' && this.$payload.revenueTotal !== null) {
			this.revenueTotal = this.$payload.revenueTotal || 0;
			this.revenueWithdrawn = this.$payload.revenueWithdrawn || 0;
			this.revenueSpent = this.$payload.revenueSpent || 0;
			this.revenueCurrent = this.$payload.revenueCurrent || 0;
			this.revenuePendingWithdraw = this.$payload.revenuePendingWithdraw || 0;
			this.revenuePendingActivation = this.$payload.revenuePendingActivation || 0;
			this.walletBalance = this.$payload.walletBalance || 0;
		}

		this.gamesOrCollabs = [];
		this.gamesOrCollabs.push(...Game.populate(this.$payload.games));
		this.gamesOrCollabs.push(...GameCollaborator.populate(this.$payload.collaborations));
		this.gamesOrCollabs.sort((a, b) => {
			const aVal = a instanceof Game ? a.posted_on : a.accepted_on;
			const bVal = b instanceof Game ? b.posted_on : b.accepted_on;
			return numberSort(bVal, aVal);
		});

		this.videos = CommentVideo.populate(this.$payload.videos);
		this.videosCount = this.$payload.videosCount || 0;

		this.jams = Jam.populate(this.$payload.jams);

		this.activityNotifications = Notification.populate(this.$payload.activityNotifications);
		this.latestBroadcast = this.$payload.latestBroadcast
			? new FiresidePost(this.$payload.latestBroadcast)
			: null;

		this.integration = this.$payload.integration || {};

		this.integrationKeys.forEach(key => {
			if (this.integration[key] && !this.integration[key].achieved) {
				this.isFullyIntegrated = false;
			}
		});
	}
}
