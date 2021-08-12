import { Options } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { LocationRedirect } from '../../../../../utils/router';
import { Api } from '../../../../../_common/api/api.service';
import { Game } from '../../../../../_common/game/game.model';
import AppGameThumbnail from '../../../../../_common/game/thumbnail/thumbnail.vue';
import { BaseRouteComponent, RouteResolver } from '../../../../../_common/route/route-component';
import { AppStore } from '../../../../../_common/store/app-store';
import { populateTrophies } from '../../../../../_common/user/trophy/trophy-utils';
import { UserBaseTrophy } from '../../../../../_common/user/trophy/user-base-trophy.model';
import AppTrophyCard from '../../../../components/trophy/card/card.vue';
import AppTrophyCompletion from '../../../../components/trophy/completion/completion.vue';
import AppTrophyListPaged from '../../../../components/trophy/list/paged/paged.vue';
import { RouteStore, RouteStoreModule } from '../../profile.store';

type CompletionData = {
	experience: number;
	totalCount: number;
	achievedCount: number;
};

@Options({
	name: 'RouteProfileTrophiesGame',
	components: {
		AppTrophyCard,
		AppTrophyListPaged,
		AppTrophyCompletion,
		AppGameThumbnail,
	},
})
@RouteResolver({
	deps: { params: ['id'] },
	async resolver({ route }) {
		const payload = await Api.sendRequest(
			'/web/profile/trophies/game/@' + route.params.username + '/' + route.params.id
		);

		// If the game doesn't have any trophies or the user has not achieved any for this game, redirect to their overview.
		// This is to prevent showing an empty game page with no entry in the left nav.
		if (!payload.trophies || payload.trophies.length === 0) {
			const redirect = new LocationRedirect({
				name: 'profile.trophies',
			});
			return redirect;
		}

		return payload;
	},
})
export default class RouteProfileTrophiesGame extends BaseRouteComponent {
	@RouteStoreModule.State
	user!: RouteStore['user'];

	@State
	app!: AppStore;

	game: Game | null = null;
	trophies: UserBaseTrophy[] = [];
	completion: CompletionData | null = null;

	get routeTitle() {
		if (this.user && this.game) {
			return this.$gettextInterpolate(
				`@%{ user }'s achieved Trophies for the game %{ title }`,
				{
					user: this.user.username,
					title: this.game.title,
				}
			);
		}
		return null;
	}

	get listLoadMoreUrl() {
		if (this.game) {
			return `/web/profile/trophies/game/@${this.user!.username}/${this.game.id}`;
		}
	}

	get isLoggedInUser() {
		return this.user && this.app.user && this.app.user.id === this.user.id;
	}

	routeResolved($payload: any) {
		this.game = new Game($payload.game);
		if ($payload.trophies) {
			this.trophies = populateTrophies($payload.trophies);
		}
		if ($payload.completion) {
			this.completion = $payload.completion;
		}
	}
}
