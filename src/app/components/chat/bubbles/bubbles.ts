import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { Getter, Mutation, State } from 'vuex-class';
import * as View from '!view!./bubbles.html?style=./bubbles.styl';

import { makeObservableService } from '../../../../lib/gj-lib-client/utils/vue';
import { Mutations } from '../../../store/index';
import { ChatClient } from '../client';

@View
@Component({})
export class AppChatBubbles extends Vue
{
	@State chat: ChatClient;
	@Getter isRightPaneVisible: boolean;

	@Mutation( Mutations.toggleRightPane )
	toggleRightPane: Function;

	Screen = makeObservableService( Screen );

	activateRoom( roomId: number )
	{
		if ( !this.isRightPaneVisible ) {
			this.toggleRightPane();

			if ( !this.chat.isInRoom( roomId ) ) {
				this.chat.maximizeRoom( roomId );
			}
		}
		else {
			if ( this.chat.isInRoom( roomId ) ) {
				this.chat.minimizeRoom();
			}
			else {
				this.chat.maximizeRoom( roomId );
			}
		}
	}
}
