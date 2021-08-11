import { Options, Prop, Vue } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { propOptional } from '../../../../../utils/vue';
import { number } from '../../../../../_common/filters/number';
import { Screen } from '../../../../../_common/screen/screen-service';
import { SidebarState, SidebarStore } from '../../../../../_common/sidebar/sidebar.store';
import { Store } from '../../../../store/index';

@Options({})
export default class AppShellCbarItem extends Vue {
	@Prop(propOptional(Boolean, false)) isControl!: boolean;
	@Prop(propOptional(Boolean, false)) isActive!: boolean;
	@Prop(propOptional(Boolean, false)) isUnread!: boolean;
	@Prop(propOptional(String)) highlight?: string;
	@Prop(propOptional(Number, 0)) notificationCount!: number;

	@SidebarState activeContextPane!: SidebarStore['activeContextPane'];
	@State visibleLeftPane!: Store['visibleLeftPane'];

	readonly Screen = Screen;

	get notificationCountText() {
		return this.notificationCount > 99 ? '99+' : number(this.notificationCount);
	}

	// We want a context indicator only for non-control items that are the current active item (selected or active route).
	get hasContextIndicator() {
		return !Screen.isLg && this.isActive && !this.isControl && this.activeContextPane;
	}

	// There can be two active items between the cbar controls and normal cbar items,
	// so we check the pane information to figure out what should be the active item visually.
	get showAsActive() {
		return (
			this.isActive &&
			(!this.visibleLeftPane || this.visibleLeftPane === 'context' || this.isControl)
		);
	}

	// Check what the actual active item is and if it's showing a pane.
	get isShowingPane() {
		return this.showAsActive && !!this.visibleLeftPane;
	}
}
