import { Options, Vue, Watch } from 'vue-property-decorator';
import { Mutation, State } from 'vuex-class';
import AppScrollScroller from '../../../../_common/scroll/scroller/scroller.vue';
import { SidebarState, SidebarStore } from '../../../../_common/sidebar/sidebar.store';
import { Store } from '../../../store/index';

@Options({
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

	beforeUnmount() {
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
