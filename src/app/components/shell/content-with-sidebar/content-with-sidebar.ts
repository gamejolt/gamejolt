import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';
import { Mutation, State } from 'vuex-class';
import { Screen } from '../../../../_common/screen/screen-service';
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
	@Mutation setHasContentSidebar!: Store['setHasContentSidebar'];
	@State visibleContextPane!: Store['visibleContextPane'];
	@State hasCbar!: Store['hasCbar'];

	// JODO: remove
	$refs!: {
		sidebar: any;
	};

	get isShowingSidebar() {
		if (Screen.isLg) {
			return true;
		}

		if (!Screen.isXs) {
			return !!this.visibleContextPane;
		}

		return this.hasCbar;
	}

	// JODO: remove
	mounted() {
		document.getElementById('shell')?.appendChild(this.$refs.sidebar);
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
