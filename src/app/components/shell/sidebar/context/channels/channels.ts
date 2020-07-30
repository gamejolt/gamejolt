import Vue from 'vue';
import { Component, Prop, Provide } from 'vue-property-decorator';
import { Action } from 'vuex-class';
import { propRequired } from '../../../../../../utils/vue';
import { isEditingCommunity } from '../../../../../../_common/community/community.model';
import { Store } from '../../../../../store';
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

	@Action toggleLeftPane!: Store['toggleLeftPane'];

	// All context panes with required props should need this - otherwise it could
	// cause issues when transitioning between panes with different props.
	isLoading = true;
	async mounted() {
		await this.$nextTick();
		this.isLoading = false;
	}

	get isEditing() {
		return isEditingCommunity(this.$route);
	}

	onChangeSection(path: string) {
		// If changing channels, hide the left pane/context sidebar.
		if (this.$route.path !== path) {
			this.toggleLeftPane();
		}
	}
}
