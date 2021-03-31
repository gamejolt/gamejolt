import Vue from 'vue';
import { Component, InjectReactive } from 'vue-property-decorator';
import { Action, State } from 'vuex-class';
import { Screen } from '../../../../../_common/screen/screen-service';
import { AppState, AppStore } from '../../../../../_common/store/app-store';
import {
	EventBus,
	EventBusDeregister,
} from '../../../../../_common/system/event/event-bus.service';
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

	private stickerReceivedDeregister?: EventBusDeregister;

	$refs!: {
		stickerOrigin: HTMLDivElement;
	};

	readonly Screen = Screen;

	mounted() {
		this.stickerReceivedDeregister = EventBus.on(
			'chat-sticker-received',
			(stickerData: any) => {
				const img = document.createElement('img');
				img.className = 'sticker-img-q347i9o5v6ynw489';
				img.src = stickerData.img_url;
				img.addEventListener('animationend', () =>
					this.$refs.stickerOrigin.removeChild(img)
				);

				this.$refs.stickerOrigin.appendChild(img);
			}
		);
	}

	destroyed() {
		if (this.stickerReceivedDeregister) {
			this.stickerReceivedDeregister();
			this.stickerReceivedDeregister = undefined;
		}
	}

	get highlight() {
		const theme = this.activeCommunity?.theme || this.theme || new Theme(null);
		if (theme) {
			return '#' + theme.darkHighlight_;
		}

		return null;
	}
}
