import { setup } from 'vue-class-component';
import { Inject, Options, Vue } from 'vue-property-decorator';
import { Action, State } from 'vuex-class';
import { Screen } from '../../../../../_common/screen/screen-service';
import { useCommonStore } from '../../../../../_common/store/common-store';
import { DefaultTheme } from '../../../../../_common/theme/theme.model';
import { useThemeStore } from '../../../../../_common/theme/theme.store';
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
	commonStore = setup(() => useCommonStore());

	@Inject({ from: ChatStoreKey })
	chatStore!: ChatStore;

	get user() {
		return this.commonStore.user;
	}
	@State activeCommunity!: Store['activeCommunity'];
	@State visibleLeftPane!: Store['visibleLeftPane'];
	@Action toggleLeftPane!: Store['toggleLeftPane'];

	themeStore = setup(() => useThemeStore());

	declare $refs: {
		stickerOrigin: HTMLDivElement;
	};

	readonly Screen = Screen;

	get chat() {
		return this.chatStore.chat;
	}

	get highlight() {
		const theme = this.activeCommunity?.theme ?? this.themeStore.theme ?? DefaultTheme;
		if (theme) {
			return '#' + theme.darkHighlight_;
		}

		return null;
	}
}
