angular.module( 'App.Forms.Forum' ).directive( 'gjFormForumPost', function( Form )
{
	var form = new Form( {
		model: 'Forum_Post',
		template: require( './post.html' ),
		resetOnSubmit: true,
	} );

	form.scope.topic = '=';
	form.scope.gjFormCancelHandler = '&?';
	form.scope.replyTo = '=?';

	form.onInit = function( scope )
	{
		scope.formModel.topic_id = scope.topic.id;

		if ( scope.replyTo ) {
			scope.formModel.reply_to = scope.replyTo.id;  // Post ID.
		}

		scope.onCancel = function()
		{
			if ( scope.gjFormCancelHandler ) {
				scope.gjFormCancelHandler();
			}
		};
	};

	return form;
} );
