import { Component } from 'vue-property-decorator';
import { Api } from '../../../../../_common/api/api.service';
import { BaseRouteComponent, RouteResolver } from '../../../../../_common/route/route-component';
import { populateTrophies } from '../../../../../_common/user/trophy/trophy-utils';
import { UserBaseTrophy } from '../../../../../_common/user/trophy/user-base-trophy.model';
import AppTrophyCard from '../../../../components/trophy/card/card.vue';
import AppTrophyListPaged from '../../../../components/trophy/list/paged/paged.vue';
import { RouteStore, RouteStoreModule } from '../../profile.store';

@Component({
	name: 'RouteProfileTrophiesAll',
	components: {
		AppTrophyCard,
		AppTrophyListPaged,
	},
})
@RouteResolver({
	resolver: ({ route }) => Api.sendRequest('/web/profile/trophies/all/@' + route.params.username),
})
export default class RouteProfileTrophiesAll extends BaseRouteComponent {
	@RouteStoreModule.State
	user!: RouteStore['user'];

	trophies: UserBaseTrophy[] = [];

	get routeTitle() {
		if (this.user) {
			return this.$gettextInterpolate(`@%{ user }'s achieved Trophies`, {
				user: this.user.username,
			});
		}
		return null;
	}

	get hasTrophies() {
		return this.trophies.length > 0;
	}

	get listLoadMoreUrl() {
		return `/web/profile/trophies/all/@${this.user!.username}`;
	}

	routeResolved($payload: any) {
		if ($payload.trophies) {
			const trophies = populateTrophies($payload.trophies);
			this.trophies.push(...trophies);
		}
	}
}
