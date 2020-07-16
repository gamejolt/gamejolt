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

	get isShowingContext() {
		return this.isActive && this.visibleLeftPane === 'context';
	}

	// JODO: This should never show on Lg since the context pane should always be open.
	// For Sm and Md, this should show on the community with the active route, probably when it's not showing the context pane.
	// Xs, I'm not sure yet if we should show or not.
	get showContextIndicator() {
		return this.isActive && !this.isControl && (Screen.isSm || Screen.isMd);
	}
}
