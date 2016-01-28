angular.module( 'App.Forms' ).directive( 'gjFormForumTopic', function( Form )
{
	var form = new Form( {
		model: 'Forum_Topic',
		template: '/app/components/forms/forum/topic/topic.html'
	} );

	form.scope.channel = '=';

	form.onInit = function( scope )
	{
		scope.formModel.channel_id = scope.channel.id;
	};

	return form;
} );
