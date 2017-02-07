import { NgModule, bundle } from 'ng-metadata/core';
import { FaviconModule } from '../../../lib/gj-lib-client/components/favicon/favicon.module';

@NgModule({
	imports: [
		FaviconModule,
	],
})
class ChatModule { }

// The ng2 module has to go first since it has dependencies that App.Chat may need.
angular.module( 'App.Chat', [ bundle( ChatModule ).name ] )
.constant( 'ChatConfig', {
	MSG_NORMAL: 0,
	MSG_SYSTEM: 1,

	ROOM_PM: 'pm',
	ROOM_OPEN_GROUP: 'open_group',
	ROOM_CLOSED_GROUP: 'closed_group',
	ROOM_VIRAL_GROUP: 'viral_group',

	MAX_NUM_MESSAGES: 200,
	MAX_NUM_TABS: 10,

	SITE_MOD_PERMISSION: 2,
} );

require( './auto-scroll/auto-scroll-directive' );
require( './bubbles/bubbles-directive' );
require( './client/client-service' );
require( './notification/notification-service' );
require( './room-details-modal/room-details-modal-controller' );
require( './room-details-modal/room-details-modal-service' );
require( './room-storage/room-storage-service' );
require( './save-room-modal/save-room-modal-controller' );
require( './save-room-modal/save-room-modal-service' );
require( './sidebar/sidebar-directive' );
require( './user-collection/user-collection-service' );
require( './user-list/user-list-directive' );
require( './window/window-directive' );
require( './window/send/send-directive' );
require( './windows/windows-directive' );
require( './chat-service' );

require( '../../../lib/gj-lib-client/components/chat/room/room' );
