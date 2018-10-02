import View from '!view!./view.html';
import {
	CommentAction,
	CommentMutation,
	CommentState,
	CommentStore,
	CommentStoreModel,
} from 'game-jolt-frontend-lib/components/comment/comment-store';
import { AppUserCardHover } from 'game-jolt-frontend-lib/components/user/card/hover/hover';
import { Component, Prop } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { Analytics } from '../../../../../lib/gj-lib-client/components/analytics/analytics.service';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import {
	EventBus,
	EventBusDeregister,
} from '../../../../../lib/gj-lib-client/components/event-bus/event-bus.service';
import { GameCollaborator } from '../../../../../lib/gj-lib-client/components/game/collaborator/collaborator.model';
import { GamePackage } from '../../../../../lib/gj-lib-client/components/game/package/package.model';
import { HistoryTick } from '../../../../../lib/gj-lib-client/components/history-tick/history-tick-service';
import { PartnerReferral } from '../../../../../lib/gj-lib-client/components/partner-referral/partner-referral-service';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../lib/gj-lib-client/components/route/route-component';
import { Screen } from '../../../../../lib/gj-lib-client/components/screen/screen-service';
import { Scroll } from '../../../../../lib/gj-lib-client/components/scroll/scroll.service';
import {
	ThemeMutation,
	ThemeStore,
} from '../../../../../lib/gj-lib-client/components/theme/theme.store';
import { AppTooltip } from '../../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { Translate } from '../../../../../lib/gj-lib-client/components/translate/translate.service';
import { AppUserAvatar } from '../../../../../lib/gj-lib-client/components/user/user-avatar/user-avatar';
import { enforceLocation } from '../../../../../lib/gj-lib-client/utils/router';
import { AppGameCoverButtons } from '../../../../components/game/cover-buttons/cover-buttons';
import { AppGameMaturityBlock } from '../../../../components/game/maturity-block/maturity-block';
import { AppGamePerms } from '../../../../components/game/perms/perms';
import { IntentService } from '../../../../components/intent/intent.service';
import { AppPageHeader } from '../../../../components/page-header/page-header';
import {
	RatingWidgetOnChange,
	RatingWidgetOnChangePayload,
} from '../../../../components/rating/widget/widget';
import './view-content.styl';
import { RouteMutation, RouteState, RouteStore, RouteStoreName } from './view.store';
import { AppDiscoverGamesViewControls } from './_controls/controls';
import { AppDiscoverGamesViewNav } from './_nav/nav';

@View
@Component({
	name: 'RouteDiscoverGamesView',
	components: {
		AppPageHeader,
		AppUserAvatar,
		AppUserCardHover,
		AppDiscoverGamesViewNav,
		AppDiscoverGamesViewControls,
		AppGameMaturityBlock,
		AppGameCoverButtons,
		AppGamePerms,
	},
	directives: {
		AppTooltip,
	},
})
export default class RouteDiscoverGamesView extends BaseRouteComponent {
	@Prop()
	id!: string;

	@RouteState
	game!: RouteStore['game'];

	@RouteState
	partner!: RouteStore['partner'];

	@RouteState
	partnerKey!: RouteStore['partnerKey'];

	@RouteState
	packages!: RouteStore['packages'];

	@RouteState
	collaboratorInvite!: RouteStore['collaboratorInvite'];

	@RouteState
	downloadableBuilds!: RouteStore['downloadableBuilds'];

	@RouteState
	browserBuilds!: RouteStore['browserBuilds'];

	@RouteState
	installableBuilds!: RouteStore['installableBuilds'];

	@RouteMutation
	bootstrapGame!: RouteStore['bootstrapGame'];

	@RouteMutation
	processPayload!: RouteStore['processPayload'];

	@RouteMutation
	showMultiplePackagesMessage!: RouteStore['showMultiplePackagesMessage'];

	@RouteMutation
	acceptCollaboratorInvite!: RouteStore['acceptCollaboratorInvite'];

	@RouteMutation
	declineCollaboratorInvite!: RouteStore['declineCollaboratorInvite'];

	@ThemeMutation
	setPageTheme!: ThemeStore['setPageTheme'];

	@RouteMutation
	setUserRating!: RouteStore['setUserRating'];

	@CommentState
	getCommentStore!: CommentStore['getCommentStore'];

	@CommentAction
	lockCommentStore!: CommentStore['lockCommentStore'];

	@CommentMutation
	releaseCommentStore!: CommentStore['releaseCommentStore'];

	@CommentMutation
	setCommentCount!: CommentStore['setCommentCount'];

	storeName = RouteStoreName;
	storeModule = RouteStore;

	commentStore: CommentStoreModel | null = null;

	readonly Screen = Screen;

	private ratingWatchDeregister?: EventBusDeregister;
	private gaTrackingId?: string;

	private roleNames: { [k: string]: string } = {
		[GameCollaborator.ROLE_COLLABORATOR]: this.$gettext('an equal collaborator'),
		[GameCollaborator.ROLE_COMMUNITY_MANAGER]: this.$gettext('a community manager'),
		[GameCollaborator.ROLE_DEVELOPER]: this.$gettext('a developer'),
	};

	get roleName() {
		if (!this.collaboratorInvite) {
			return '';
		}

		return this.roleNames[this.collaboratorInvite.role as string] || '';
	}

	get shouldShowCoverButtons() {
		// Only show cover buttons on the overview page.
		return (
			(!Screen.isXs &&
				this.$route.name === 'discover.games.view.overview' &&
				this.packages.length > 0) ||
			this.game.hasPerms()
		);
	}

	get shouldShowFullCover() {
		return Screen.isXs || this.$route.name === 'discover.games.view.overview';
	}

	@RouteResolve({ lazy: true, cache: true })
	async routeResolve(this: undefined, route: Route) {
		HistoryTick.trackSource('Game', parseInt(route.params.id, 10));
		PartnerReferral.trackReferrer('Game', parseInt(route.params.id, 10), route);

		const intentRedirect = IntentService.checkRoute(
			route,
			{
				intent: 'follow-game',
				message: Translate.$gettext(`You're now following this game.`),
			},
			{
				intent: 'decline-game-collaboration',
				message: Translate.$gettext(`You've declined the invitation to collaborate.`),
			}
		);
		if (intentRedirect) {
			return intentRedirect;
		}

		const payload = await Api.sendRequest('/web/discover/games/' + route.params.id);

		if (payload && payload.game) {
			const redirect = enforceLocation(
				route,
				{ slug: payload.game.slug },
				{
					ref: payload.userPartnerKey || route.query.ref || undefined,
				}
			);
			if (redirect) {
				return redirect;
			}
		}

		return payload;
	}

	routeInit() {
		this.bootstrapGame(parseInt(this.id, 10));

		// Any game rating change will broadcast this event. We catch it so we
		// can update the page with the new rating! Yay!
		if (!this.ratingWatchDeregister) {
			this.ratingWatchDeregister = EventBus.on(
				RatingWidgetOnChange,
				(payload: RatingWidgetOnChangePayload) => {
					const { gameId, userRating } = payload;
					if (gameId === this.game.id) {
						this.setUserRating(userRating || null);
					}
				}
			);
		}

		// Since routes are reused when switching params (new game page) we want
		// to unset any previously set tracking IDs.
		if (this.gaTrackingId) {
			Analytics.detachAdditionalPageTracker(this.gaTrackingId);
			this.gaTrackingId = undefined;
		}
	}

	async routed($payload: any) {
		this.processPayload($payload);
		this.setPageTheme(this.game.theme || null);

		// If the game has a GA tracking ID, then we attach it to this
		// scope so all page views within get tracked.
		if (this.game.ga_tracking_id) {
			Analytics.attachAdditionalPageTracker(this.game.ga_tracking_id);
			this.gaTrackingId = this.game.ga_tracking_id;
		}

		if (this.commentStore) {
			this.releaseCommentStore(this.commentStore);
			this.commentStore = null;
		}
		this.commentStore = await this.lockCommentStore({
			resource: 'Game',
			resourceId: this.game.id,
		});
		this.setCommentCount({ store: this.commentStore, count: $payload.commentsCount || 0 });
	}

	routeDestroy() {
		this.setPageTheme(null);

		if (this.ratingWatchDeregister) {
			this.ratingWatchDeregister();
			this.ratingWatchDeregister = undefined;
		}

		if (this.game && this.game.ga_tracking_id) {
			Analytics.detachAdditionalPageTracker(this.game.ga_tracking_id);
		}

		if (this.commentStore) {
			this.releaseCommentStore(this.commentStore);
			this.commentStore = null;
		}
	}

	async acceptCollaboration() {
		await this.collaboratorInvite!.$accept();
		this.acceptCollaboratorInvite(this.collaboratorInvite!);
	}

	async declineCollaboration() {
		await this.collaboratorInvite!.$remove();
		this.declineCollaboratorInvite();
	}

	scrollToPackagePayment(package_: GamePackage) {
		Scroll.to(`game-package-card-${package_.id}`);
		EventBus.emit('GamePackageCard.showPaymentOptions', package_);
	}

	scrollToMultiplePackages() {
		this.showMultiplePackagesMessage();
		Scroll.to('game-releases');
	}
}
