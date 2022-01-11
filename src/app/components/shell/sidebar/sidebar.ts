import { defineAsyncComponent } from '@vue/runtime-core';
import { setup } from 'vue-class-component';
import { Options, Vue, Watch } from 'vue-property-decorator';
import { Action, State } from 'vuex-class';
import { Screen } from '../../../../_common/screen/screen-service';
import AppScrollScroller from '../../../../_common/scroll/scroller/scroller.vue';
import AppShortkey from '../../../../_common/shortkey/shortkey.vue';
import { useCommonStore } from '../../../../_common/store/common-store';
import { Store } from '../../../store';
import AppShellSidebarContext from './context/context.vue';
import AppShellSidebarLibrary from './library/library.vue';

const components = {
	AppScrollScroller,
	AppShortkey,
	AppShellSidebarChat: defineAsyncComponent(() => import('./chat/chat.vue')),
	AppShellSidebarLibrary,
	AppShellSidebarContext,
};

@Options({
	components,
})
export default class AppShellSidebar extends Vue {
	commonStore = setup(() => useCommonStore());

	get user() {
		return this.commonStore.user;
	}
	@State visibleLeftPane!: Store['visibleLeftPane'];
	@Action toggleLeftPane!: Store['toggleLeftPane'];
	@Action checkBackdrop!: Store['checkBackdrop'];

	readonly Screen = Screen;

	@Watch('Screen.isLg')
	onBreakpointChange() {
		// Since our context pane is an overlay for breakpoints other than Lg,
		// we want to trigger this action to add or remove the backdrop as needed.
		this.checkBackdrop();
	}
}
