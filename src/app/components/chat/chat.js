angular.module( 'App.Chat', [ 'gj.Primus' ] ).constant( 'ChatConfig', {
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
