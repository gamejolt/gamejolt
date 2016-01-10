angular.module( 'App.Forms' ).directive( 'gjFormSaveRoom', function( $rootScope, $q, Form, Chat, Chat_Room )
{
	var form = new Form( {
		model: 'Chat_Room',
		template: '/app/components/forms/chat/save-room/save-room.html',
	} );

	form.onInit = function( scope )
	{
		// Some defaults.
		if ( scope.method == 'add' ) {
			scope.formModel._type = Chat_Room.TYPE_OPEN_GROUP;
			scope.formModel.is_viral_room = true;

			scope.$watchGroup( [
				'formModel._type',
				'formModel.is_viral_room',
			],
			function()
			{
				scope.formModel.type = scope.formModel._type;
				if ( scope.formModel.type == Chat_Room.TYPE_CLOSED_GROUP && scope.formModel.is_viral_room ) {
					scope.formModel.type = Chat_Room.TYPE_VIRAL_GROUP;
				}
			} );
		}
	};

	return form;
} );
