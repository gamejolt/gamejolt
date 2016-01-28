angular.module( 'App.Views' ).controller( 'Forums.Channels.ViewCtrl', function( $scope, App, Forum_Channel, Forum_Topic, payload )
{
	this.channel = new Forum_Channel( payload.channel );
	this.topics = Forum_Topic.populate( payload.topics );

	App.title = '#' + this.channel.name + ' forum';
} );
