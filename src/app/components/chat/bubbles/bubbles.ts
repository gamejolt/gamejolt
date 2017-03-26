import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { Getter, Mutation } from 'vuex-class';
import * as View from '!view!./bubbles.html?style=./bubbles.styl';

import { makeObservableService } from '../../../../lib/gj-lib-client/utils/vue';
import { Chat } from '../chat.service';
import { Mutations } from '../../../store/index';

@View
@Component({
	name: 'chat-bubbles',
})
export class AppChatBubbles extends Vue
{
	@Getter isRightPaneVisible: boolean;

	@Mutation( Mutations.toggleRightPane )
	toggleRightPane: Function;

	Screen = makeObservableService( Screen );
	client = Chat.client;

	activateRoom( roomId: number )
	{
		if ( !this.isRightPaneVisible ) {
			this.toggleRightPane();

			if ( !this.client.isInRoom( roomId ) ) {
				this.client.maximizeRoom( roomId );
			}
		}
		else {
			if ( this.client.isInRoom( roomId ) ) {
				this.client.minimizeRoom();
			}
			else {
				this.client.maximizeRoom( roomId );
			}
		}
	}
}
