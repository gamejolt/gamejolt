import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./send.html?style=./send.styl';

import { Chat } from '../../chat.service';
import { AppJolticon } from '../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppFocusWhen } from '../../../../../lib/gj-lib-client/components/form-vue/focus-when.directive';
import { makeObservableService } from '../../../../../lib/gj-lib-client/utils/vue';
import { Screen } from '../../../../../lib/gj-lib-client/components/screen/screen-service';

@View
@Component({
	name: 'chat-window-send',
	components: {
		AppJolticon,
	},
	directives: {
		AppFocusWhen,
	},
})
export class AppChatWindowSend extends Vue
{
	message = '';
	multiLineMode = false;

	client = Chat.client;
	Screen = makeObservableService( Screen );

	// Vue will trigger all events that match, which means the "enter" event
	// always fires. We use this to know if we handled the event in another
	// event handler already.
	private handledEvent = false;

	onChange()
	{
		// If they remove whole message, remove multi-line mode.
		if ( this.multiLineMode && this.message.length === 0 ) {
			this.multiLineMode = false;
		}
	}

	async shiftEnter()
	{
		this.multiLineMode = true;

		this.handledEvent = true;
		await this.$nextTick();
		this.handledEvent = false;

		// Hacky. Triggers an auto scroll through an event.
		// This is since the send box moves up a bit, it is no longer scrolled correctly.
		// $rootScope.$broadcast( 'Chat.triggerAutoScroll' );
	}

	async ctrlEnter()
	{
		this.sendMessage();

		this.handledEvent = true;
		await this.$nextTick();
		this.handledEvent = false;
	}

	enter()
	{
		if ( this.handledEvent ) {
			return;
		}

		if ( !this.multiLineMode ) {
			this.sendMessage();
		}
	}

	sendMessage()
	{
		const message = this.message;
		this.client.queueMessage( message );

		this.message = '';
		this.multiLineMode = false;
	}
}


// angular.module( 'App.Chat' ).directive( 'gjChatWindowSend', function( $rootScope )
// {
// 	return {
// 		restrict: 'E',
// 		template: require( '!html-loader!./send.html' ),
// 		scope: true,
// 		controllerAs: 'ctrl',
// 		controller: function( $element, Chat )
// 		{
// 			this.message = '';
// 			this.multiLineMode = false;


// 		}
// 	};
// } );
