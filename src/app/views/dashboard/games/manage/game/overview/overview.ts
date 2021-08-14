import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../../../_common/api/api.service';
import AppExpand from '../../../../../../../_common/expand/expand.vue';
import { number } from '../../../../../../../_common/filters/number';
import { Game } from '../../../../../../../_common/game/game.model';
import AppGraphWidget from '../../../../../../../_common/graph/widget/widget.vue';
import AppProgressBar from '../../../../../../../_common/progress/bar/bar.vue';
import { AppProgressPoller } from '../../../../../../../_common/progress/poller/poller';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../../../_common/route/route-component';
import { AppState, AppStore } from '../../../../../../../_common/store/app-store';
import { AppTooltip } from '../../../../../../../_common/tooltip/tooltip-directive';
import { AppCommunityPerms } from '../../../../../../components/community/perms/perms';
import AppGameDevStageSelector from '../../../../../../components/forms/game/dev-stage-selector/dev-stage-selector.vue';
import { AppGamePerms } from '../../../../../../components/game/perms/perms';
import { RouteStore, RouteStoreModule } from '../../manage.store';

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
	filters: {
		number,
	},
})
@RouteResolver({
	deps: {},
	resolver: ({ route }) =>
		Api.sendRequest('/web/dash/developer/games/overview/' + route.params.id),
})
export default class RouteDashGamesManageGameOverview extends BaseRouteComponent {
	@AppState
	user!: AppStore['user'];

	@RouteStoreModule.State
	game!: RouteStore['game'];

	@RouteStoreModule.State
	canPublish!: RouteStore['canPublish'];

	@RouteStoreModule.Action
	publish!: RouteStore['publish'];

	@RouteStoreModule.Action
	uncancel!: RouteStore['uncancel'];

	viewCount = 0;
	downloadCount = 0;
	commentCount = 0;
	dislikeCount = 0;

	hasBuildsProcessing = false;

	readonly Game = Game;

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

		return number(this.likeCount / this.voteCount, {
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
