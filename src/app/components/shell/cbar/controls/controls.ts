import { Inject, Options, Vue } from 'vue-property-decorator';
import { Action, State } from 'vuex-class';
import { Screen } from '../../../../../_common/screen/screen-service';
import { AppState, AppStore } from '../../../../../_common/store/app-store';
import { DefaultTheme } from '../../../../../_common/theme/theme.model';
import { ThemeState, ThemeStore } from '../../../../../_common/theme/theme.store';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import { Store } from '../../../../store/index';
import { ChatStore, ChatStoreKey } from '../../../chat/chat-store';
import AppShellCbarItem from '../item/item.vue';

@Options({
	components: {
		AppShellCbarItem,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppShellCbarControls extends Vue {
	@Inject({ from: ChatStoreKey })
	chatStore!: ChatStore;

	@AppState user!: AppStore['user'];
	@ThemeState theme?: ThemeStore['theme'];
	@State activeCommunity!: Store['activeCommunity'];
	@State visibleLeftPane!: Store['visibleLeftPane'];
	@Action toggleLeftPane!: Store['toggleLeftPane'];

	declare $refs: {
		stickerOrigin: HTMLDivElement;
	};

	readonly Screen = Screen;

	get chat() {
		return this.chatStore.chat;
	}

	get highlight() {
		const theme = this.activeCommunity?.theme ?? this.theme ?? DefaultTheme;
		if (theme) {
			return '#' + theme.darkHighlight_;
		}

		return null;
	}
}
