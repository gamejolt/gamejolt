import Component from 'vue-class-component';
import { Inject } from 'vue-property-decorator';
import { Api } from '../../../../../../../_common/api/api.service';
import { CommunityChannel } from '../../../../../../../_common/community/channel/channel.model';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../../../_common/route/route-component';
import { AppTooltip } from '../../../../../../../_common/tooltip/tooltip-directive';
import { CommunityCompetitionHeaderModal } from '../../../../../../components/community/competition/header-modal/header-modal.service';
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
		return this.routeStore.competition;
	}

	get channel() {
		return this.routeStore.channel!;
	}

	get canEditHeader() {
		return !!this.competition;
	}

	get pageHeaderProps() {
		if (!this.competition) {
			return {};
		}

		return {
			coverMediaItem: this.competition.header,
			coverMaxHeight: 250,
			coverEditable: true,
		};
	}

	routeResolved($payload: any) {
		if ($payload.channel) {
			const channel = new CommunityChannel($payload.channel);
			if (this.channel) {
				this.channel.assign(channel);
			} else if (channel.is_archived) {
				this.routeStore.archivedChannels.push(channel);
			}
		}
	}

	async onClickEditHeader() {
		await CommunityCompetitionHeaderModal.show(this.competition!);
	}
}
