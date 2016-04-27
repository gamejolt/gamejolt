angular.module( 'App.Devlog.Post.Text' ).directive( 'gjDevlogPostText', function( Environment )
{
	return {
		restrict: 'AE',
		templateUrl: '/app/components/devlog/post/text/text.html',
		bindToController: true,
		controllerAs: 'postCtrl',
		controller: function() {}
	};
} );
