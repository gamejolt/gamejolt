angular.module( 'App.Views.Forums' ).controller( 'Forums.Topics.CreateCtrl', function( $scope, $state, App, Forum_Channel, Forum_Topic, Growls, payload )
{
	App.title = 'Create a New Topic';

	this.channel = new Forum_Channel( payload.channel );

	this.onCreate = function( formModel )
	{
		// If their post was marked as spam, make sure they know.
		if ( formModel.status == Forum_Topic.STATUS_SPAM ) {
			Growls.info( 'Your topic has been marked for review. Please allow some time for it to show on the site.', 'Topic Needs Review' );
		}

		$state.go( 'forums.channels.view.page', { name: this.channel.name } );
	};
} );
