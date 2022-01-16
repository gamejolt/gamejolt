import { setup } from 'vue-class-component';
import { Options, Vue } from 'vue-property-decorator';
import { State } from 'vuex-class';
import AppCommunityAddWidget from '../../../../_common/community/add-widget/add-widget.vue';
import AppCommunityDiscoverWidget from '../../../../_common/community/discover-widget/discover-widget.vue';
import AppScrollScroller from '../../../../_common/scroll/scroller/scroller.vue';
import { useCommonStore } from '../../../../_common/store/common-store';
import { Store } from '../../../store';
import AppShellCbarCommunity from './community/community.vue';
import AppShellCbarControls from './controls/controls.vue';
import AppShellCbarItem from './item/item.vue';

@Options({
	components: {
		AppScrollScroller,
		AppShellCbarControls,
		AppShellCbarItem,
		AppShellCbarCommunity,
		AppCommunityDiscoverWidget,
		AppCommunityAddWidget,
	},
})
export default class AppShellCbar extends Vue {
	commonStore = setup(() => useCommonStore());

	get user() {
		return this.commonStore.user;
	}
	@State hasCbar!: Store['hasCbar'];
	@State activeCommunity!: Store['activeCommunity'];
	@State('communities') joinedCommunities!: Store['communities'];

	get communities() {
		const communities = [...this.joinedCommunities];

		if (this.activeCommunity && !communities.find(i => i.id === this.activeCommunity!.id)) {
			communities.unshift(this.activeCommunity);
		}

		return communities;
	}
}