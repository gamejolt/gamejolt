import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { Action, State } from 'vuex-class';
import AppCommunityAddWidget from '../../../../_common/community/add-widget/add-widget.vue';
import AppCommunityDiscoverWidget from '../../../../_common/community/discover-widget/discover-widget.vue';
import AppScrollScroller from '../../../../_common/scroll/scroller/scroller.vue';
import { AppState, AppStore } from '../../../../_common/store/app-store';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { Store } from '../../../store';
import AppShellFriendRequestPopover from '../friend-request-popover/friend-request-popover.vue';
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
		AppShellFriendRequestPopover,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppShellCbar extends Vue {
	@AppState user!: AppStore['user'];
	@State communities!: Store['communities'];
	@State visibleLeftPane!: Store['visibleLeftPane'];
	@State hasCbar!: Store['hasCbar'];

	@Action toggleLeftPane!: Store['toggleLeftPane'];
}
