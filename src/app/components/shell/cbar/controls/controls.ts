import Vue from 'vue';
import { Component, InjectReactive } from 'vue-property-decorator';
import { Action, State } from 'vuex-class';
import { Screen } from '../../../../../_common/screen/screen-service';
import { AppState, AppStore } from '../../../../../_common/store/app-store';
import { Theme } from '../../../../../_common/theme/theme.model';
import { ThemeState, ThemeStore } from '../../../../../_common/theme/theme.store';
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

	@AppState user!: AppStore['user'];
	@ThemeState theme?: ThemeStore['theme'];
	@State activeCommunity!: Store['activeCommunity'];
	@State visibleLeftPane!: Store['visibleLeftPane'];
	@Action toggleLeftPane!: Store['toggleLeftPane'];

	readonly Screen = Screen;

	get highlight() {
		const theme = this.activeCommunity?.theme || this.theme || new Theme(null);
		if (theme) {
			return '#' + theme.highlight_;
		}

		return null;
	}
}
