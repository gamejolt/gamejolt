import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';
import { Mutation, State } from 'vuex-class';
import AppScrollScroller from '../../../../../_common/scroll/scroller/scroller.vue';
import { SidebarState, SidebarStore } from '../../../../../_common/sidebar/sidebar.store';
import { Store } from '../../../../store/index';

@Component({
	components: {
		AppScrollScroller,
	},
})
export default class AppShellSidebarContext extends Vue {
	@SidebarState sidebarComponent!: SidebarStore['sidebarComponent'];
	@SidebarState sidebarProps!: SidebarStore['sidebarProps'];

	@State hasCbar!: Store['hasCbar'];
	@State visibleLeftPane!: Store['visibleLeftPane'];
	@Mutation setHasContentSidebar!: Store['setHasContentSidebar'];

	get isShowingSidebar() {
		return this.visibleLeftPane === 'context';
	}

	@Watch('isShowingSidebar', { immediate: true })
	onSidebarChange() {
		this.setHasContentSidebar(this.isShowingSidebar);
	}

	beforeDestroy() {
		this.setHasContentSidebar(false);
	}
}
