import { setup } from 'vue-class-component';
import { Options, Vue, Watch } from 'vue-property-decorator';
import { Mutation, State } from 'vuex-class';
import AppScrollScroller from '../../../../../_common/scroll/scroller/scroller.vue';
import { useSidebarStore } from '../../../../../_common/sidebar/sidebar.store';
import { Store } from '../../../../store/index';

@Options({
	components: {
		AppScrollScroller,
	},
})
export default class AppShellSidebarContext extends Vue {
	sidebarStore = setup(() => useSidebarStore());

	get activeContextPane() {
		return this.sidebarStore.activeContextPane;
	}

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

	beforeUnmount() {
		this.setHasContentSidebar(false);
	}
}
