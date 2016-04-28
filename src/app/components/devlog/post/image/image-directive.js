angular.module( 'App.Devlog.Post.Image' ).directive( 'gjDevlogPostImage', function( Environment )
{
	return {
		restrict: 'AE',
		templateUrl: '/app/components/devlog/post/image/image.html',
		scope: {
			id: '=',
		},
		bindToController: true,
		controllerAs: 'postCtrl',
		controller: function() {}
	};
} );
