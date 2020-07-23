import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { Action, State } from 'vuex-class';
import AppCommunityAddWidget from '../../../../_common/community/add-widget/add-widget.vue';
import AppCommunityDiscoverWidget from '../../../../_common/community/discover-widget/discover-widget.vue';
import AppScrollScroller from '../../../../_common/scroll/scroller/scroller.vue';
import { AppState, AppStore } from '../../../../_common/store/app-store';
import { Store } from '../../../store';
import AppShellCbarCommunity from './community/community.vue';
import AppShellCbarControls from './controls/controls.vue';
import AppShellCbarItem from './item/item.vue';

@Component({
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
	@AppState user!: AppStore['user'];
	@State communities!: Store['communities'];
	@State visibleLeftPane!: Store['visibleLeftPane'];
	@State hasCbar!: Store['hasCbar'];
	@Action toggleLeftPane!: Store['toggleLeftPane'];

	get activeCommunityTheme() {
		if (this.communities[0] && this.communities[0].theme) {
			return this.communities[0].theme;
		}

		return null;
	}
}
