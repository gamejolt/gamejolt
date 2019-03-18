import { AppFocusWhen } from 'game-jolt-frontend-lib/components/form-vue/focus-when.directive';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import AppJolticon from 'game-jolt-frontend-lib/vue/components/jolticon/jolticon.vue';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { ChatClient } from '../../client';

@Component({
	components: {
		AppJolticon,
	},
	directives: {
		AppFocusWhen,
	},
})
export default class AppChatWindowSend extends Vue {
	@State chat!: ChatClient;

	message = '';
	multiLineMode = false;

	$refs!: {
		input: HTMLTextAreaElement;
	};

	readonly Screen = Screen;

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

	sendClicked() {
		this.$refs.input.focus();
		this.sendMessage();
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
