import { setup } from 'vue-class-component';
import { Inject, Options } from 'vue-property-decorator';
import { enforceLocation } from '../../../../../utils/router';
import {
	AdSettingsContainer,
	releasePageAdsSettings,
	setPageAdsSettings,
	useAdsController,
} from '../../../../../_common/ad/ad-store';
import { Api } from '../../../../../_common/api/api.service';
import { Collaborator } from '../../../../../_common/collaborator/collaborator.model';
import {
	CommentStoreManager,
	CommentStoreManagerKey,
	CommentStoreModel,
	lockCommentStore,
	releaseCommentStore,
	setCommentCount,
} from '../../../../../_common/comment/comment-store';
import { HistoryTick } from '../../../../../_common/history-tick/history-tick-service';
import { PartnerReferral } from '../../../../../_common/partner-referral/partner-referral-service';
import {
	BaseRouteComponent,
	RouteResolver,
	WithRouteStore,
} from '../../../../../_common/route/route-component';
import { Screen } from '../../../../../_common/screen/screen-service';
import { Scroll } from '../../../../../_common/scroll/scroll.service';
import { EventSubscription } from '../../../../../_common/system/event/event-topic';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import { getTranslation } from '../../../../../_common/translate/translate.service';
import AppUserCardHover from '../../../../../_common/user/card/hover/hover.vue';
import AppUserAvatar from '../../../../../_common/user/user-avatar/user-avatar.vue';
import AppUserVerifiedTick from '../../../../../_common/user/verified-tick/verified-tick.vue';
import AppGameCoverButtons from '../../../../components/game/cover-buttons/cover-buttons.vue';
import AppGameMaturityBlock from '../../../../components/game/maturity-block/maturity-block.vue';
import { AppGamePerms } from '../../../../components/game/perms/perms';
import { IntentService } from '../../../../components/intent/intent.service';
import AppPageHeader from '../../../../components/page-header/page-header.vue';
import { onRatingWidgetChange } from '../../../../components/rating/widget/widget';
import { store } from '../../../../store';
import './view-content.styl';
import { RouteStore, routeStore, RouteStoreModule, RouteStoreName } from './view.store';
import AppDiscoverGamesViewControls from './_controls/controls.vue';
import AppDiscoverGamesViewNav from './_nav/nav.vue';

const GameThemeKey = 'game';

@Options({
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
		AppUserVerifiedTick,
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
		HistoryTick.trackSource('Game', parseInt(route.params.id as string));
		PartnerReferral.trackReferrer('Game', parseInt(route.params.id as string), route);

		const intentRedirect = IntentService.checkRoute(
			route,
			{
				intent: 'follow-game',
				message: getTranslation(`You're now following this game.`),
			},
			{
				intent: 'decline-game-collaboration',
				message: getTranslation(`You've declined the invitation to collaborate.`),
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
	},
})
export default class RouteDiscoverGamesView extends BaseRouteComponent {
	@Inject({ from: CommentStoreManagerKey })
	commentManager!: CommentStoreManager;

	ads = setup(() => useAdsController());

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

	commentStore: CommentStoreModel | null = null;

	readonly Screen = Screen;

	private ratingChange$?: EventSubscription;

	private roleNames: { [k: string]: string } = {
		[Collaborator.ROLE_EQUAL_COLLABORATOR]: getTranslation('an equal collaborator'),
		[Collaborator.ROLE_COMMUNITY_MANAGER]: getTranslation('a community manager'),
		[Collaborator.ROLE_DEVELOPER]: getTranslation('a developer'),
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

	/**
	 * The cover height changes when we switch to not showing the full cover, so
	 * let's make sure we reset the autoscroll anchor so that it scrolls to the
	 * top again.
	 */
	get autoscrollAnchorKey() {
		return this.game.id;
	}

	routeCreated() {
		// This isn't needed by SSR or anything, so it's fine to call it here.
		this.bootstrapGame(parseInt(this.$route.params.id as string));
		this.setPageTheme();
		this._setAdSettings();

		// Any game rating change will broadcast this event. We catch it so we
		// can update the page with the new rating! Yay!
		if (!this.ratingChange$) {
			this.ratingChange$ = onRatingWidgetChange.subscribe(payload => {
				const { gameId, userRating } = payload;
				if (gameId === this.game.id) {
					this.setUserRating(userRating || null);
				}
			});
		}
	}

	routeResolved($payload: any) {
		this.setPageTheme();
		this._setAdSettings();

		if (this.commentStore) {
			releaseCommentStore(this.commentManager, this.commentStore);
			this.commentStore = null;
		}
		this.commentStore = lockCommentStore(this.commentManager, 'Game', this.game.id);
		setCommentCount(this.commentStore, $payload.commentsCount || 0);
	}

	routeDestroyed() {
		store.commit('theme/clearPageTheme', GameThemeKey);
		this._releaseAdSettings();

		this.ratingChange$?.close();

		if (this.commentStore) {
			releaseCommentStore(this.commentManager, this.commentStore);
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

	scrollToMultiplePackages() {
		this.showMultiplePackagesMessage();
		Scroll.to('game-releases');
	}

	private setPageTheme() {
		const theme = this.game?.theme ?? null;
		store.commit('theme/setPageTheme', {
			key: GameThemeKey,
			theme,
		});
	}

	private _setAdSettings() {
		if (!this.game) {
			return;
		}

		const settings = new AdSettingsContainer();
		settings.resource = this.game;
		settings.isPageDisabled = !this.game._should_show_ads;

		setPageAdsSettings(this.ads, settings);
	}

	private _releaseAdSettings() {
		releasePageAdsSettings(this.ads);
	}
}
