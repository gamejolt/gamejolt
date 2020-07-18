import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';
import { Action, State } from 'vuex-class';
import { Screen } from '../../../../_common/screen/screen-service';
import AppScrollScroller from '../../../../_common/scroll/scroller/scroller.vue';
import AppShortkey from '../../../../_common/shortkey/shortkey.vue';
import { Store } from '../../../store';
import AppShellSidebarContext from './context/context.vue';
import AppShellSidebarLibrary from './library/library.vue';

let components: any = {
	AppScrollScroller,
	AppShortkey,
	AppShellSidebarChat: () => import(/* webpackChunkName: "chat" */ './chat/chat.vue'),
	AppShellSidebarLibrary,
	AppShellSidebarContext,
};

@Component({
	components,
})
export default class AppShellSidebar extends Vue {
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
