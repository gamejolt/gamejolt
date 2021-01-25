import Component from 'vue-class-component';
import { Inject } from 'vue-property-decorator';
import { Api } from '../../../../../../../_common/api/api.service';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../../../_common/route/route-component';
import { AppTooltip } from '../../../../../../../_common/tooltip/tooltip-directive';
import { AppCommunityPerms } from '../../../../../../components/community/perms/perms';
import AppPageHeaderControls from '../../../../../../components/page-header/controls/controls.vue';
import AppPageHeader from '../../../../../../components/page-header/page-header.vue';
import { CommunityRouteStore, CommunityRouteStoreKey } from '../../../view.store';
import AppCommunitiesViewPageContainer from '../../../_page-container/page-container.vue';

@Component({
	name: 'RouteCommunitiesViewEditChannelsEdit',
	components: {
		AppPageHeader,
		AppCommunityPerms,
		AppCommunitiesViewPageContainer,
		AppPageHeaderControls,
	},
	directives: {
		AppTooltip,
	},
})
@RouteResolver({
	deps: { params: ['id', 'channel'] },
	resolver: ({ route }) =>
		Api.sendRequest(
			'/web/dash/communities/channels/' + route.params.id + '/' + route.params.channel
		),
})
export default class RouteCommunitiesViewEditChannelsEdit extends BaseRouteComponent {
	@Inject(CommunityRouteStoreKey) routeStore!: CommunityRouteStore;

	get competition() {
		return this.routeStore.competition!;
	}

	get channel() {
		return this.routeStore.channel!;
	}

	routeResolved($payload: any) {
		// Assign updated channel information from payload to live channel instance.
		if ($payload.channel) {
			this.channel.assign($payload.channel);
		}
	}
}
