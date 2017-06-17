import Vue from 'vue';
import { State } from 'vuex-class';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./send.html?style=./send.styl';

import { AppJolticon } from '../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppFocusWhen } from '../../../../../lib/gj-lib-client/components/form-vue/focus-when.directive';
import { makeObservableService } from '../../../../../lib/gj-lib-client/utils/vue';
import { Screen } from '../../../../../lib/gj-lib-client/components/screen/screen-service';
import { ChatClient } from '../../client';

@View
@Component({
	components: {
		AppJolticon,
	},
	directives: {
		AppFocusWhen,
	},
})
export class AppChatWindowSend extends Vue {
	@State chat: ChatClient;

	message = '';
	multiLineMode = false;

	Screen = makeObservableService(Screen);

	// Vue will trigger all events that match, which means the "enter" event
	// always fires. We use this to know if we handled the event in another
	// event handler already.
	private handledEvent = false;

	onChange() {
		// If they remove whole message, remove multi-line mode.
		if (this.multiLineMode && this.message.length === 0) {
			this.multiLineMode = false;
		}
	}

	async shiftEnter() {
		this.multiLineMode = true;
		this.eventHandled();
	}

	async ctrlEnter() {
		this.sendMessage();
		this.eventHandled();
	}

	enter(event: Event) {
		if (this.handledEvent) {
			return;
		}

		if (!this.multiLineMode) {
			this.sendMessage();
			event.preventDefault();
			return;
		}
	}

	sendMessage() {
		const message = this.message;
		this.chat.queueMessage(message);

		this.message = '';
		this.multiLineMode = false;
	}

	/**
	 * Marks that the event has been handled since the `enter` event always gets
	 * called. This way `enter` will know now to do anything since the event was
	 * already handled in another handler.
	 */
	private async eventHandled() {
		this.handledEvent = true;
		await this.$nextTick();
		this.handledEvent = false;
	}
}
