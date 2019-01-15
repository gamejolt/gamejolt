import View from '!view!./view.html';
import { Ads, AdSettingsContainer } from 'game-jolt-frontend-lib/components/ad/ads.service';
import {
	CommentAction,
	CommentMutation,
	CommentState,
	CommentStore,
	CommentStoreModel,
} from 'game-jolt-frontend-lib/components/comment/comment-store';
import { WithRouteStore } from 'game-jolt-frontend-lib/components/route/route-store';
import { AppUserCardHover } from 'game-jolt-frontend-lib/components/user/card/hover/hover';
import { enforceLocation } from 'game-jolt-frontend-lib/utils/router';
import { Component } from 'vue-property-decorator';
import { Analytics } from '../../../../../lib/gj-lib-client/components/analytics/analytics.service';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { Collaborator } from '../../../../../lib/gj-lib-client/components/collaborator/collaborator.model';
import {
	EventBus,
	EventBusDeregister,
} from '../../../../../lib/gj-lib-client/components/event-bus/event-bus.service';
import { GamePackage } from '../../../../../lib/gj-lib-client/components/game/package/package.model';
import { HistoryTick } from '../../../../../lib/gj-lib-client/components/history-tick/history-tick-service';
import { PartnerReferral } from '../../../../../lib/gj-lib-client/components/partner-referral/partner-referral-service';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../lib/gj-lib-client/components/route/route-component';
import { Screen } from '../../../../../lib/gj-lib-client/components/screen/screen-service';
import { Scroll } from '../../../../../lib/gj-lib-client/components/scroll/scroll.service';
import { AppTooltip } from '../../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { Translate } from '../../../../../lib/gj-lib-client/components/translate/translate.service';
import { AppUserAvatar } from '../../../../../lib/gj-lib-client/components/user/user-avatar/user-avatar';
import { AppGameCoverButtons } from '../../../../components/game/cover-buttons/cover-buttons';
import { AppGameMaturityBlock } from '../../../../components/game/maturity-block/maturity-block';
import { AppGamePerms } from '../../../../components/game/perms/perms';
import { IntentService } from '../../../../components/intent/intent.service';
import { AppPageHeader } from '../../../../components/page-header/page-header';
import {
	RatingWidgetOnChange,
	RatingWidgetOnChangePayload,
} from '../../../../components/rating/widget/widget';
import { store } from '../../../../store';
import './view-content.styl';
import { RouteStore, routeStore, RouteStoreModule, RouteStoreName } from './view.store';
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
@WithRouteStore({
	store,
	routeStoreName: RouteStoreName,
	routeStoreClass: RouteStore,
})
@RouteResolver({
	lazy: true,
	cache: true,
	deps: { params: ['slug', 'id'], query: ['intent'] },
	async resolver({ route }) {
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
			const redirect = enforceLocation(route, { slug: payload.game.slug });
			if (redirect) {
				return redirect;
			}
		}

		return payload;
	},
	resolveStore({ payload }) {
		routeStore.commit('processPayload', payload);
		store.commit('theme/setPageTheme', routeStore.state.game.theme || null);
	},
})
export default class RouteDiscoverGamesView extends BaseRouteComponent {
	@RouteStoreModule.State
	game!: RouteStore['game'];

	@RouteStoreModule.State
	partner!: RouteStore['partner'];

	@RouteStoreModule.State
	partnerKey!: RouteStore['partnerKey'];

	@RouteStoreModule.State
	packages!: RouteStore['packages'];

	@RouteStoreModule.State
	collaboratorInvite!: RouteStore['collaboratorInvite'];

	@RouteStoreModule.State
	downloadableBuilds!: RouteStore['downloadableBuilds'];

	@RouteStoreModule.State
	browserBuilds!: RouteStore['browserBuilds'];

	@RouteStoreModule.State
	profileCount!: RouteStore['profileCount'];

	@RouteStoreModule.State
	installableBuilds!: RouteStore['installableBuilds'];

	@RouteStoreModule.Mutation
	bootstrapGame!: RouteStore['bootstrapGame'];

	@RouteStoreModule.Mutation
	processPayload!: RouteStore['processPayload'];

	@RouteStoreModule.Mutation
	showMultiplePackagesMessage!: RouteStore['showMultiplePackagesMessage'];

	@RouteStoreModule.Mutation
	acceptCollaboratorInvite!: RouteStore['acceptCollaboratorInvite'];

	@RouteStoreModule.Mutation
	declineCollaboratorInvite!: RouteStore['declineCollaboratorInvite'];

	@RouteStoreModule.Mutation
	setUserRating!: RouteStore['setUserRating'];

	@CommentState
	getCommentStore!: CommentStore['getCommentStore'];

	@CommentAction
	lockCommentStore!: CommentStore['lockCommentStore'];

	@CommentMutation
	releaseCommentStore!: CommentStore['releaseCommentStore'];

	@CommentMutation
	setCommentCount!: CommentStore['setCommentCount'];

	commentStore: CommentStoreModel | null = null;

	readonly Screen = Screen;

	private ratingWatchDeregister?: EventBusDeregister;
	private gaTrackingId?: string;

	private roleNames: { [k: string]: string } = {
		[Collaborator.ROLE_GAME_COLLABORATOR]: this.$gettext('an equal collaborator'),
		[Collaborator.ROLE_GAME_COMMUNITY_MANAGER]: this.$gettext('a community manager'),
		[Collaborator.ROLE_GAME_DEVELOPER]: this.$gettext('a developer'),
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
		return Screen.isXs || this.$route.name !== 'discover.games.view.devlog.view';
	}

	/**
	 * The cover height changes when we switch to not showing the full cover, so
	 * let's make sure we reset the autoscroll anchor so that it scrolls to the
	 * top again.
	 */
	get autoscrollAnchorKey() {
		return this.game.id + (this.shouldShowFullCover ? '-full' : '-collapsed');
	}

	routeCreated() {
		// This isn't needed by SSR or anything, so it's fine to call it here.
		this.bootstrapGame(parseInt(this.$route.params.id, 10));
		this._setAdSettings();

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

	async routeResolved($payload: any) {
		this._setAdSettings();

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

	routeDestroyed() {
		store.commit('theme/setPageTheme', null);
		this._releaseAdSettings();

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

	private _setAdSettings() {
		if (!this.game) {
			return;
		}

		let mat: string | undefined = undefined;
		if (this.game.tigrs_age === 1) {
			mat = 'everyone';
		} else if (this.game.tigrs_age === 2) {
			mat = 'teen';
		} else if (this.game.tigrs_age === 3) {
			mat = 'adult';
		}

		const settings = new AdSettingsContainer();
		settings.resource = this.game;
		settings.isPageDisabled = !this.game._should_show_ads;

		Ads.setPageSettings(settings);
	}

	private _releaseAdSettings() {
		Ads.releasePageSettings();
	}
}
