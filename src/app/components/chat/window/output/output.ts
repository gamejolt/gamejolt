import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Subscription } from 'rxjs/Subscription';
import * as View from '!view!./output.html?style=./output.styl';

import { Chat } from '../../chat.service';
import { ChatMessage } from '../../message';
import { ChatRoom } from '../../room';
import { Screen } from '../../../../../lib/gj-lib-client/components/screen/screen-service';
import { date } from '../../../../../lib/gj-lib-client/vue/filters/date';
import { AppFadeCollapse } from '../../../../../lib/gj-lib-client/components/fade-collapse/fade-collapse';

@View
@Component({
	name: 'chat-window-output',
	components: {
		AppFadeCollapse,
	},
	filters: {
		date,
	}
})
export class AppChatWindowOutput extends Vue
{
	@Prop( Object ) room: ChatRoom;
	@Prop( Array ) messages: ChatMessage[];

	client = Chat.client;
	ChatMessage = ChatMessage;

	private shouldScroll = true;
	private resize$: Subscription;

	date = date;

	async mounted()
	{
		this.resize$ = Screen.resizeChanges.subscribe( () => this.autoscroll() );

		// Give it some time to render.
		await this.$nextTick();
		this.autoscroll();
	}

	destroyed()
	{
		this.resize$.unsubscribe();
	}

	/**
	 * We watch when they scroll to see if they've moved away from the
	 * bottom of the view. If they have, then we shouldn't autoscroll until
	 * they scroll back to the bottom.
	 */
	onScroll()
	{
		// We skip checking the scroll if the element isn't scrollable yet.
		// This'll be the case if the height of the element is less than its
		// scroll height.
		if ( this.$el.scrollHeight < this.$el.offsetHeight ) {
			return;
		}

		if ( this.$el.scrollHeight - (this.$el.scrollTop + this.$el.offsetHeight) > 30 ) {
			this.shouldScroll = false;
		}
		else {
			this.shouldScroll = true;
		}
	}

	async onMessageTransition()
	{
		if ( this.shouldScroll ) {
			this.autoscroll();
		}
	}

	private autoscroll()
	{
		this.$el.scrollTop = this.$el.scrollHeight + 10000;
	}

	muteUser( userId: number )
	{
		this.client.mute( userId, this.room.id );
	}

	removeMessage( msgId: number )
	{
		this.client.removeMessage( msgId, this.room.id );
	}

	shouldFadeCollapse( msg: ChatMessage )
	{
		if ( msg.contentRaw.split( '\n' ).length > 6 || msg.contentRaw.length >= 500 ) {
			return true;
		}
		return false;
	}
}
