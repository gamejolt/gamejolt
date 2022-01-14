import { setup } from 'vue-class-component';
import { Options, Vue } from 'vue-property-decorator';
import AppCommunityAddWidget from '../../../../_common/community/add-widget/add-widget.vue';
import AppCommunityDiscoverWidget from '../../../../_common/community/discover-widget/discover-widget.vue';
import AppScrollScroller from '../../../../_common/scroll/scroller/scroller.vue';
import { useCommonStore } from '../../../../_common/store/common-store';
import { useAppStore } from '../../../store';
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
	store = setup(() => useAppStore());
	commonStore = setup(() => useCommonStore());

	get user() {
		return this.commonStore.user;
	}

	get hasCbar() {
		return this.store.hasCbar;
	}

	get activeCommunity() {
		return this.store.activeCommunity;
	}

	get communities() {
		const communities = [...this.store.communities];

		if (this.activeCommunity && !communities.find(i => i.id === this.activeCommunity!.id)) {
			communities.unshift(this.activeCommunity);
		}

		return communities;
	}
}
