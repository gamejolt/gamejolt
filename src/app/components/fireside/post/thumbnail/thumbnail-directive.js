angular.module( 'App.Fireside.Post.Thumbnail' ).directive( 'gjFiresidePostThumbnail', function()
{
	return {
		restrict: 'E',
		templateUrl: '/app/components/fireside/post/thumbnail/thumbnail.html',
		scope: {},
		bindToController: {
			post: '=firesidePost'
		},
		controllerAs: 'ctrl',
		controller: function( $scope, Environment )
		{
			$scope.Environment = Environment;
		}
	};
} );
