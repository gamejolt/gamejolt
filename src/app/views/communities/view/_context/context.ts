import { Options, Prop, Provide, Vue } from 'vue-property-decorator';
import { Action } from 'vuex-class';
import { isEditingCommunity } from '../../../../../_common/community/community.model';
import { Store } from '../../../../store';
import { CommunityRouteStore, CommunityRouteStoreKey } from '../view.store';
import AppCommunitiesViewCard from '../_card/card.vue';
import AppNavChannels from '../_nav/channels/channels.vue';
import AppNavEdit from '../_nav/edit/edit.vue';

@Options({
	components: {
		AppCommunitiesViewCard,
		AppNavChannels,
		AppNavEdit,
	},
})
export default class AppCommunitiesViewContext extends Vue {
	@Prop({ type: Object, required: true })
	@Provide({ to: CommunityRouteStoreKey })
	routeStore!: CommunityRouteStore;

	@Action toggleLeftPane!: Store['toggleLeftPane'];

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
