import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';
import { Mutation, Getter, State } from 'vuex-class';
import * as View from '!view!./chat.html';

import { AppChatBubbles } from '../../chat/bubbles/bubbles';
import { AppChatSidebar } from '../../chat/sidebar/sidebar';
import { AppChatWindows } from '../../chat/windows/windows';
import { Mutations } from '../../../store/index';
import { ChatClient, ChatNewMessageEvent } from '../../chat/client';
import { Favicon } from '../../../../lib/gj-lib-client/components/favicon/favicon.service';
import { EventBus } from '../../../../lib/gj-lib-client/components/event-bus/event-bus.service';

@View
@Component({
	components: {
		AppChatBubbles,
		AppChatSidebar,
		AppChatWindows,
	}
})
export class AppShellChat extends Vue
{
	// Chat should be available since we only include in DOM if chat is
	// bootstrapped.
	@State chat: ChatClient;

	@Getter isRightPaneVisible: boolean;

	@Mutation( Mutations.toggleRightPane )
	toggleRightPane: Function;

	private isWindowFocused = false;
	private unfocusedNotificationsCount = 0;

	private newMessageCallback?: Function;
	private focusCallback?: EventListener;
	private blurCallback?: EventListener;

	get totalNotificationsCount()
	{
		return this.chat.roomNotificationsCount + this.unfocusedNotificationsCount;
	}

	mounted()
	{
		this.blurCallback = () => this.isWindowFocused = false;
		this.focusCallback = () => this.isWindowFocused = true;

		window.addEventListener( 'blur', this.blurCallback );
		window.addEventListener( 'focus', this.focusCallback );

		this.newMessageCallback = ( event: ChatNewMessageEvent ) =>
		{
			// If we have a general room open, and our window is unfocused or
			// minimized, then increment our room notifications count (since
			// they haven't seen this message yet). Note that if these messages
			// came in because we were priming output for a room with old
			// messages, we don't want to increase notification counts.
			if ( !this.isWindowFocused && this.chat.room ) {
				if ( !event.isPrimer && event.message && event.message.roomId === this.chat.room.id ) {
					++this.unfocusedNotificationsCount;
				}
			}
		}

		EventBus.on( 'Chat.newMessage', this.newMessageCallback );
	}

	destroyed()
	{
		Favicon.reset();

		if ( this.newMessageCallback ) {
			EventBus.off( 'Chat.newMessage', this.newMessageCallback );
			this.newMessageCallback = undefined;
		}

		if ( this.blurCallback ) {
			window.removeEventListener( 'blur', this.blurCallback );
			this.blurCallback = undefined;
		}

		if ( this.focusCallback ) {
			window.removeEventListener( 'blur', this.focusCallback );
			this.focusCallback = undefined;
		}
	}

	// When the chat sidebar is closed, we want to make sure we leave their
	// current active room.
	@Watch( 'isRightPaneVisible' )
	onRightPaneChange()
	{
		if ( this.isRightPaneVisible ) {
			return;
		}

		// If the chat sidebar is no longer visible, but we are in a room, close
		// it.
		if ( this.chat.isInRoom() ) {
			this.chat.minimizeRoom();
		}
	}

	// Keep the favicon up to date with chat notification counts.
	@Watch( 'totalNotificationsCount' )
	onNotificationsCountChange( count: number )
	{
		if ( count ) {
			Favicon.badge( count );
		}
		else {
			Favicon.reset();
		}
	}

	@Watch( 'isWindowFocused' )
	onWindowFocusChanged( isFocused: boolean )
	{
		// When the window is unfocused, start counting notifications for
		// current room.
		if ( !isFocused ) {

			// Notify the client that we are unfocused, so it should start
			// accumulating notifications for the current room.
			this.chat.setFocused( false );
		}
		// When we focus it back, clear out all accumulated notifications.
		else {

			// Set that we're not longer focused, and clear out room
			// notifications. The user has now "seen" the messages.
			this.unfocusedNotificationsCount = 0;

			// Notify the client that we aren't unfocused anymore.
			this.chat.setFocused( true );
		}
	}
}
