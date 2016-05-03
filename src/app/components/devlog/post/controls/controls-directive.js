angular.module( 'App.Devlog.Post.Controls' ).directive( 'gjDevlogPostControls', function( Environment )
{
	return {
		restrict: 'AE',
		templateUrl: '/app/components/devlog/post/controls/controls.html',
		scope: {
			id: '=',
		},
		bindToController: true,
		controllerAs: 'ctrl',
		controller: function() {}
	};
} );
