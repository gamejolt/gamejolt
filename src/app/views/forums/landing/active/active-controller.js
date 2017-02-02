angular.module( 'App.Views.Forums' ).controller( 'Forums.Landing.ActiveCtrl', function( App, Forum_Topic, payload )
{
	App.title = 'Active Topics in All Forums';

	this.topics = Forum_Topic.populate( payload.topics );
} );
