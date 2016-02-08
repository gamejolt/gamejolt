angular.module( 'App.Forms' ).directive( 'gjFormForumTopic', function( Form )
{
	var form = new Form( {
		model: 'Forum_Topic',
		template: '/app/components/forms/forum/topic/topic.html'
	} );

	form.scope.channel = '=';
	form.scope.gjFormCancelHandler = '&?';

	form.onInit = function( scope )
	{
		scope.formModel.channel_id = scope.channel.id;

		if ( scope.method == 'edit' ) {
			scope.formModel.content_markdown = scope.baseModel.main_post.content_markdown;
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
