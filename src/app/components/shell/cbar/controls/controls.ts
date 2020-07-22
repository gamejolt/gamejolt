import Vue from 'vue';
import { Component, InjectReactive, Prop } from 'vue-property-decorator';
import { Action, State } from 'vuex-class';
import { propOptional } from '../../../../../utils/vue';
import { Screen } from '../../../../../_common/screen/screen-service';
import { AppState, AppStore } from '../../../../../_common/store/app-store';
import { Theme } from '../../../../../_common/theme/theme.model';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import { Store } from '../../../../store/index';
import { ChatClient, ChatKey } from '../../../chat/client';
import AppShellCbarItem from '../item/item.vue';

@Component({
	components: {
		AppShellCbarItem,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppShellCbarControls extends Vue {
	@InjectReactive(ChatKey) chat?: ChatClient;
	@Prop(propOptional(Theme, null)) communityTheme!: Theme;

	@AppState user!: AppStore['user'];
	@State visibleLeftPane!: Store['visibleLeftPane'];
	@Action toggleLeftPane!: Store['toggleLeftPane'];

	readonly Screen = Screen;

	get highlight() {
		const theme = this.communityTheme || this.user?.theme;
		if (theme) {
			return '#' + theme.highlight_;
		} else {
			return null;
		}
	}
}
