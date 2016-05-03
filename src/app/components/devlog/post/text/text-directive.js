angular.module( 'App.Devlog.Post.Text' ).directive( 'gjDevlogPostText', function( Environment )
{
	return {
		restrict: 'AE',
		templateUrl: '/app/components/devlog/post/text/text.html',
		scope: {
			id: '=',
		},
		bindToController: true,
		controllerAs: 'ctrl',
		controller: function() {}
	};
} );
