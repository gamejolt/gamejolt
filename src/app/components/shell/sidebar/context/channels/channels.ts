import Vue from 'vue';
import { Component, Prop, Provide } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../../../../utils/vue';
import { Community } from '../../../../../../_common/community/community.model';
import {
	CommunityRouteStore,
	CommunityRouteStoreKey,
} from '../../../../../views/communities/view/view.store';
import AppCommunitiesViewCard from '../../../../../views/communities/view/_card/card.vue';
import AppNavChannels from '../../../../../views/communities/view/_nav/channels/channels.vue';
import AppNavEdit from '../../../../../views/communities/view/_nav/edit/edit.vue';

@Component({
	components: {
		AppCommunitiesViewCard,
		AppNavChannels,
		AppNavEdit,
	},
})
export default class AppShellSidebarContextChannels extends Vue {
	@Provide(CommunityRouteStoreKey)
	@Prop(propRequired(CommunityRouteStore))
	routeStore!: CommunityRouteStore;

	@Prop(propOptional(Community, null)) community!: Community | null;
	@Prop(propOptional(Boolean, false)) isEditing!: boolean;
}
