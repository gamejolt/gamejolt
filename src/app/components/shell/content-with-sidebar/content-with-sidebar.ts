import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';
import { Mutation, State } from 'vuex-class';
import AppScrollScroller from '../../../../_common/scroll/scroller/scroller.vue';
import { Store } from '../../../store/index';

/**
 * Can be used in pages to show a sidebar in the content that affects the shell.
 */
@Component({
	components: {
		AppScrollScroller,
	},
})
export default class AppShellContentWithSidebar extends Vue {
	@State hasCbar!: Store['hasCbar'];
	@State visibleLeftPane!: Store['visibleLeftPane'];
	@Mutation setHasContentSidebar!: Store['setHasContentSidebar'];

	get hasRouteContext() {
		return this.$route.meta.contextPane;
	}

	// JODO: Remove everything from this comment...
	$refs!: {
		sidebar: any;
	};

	get isShowingSidebar() {
		return this.visibleLeftPane === 'context';
	}

	mounted() {
		document.getElementById('shell-sidebar')?.appendChild(this.$refs.sidebar);
	}

	destroyed() {
		document.getElementById('shell-context-pane')?.remove();
	}
	// ...to this comment, once this sidebar is moved to a proper sidebar component.

	/**
	 * Sync into the store so that the AppShellBody can style appropriately.
	 */
	@Watch('isShowingSidebar', { immediate: true })
	onSidebarChange() {
		this.setHasContentSidebar(this.isShowingSidebar);
	}

	beforeDestroy() {
		this.setHasContentSidebar(false);
	}
}
