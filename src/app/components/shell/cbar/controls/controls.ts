import Vue from 'vue';
import { Component, InjectReactive } from 'vue-property-decorator';
import { Action, State } from 'vuex-class';
import { Screen } from '../../../../../_common/screen/screen-service';
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
	@State visibleLeftPane!: Store['visibleLeftPane'];
	@Action toggleLeftPane!: Store['toggleLeftPane'];

	readonly Screen = Screen;
}
