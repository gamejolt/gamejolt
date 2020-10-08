import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';
import { Mutation, State } from 'vuex-class';
import AppScrollScroller from '../../../../_common/scroll/scroller/scroller.vue';
import { SidebarState, SidebarStore } from '../../../../_common/sidebar/sidebar.store';
import { Store } from '../../../store/index';

/**
 * Can be used in pages to show a sidebar in the content that affects the shell.
 *
 * Pass a Vue file to the 'contextComponent' prop, and any required props for that component as 'contextProps', to use the sidebar.
 */
@Component({
	components: {
		AppScrollScroller,
	},
})
export default class AppShellContentWithSidebar extends Vue {
	@SidebarState activeContextPane!: SidebarStore['activeContextPane'];
	@State visibleLeftPane!: Store['visibleLeftPane'];
	@Mutation setHasContentSidebar!: Store['setHasContentSidebar'];

	get hasContext() {
		return !!this.activeContextPane;
	}

	get isShowingSidebar() {
		return this.visibleLeftPane === 'context';
	}

	beforeDestroy() {
		this.setHasContentSidebar(false);
	}

	/**
	 * Sync into the store so that the AppShellBody can style appropriately.
	 */
	@Watch('isShowingSidebar', { immediate: true })
	onSidebarChange() {
		this.setHasContentSidebar(this.isShowingSidebar);
	}
}
