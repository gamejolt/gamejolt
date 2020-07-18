import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { propOptional } from '../../../../../utils/vue';
import { number } from '../../../../../_common/filters/number';
import { Screen } from '../../../../../_common/screen/screen-service';
import { Store } from '../../../../store/index';

@Component({})
export default class AppShellCbarItem extends Vue {
	@Prop(propOptional(Boolean, false)) isControl!: boolean;
	@Prop(propOptional(Boolean, false)) isActive!: boolean;
	@Prop(propOptional(Boolean, false)) isUnread!: boolean;
	@Prop(propOptional(String)) highlight?: string;
	@Prop(propOptional(Number, 0)) notificationCount!: number;

	@State visibleLeftPane!: Store['visibleLeftPane'];

	readonly Screen = Screen;

	get notificationCountText() {
		return this.notificationCount > 99 ? '99+' : number(this.notificationCount);
	}

	get backgroundColor() {
		return this.showAsActive ? this.highlight : null;
	}

	// We want a context indicator only for non-control items that are the current active item.
	get hasContextIndicator() {
		return this.isActive && !this.isControl && (Screen.isSm || Screen.isMd);
	}

	// We want to use this instead of the 'isActive' prop so that we only show one 'active' item at a time.
	// Otherwise, cbar control items could show as active along with an active community.
	get showAsActive() {
		return (
			this.isActive &&
			(!this.visibleLeftPane || this.visibleLeftPane === 'context' || this.isControl)
		);
	}

	get isContextShowing() {
		return this.showAsActive && this.visibleLeftPane === 'context';
	}
}
