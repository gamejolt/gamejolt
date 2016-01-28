angular.module( 'App.Views' ).controller( 'Forums.Topics.CreateCtrl', function( $scope, $state, App, Forum_Channel, payload )
{
	App.title = 'Create a New Topic';

	this.channel = new Forum_Channel( payload.channel );

	this.onCreate = function()
	{
		$state.go( 'forums.channels.view', { name: this.channel.name } );
	};
} );
