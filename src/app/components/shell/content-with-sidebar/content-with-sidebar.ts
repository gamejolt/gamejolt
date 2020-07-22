import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { Mutation, State } from 'vuex-class';
import { propOptional } from '../../../../utils/vue';
import AppScrollScroller from '../../../../_common/scroll/scroller/scroller.vue';
import {
	SidebarAction,
	SidebarMutation,
	SidebarStore,
} from '../../../../_common/sidebar/sidebar.store';
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
	@Prop({ default: null }) contextComponent!: Vue | null;
	@Prop(propOptional(Object, null)) contextProps!: Record<string, unknown> | null;

	@State hasCbar!: Store['hasCbar'];
	@State visibleLeftPane!: Store['visibleLeftPane'];
	@Mutation setHasContentSidebar!: Store['setHasContentSidebar'];
	@SidebarMutation setSidebarComponent!: SidebarStore['setSidebarComponent'];
	@SidebarMutation setSidebarProps!: SidebarStore['setSidebarProps'];
	@SidebarAction clearSidebarContext!: SidebarStore['clearSidebarContext'];

	get hasRouteContext() {
		return this.$route.meta.contextPane;
	}

	get isShowingSidebar() {
		return this.visibleLeftPane === 'context';
	}

	mounted() {
		this.setSidebarComponent(this.contextComponent);
		this.setSidebarProps(this.contextProps);
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
		this.clearSidebarContext();
	}

	get contextPropsTest() {
		return this.contextProps;
	}

	@Watch('contextComponent')
	onContextComponentChange(component: Vue) {
		this.setSidebarComponent(component);
	}

	@Watch('contextProps')
	onContextPropsChange(props: Record<string, unknown>) {
		console.warn('f');
		this.setSidebarProps(props);
	}
}
