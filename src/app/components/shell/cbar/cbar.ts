import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import AppCommunityAddWidget from '../../../../_common/community/add-widget/add-widget.vue';
import AppCommunityDiscoverWidget from '../../../../_common/community/discover-widget/discover-widget.vue';
import AppScrollScroller from '../../../../_common/scroll/scroller/scroller.vue';
import { Store } from '../../../store';
import AppShellCbarCommunity from './community/community.vue';
import AppShellCbarItem from './item/item.vue';

@Component({
	components: {
		AppScrollScroller,
		AppShellCbarItem,
		AppShellCbarCommunity,
		AppCommunityDiscoverWidget,
		AppCommunityAddWidget,
	},
})
export default class AppShellCbar extends Vue {
	@State
	communities!: Store['communities'];
}
