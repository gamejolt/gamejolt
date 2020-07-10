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
	@State visibleContextPane!: Store['visibleContextPane'];
	@State visibleLeftPane!: Store['visibleLeftPane'];
	@Mutation setHasContentSidebar!: Store['setHasContentSidebar'];

	// JODO: remove
	$refs!: {
		sidebar: any;
	};

	get hasRouteContext() {
		return this.$route.meta.contextPane;
	}

	get isShowingSidebar() {
		/**
		 * JODO:
		 * Implement sidebar functionality between context and other pane options.
		 * The left-sidebar should always be showing if Screen.isLg and the route has a contextPane meta.
		 * For all other breakpoints,
		 */
		return this.visibleLeftPane === 'context';

		// if (Screen.isLg) {
		// 	return true;
		// }

		// if (!Screen.isXs) {
		// 	return !!this.visibleContextPane;
		// }

		// return this.hasCbar;
	}

	// JODO: remove - context/sidebar will probably be in a component with cbar, but this will let us test in the meantime
	mounted() {
		document.getElementById('shell-sidebar')?.appendChild(this.$refs.sidebar);
	}

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
