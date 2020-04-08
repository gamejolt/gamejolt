import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import AppScrollScroller from '../../../../_common/scroll/scroller/scroller.vue';
import { AppTooltip } from '../../../../_common/tooltip/tooltip';
import { Store } from '../../../store';
import AppShellCbarAddItem from './add-item/add-item.vue';
import AppShellCbarDiscoverItem from './discover-item/discover-item.vue';
import AppShellCbarItem from './item/item.vue';

@Component({
	components: {
		AppShellCbarItem,
		AppShellCbarAddItem,
		AppShellCbarDiscoverItem,
		AppScrollScroller,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppShellCbar extends Vue {
	@State
	communities!: Store['communities'];
}
