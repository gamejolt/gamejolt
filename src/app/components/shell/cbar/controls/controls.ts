import { setup } from 'vue-class-component';
import { Inject, Options, Vue } from 'vue-property-decorator';
import { Screen } from '../../../../../_common/screen/screen-service';
import { useCommonStore } from '../../../../../_common/store/common-store';
import { DefaultTheme } from '../../../../../_common/theme/theme.model';
import { useThemeStore } from '../../../../../_common/theme/theme.store';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import { useAppStore } from '../../../../store/index';
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
	store = setup(() => useAppStore());
	commonStore = setup(() => useCommonStore());

	@Inject({ from: ChatStoreKey })
	chatStore!: ChatStore;

	get user() {
		return this.commonStore.user;
	}

	get activeCommunity() {
		return this.store.activeCommunity;
	}

	get visibleLeftPane() {
		return this.store.visibleLeftPane;
	}

	get toggleLeftPane() {
		return this.store.toggleLeftPane;
	}

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
