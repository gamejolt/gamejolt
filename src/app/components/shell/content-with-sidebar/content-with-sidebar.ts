import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';
import { Mutation } from 'vuex-class';
import { Screen } from '../../../../_common/screen/screen-service';
import AppScrollScroller from '../../../../_common/scroll/scroller/scroller.vue';
import { Store } from '../../../store';

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

	get isShowingSidebar() {
		return Screen.isLg;
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
