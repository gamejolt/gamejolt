import { Route } from 'vue-router';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import View from '!view!./view.html';
import './view-content.styl';

import { enforceLocation } from '../../../../../lib/gj-lib-client/utils/router';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { AppJolticon } from '../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppPageHeader } from '../../../../components/page-header/page-header';
import { Screen } from '../../../../../lib/gj-lib-client/components/screen/screen-service';
import { AppUserAvatar } from '../../../../../lib/gj-lib-client/components/user/user-avatar/user-avatar';
import { AppDiscoverGamesViewNav } from './_nav/nav';
import { AppDiscoverGamesViewControls } from './_controls/controls';
import { AppGameOgrsTag } from '../../../../components/game/ogrs/tag';
import { number } from '../../../../../lib/gj-lib-client/vue/filters/number';
import { AppTooltip } from '../../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { AppTimeAgo } from '../../../../../lib/gj-lib-client/components/time/ago/ago';
import { AppGameMaturityBlock } from '../../../../components/game/maturity-block/maturity-block';
import { date } from '../../../../../lib/gj-lib-client/vue/filters/date';
import { AppGameCoverButtons } from '../../../../components/game/cover-buttons/cover-buttons';
import { Scroll } from '../../../../../lib/gj-lib-client/components/scroll/scroll.service';
import { AppMeter } from '../../../../../lib/gj-lib-client/components/meter/meter';
import { RouteStoreName, RouteState, RouteAction, RouteStore, RouteMutation } from './view.store';
import { EventBus } from '../../../../../lib/gj-lib-client/components/event-bus/event-bus.service';
import { Store } from '../../../../store/index';
import { Analytics } from '../../../../../lib/gj-lib-client/components/analytics/analytics.service';
import { HistoryTick } from '../../../../../lib/gj-lib-client/components/history-tick/history-tick-service';
import { PartnerReferral } from '../../../../../lib/gj-lib-client/components/partner-referral/partner-referral-service';
import { GamePackage } from '../../../../../lib/gj-lib-client/components/game/package/package.model';
import { AppUserFollowWidget } from '../../../../../lib/gj-lib-client/components/user/follow-widget/follow-widget';
import { AppGamePerms } from '../../../../components/game/perms/perms';
import { GameCollaborator } from '../../../../../lib/gj-lib-client/components/game/collaborator/collaborator.model';
import { Translate } from '../../../../../lib/gj-lib-client/components/translate/translate.service';
import { IntentService } from '../../../../components/intent/intent.service';
import {
	RouteResolve,
	BaseRouteComponent,
} from '../../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteDiscoverGamesView',
	components: {
		AppJolticon,
		AppPageHeader,
		AppUserAvatar,
		AppDiscoverGamesViewNav,
		AppDiscoverGamesViewControls,
		AppGameOgrsTag,
		AppMeter,
		AppTimeAgo,
		AppGameMaturityBlock,
		AppGameCoverButtons,
		AppUserFollowWidget,
		AppGamePerms,
	},
	directives: {
		AppTooltip,
	},
})
export default class RouteDiscoverGamesView extends BaseRouteComponent {
	@Prop() id: string;

	@RouteState game: RouteStore['game'];
	@RouteState userPartnerKey: RouteStore['userPartnerKey'];
	@RouteState partner: RouteStore['partner'];
	@RouteState partnerKey: RouteStore['partnerKey'];
	@RouteState packages: RouteStore['packages'];
	@RouteState collaboratorInvite: RouteStore['collaboratorInvite'];
	@RouteState downloadableBuilds: RouteStore['downloadableBuilds'];
	@RouteState browserBuilds: RouteStore['browserBuilds'];
	@RouteState installableBuilds: RouteStore['installableBuilds'];

	@RouteAction bootstrap: RouteStore['bootstrap'];
	@RouteAction refreshRatingInfo: RouteStore['refreshRatingInfo'];
	@RouteMutation bootstrapGame: RouteStore['bootstrapGame'];
	@RouteMutation showMultiplePackagesMessage: RouteStore['showMultiplePackagesMessage'];
	@RouteMutation acceptCollaboratorInvite: RouteStore['acceptCollaboratorInvite'];
	@RouteMutation declineCollaboratorInvite: RouteStore['declineCollaboratorInvite'];

	storeName = RouteStoreName;
	storeModule = RouteStore;

	@State app: Store['app'];

	readonly date = date;
	readonly Screen = Screen;

	private ratingCallback?: Function;
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

	get ratingTooltip() {
		return number(this.game.rating_count || 0) + ' rating(s), avg: ' + this.game.avg_rating;
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

	@RouteResolve({ lazy: true, cache: true, cacheTag: 'view' })
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
		if (!this.ratingCallback) {
			this.ratingCallback = (gameId: number) => this.onGameRatingChange(gameId);
			EventBus.on('GameRating.changed', this.ratingCallback);
		}

		// Since routes are reused when switching params (new game page) we want
		// to unset any previously set tracking IDs.
		if (this.gaTrackingId) {
			Analytics.detachAdditionalPageTracker(this.gaTrackingId);
			this.gaTrackingId = undefined;
		}
	}

	routed($payload: any) {
		this.bootstrap($payload);

		// If the game has a GA tracking ID, then we attach it to this
		// scope so all page views within get tracked.
		if (this.game.ga_tracking_id) {
			Analytics.attachAdditionalPageTracker(this.game.ga_tracking_id);
			this.gaTrackingId = this.game.ga_tracking_id;
		}
	}

	routeDestroy() {
		if (this.ratingCallback) {
			EventBus.off('GameRating.changed', this.ratingCallback);
			this.ratingCallback = undefined;
		}

		if (this.game && this.game.ga_tracking_id) {
			Analytics.detachAdditionalPageTracker(this.game.ga_tracking_id);
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

	onGameRatingChange(gameId: number) {
		if (gameId === this.game.id) {
			this.refreshRatingInfo();
		}
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
