import Component from 'vue-class-component';
import { Inject } from 'vue-property-decorator';
import { enforceLocation } from '../../../../../utils/router';
import AppAlertDismissable from '../../../../../_common/alert/dismissable/dismissable.vue';
import { Api } from '../../../../../_common/api/api.service';
import { CommunityChannel } from '../../../../../_common/community/channel/channel.model';
import { Community } from '../../../../../_common/community/community.model';
import { Game } from '../../../../../_common/game/game.model';
import { BaseRouteComponent, RouteResolver } from '../../../../../_common/route/route-component';
import { Screen } from '../../../../../_common/screen/screen-service';
import { CommunityRouteStore, CommunityRouteStoreKey } from '../view.store';

@Component({
	name: 'RouteCommunitiesViewEdit',
	components: {
		AppAlertDismissable,
	},
})
@RouteResolver({
	deps: { params: ['id'] },
	async resolver({ route }) {
		const payload = await Api.sendRequest('/web/dash/communities/' + route.params.id, {});

		if (payload && payload.community) {
			const redirect = enforceLocation(route, { path: payload.community.path });
			if (redirect) {
				return redirect;
			}
		}

		return payload;
	},
	// resolveStore({ payload }) {
	// 	if (payload) {
	// 		routeStore.commit('populate', payload);
	// 	}
	// },
})
export default class RouteCommunitiesViewEdit extends BaseRouteComponent {
	@Inject(CommunityRouteStoreKey) routeStore!: CommunityRouteStore;

	// @RouteStoreModule.State
	// community!: RouteStore['community'];

	// @RouteStoreModule.State
	// collaboration!: RouteStore['collaboration'];

	readonly Screen = Screen;

	get routeTitle() {
		return this.$gettextInterpolate(`Edit Community %{ community }`, {
			community: this.community.name,
		});
	}

	get community() {
		return this.routeStore.community;
	}

	get isOwner() {
		return false;
		// The owner's collaboration is not returned from backend.
		// return this.collaboration === null;
	}

	get canEditMedia() {
		return this.community.hasPerms('community-media');
	}

	routeResolved($payload: any) {
		this.routeStore.updateCommunity($payload.community);
		// this.community = new Community(payload.community);
		// this.collaboration = payload.collaboration ? new Collaborator(payload.collaboration) : null;
	}

	onDetailsChange(community: Community) {
		this.$emit('details-change', community);
	}

	onChannelsChange(channels: CommunityChannel[]) {
		this.$emit('channels-change', channels);
	}

	onGamesChange(games: Game[]) {
		this.$emit('games-change', games);
	}
}
