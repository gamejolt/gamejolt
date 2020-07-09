import Vue from 'vue';
import { Component, InjectReactive } from 'vue-property-decorator';
import { Action, State } from 'vuex-class';
import AppCommunityAddWidget from '../../../../_common/community/add-widget/add-widget.vue';
import AppCommunityDiscoverWidget from '../../../../_common/community/discover-widget/discover-widget.vue';
import AppScrollScroller from '../../../../_common/scroll/scroller/scroller.vue';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { Store } from '../../../store';
import { ChatClient, ChatKey } from '../../chat/client';
import AppShellFriendRequestPopover from '../friend-request-popover/friend-request-popover.vue';
import AppShellCbarCommunity from './community/community.vue';
import AppShellCbarItem from './item/item.vue';

@Component({
	components: {
		AppScrollScroller,
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
	@InjectReactive(ChatKey) chat?: ChatClient;

	@State
	communities!: Store['communities'];

	@State
	visibleLeftPane!: Store['visibleLeftPane'];

	@State
	hasCbar!: Store['hasCbar'];

	@Action
	toggleLeftPane!: Store['toggleLeftPane'];
}
