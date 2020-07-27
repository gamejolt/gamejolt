import Vue from 'vue';
import { Component, InjectReactive } from 'vue-property-decorator';
import { Action, State } from 'vuex-class';
import { Community } from '../../../../../_common/community/community.model';
import AppExpand from '../../../../../_common/expand/expand.vue';
import { Screen } from '../../../../../_common/screen/screen-service';
import { AppState, AppStore } from '../../../../../_common/store/app-store';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import { Store } from '../../../../store/index';
import { ChatClient, ChatKey } from '../../../chat/client';
import AppShellCbarCommunity from '../community/community.vue';
import AppShellCbarItem from '../item/item.vue';

@Component({
	components: {
		AppShellCbarItem,
		AppShellCbarCommunity,
		AppExpand,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppShellCbarControls extends Vue {
	@InjectReactive(ChatKey) chat?: ChatClient;

	@AppState user!: AppStore['user'];
	@State activeCommunity!: Store['activeCommunity'];
	@State visibleLeftPane!: Store['visibleLeftPane'];
	@Action toggleLeftPane!: Store['toggleLeftPane'];

	readonly Screen = Screen;

	get highlight() {
		const theme = this.community?.theme || this.user?.theme;
		if (theme) {
			return '#' + theme.highlight_;
		} else {
			return null;
		}
	}

	get community(): Community | null {
		if (this.activeCommunity) {
			return this.activeCommunity;
		}

		return null;
	}

	get shouldShowCommunity() {
		return this.community && !this.community.is_member;
	}
}
