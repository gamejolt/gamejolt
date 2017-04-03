import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./user-list.html?style=./user-list.styl';

import { ChatRoom } from '../room';
import { Chat } from '../chat.service';
import { ChatUser } from '../user';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { number } from '../../../../lib/gj-lib-client/vue/filters/number';

@View
@Component({
	components: {
		AppJolticon,
	},
	filters: {
		number,
	}
})
export class AppChatUserList extends Vue
{
	@Prop( Array ) users: ChatUser[];
	@Prop( Object ) room?: ChatRoom;
	@Prop( Boolean ) showPm?: boolean;
	@Prop( Boolean ) showModTools?: boolean;

	Chat = Chat;
	client = Chat.client;

	filterQuery = '';
	moderatingUser: ChatUser | null = null;

	// We do it this way we can reduce watches and freeze the URL for the user.
	getUserProfileUrl( user: ChatUser )
	{
		return user.url;
	}

	onUserClick( user: ChatUser )
	{
		// Otherwise, the default is just to follow the link, which is fine.
		if ( !this.showPm ) {
			return;
		}

		this.client.enterRoom( user.roomId, true );
	}

	canModerate( user: ChatUser )
	{
		if ( !this.room || !this.showModTools ) {
			return false;
		}

		return this.client.canModerate( this.room, user );
	}

	moderateUser( user: ChatUser )
	{
		if ( this.moderatingUser && this.moderatingUser.id === user.id ) {
			this.moderatingUser = null;
		}
		else {
			this.moderatingUser = user;
		}
	}

	mod( user: ChatUser )
	{
		if ( !this.room || !this.showModTools ) {
			return;
		}
		this.client.mod( user.id, this.room.id );
	}

	demod( user: ChatUser )
	{
		if ( !this.room || !this.showModTools ) {
			return;
		}
		this.client.demod( user.id, this.room.id );
	}

	mute( user: ChatUser )
	{
		if ( !this.room || !this.showModTools ) {
			return;
		}
		this.client.mute( user.id, this.room.id );
	}

	unmute( user: ChatUser )
	{
		if ( !this.room || !this.showModTools ) {
			return;
		}
		this.client.unmute( user.id, this.room.id );
	}
}
