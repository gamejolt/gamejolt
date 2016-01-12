angular.module( 'App.Forums.Post' ).directive( 'gjForumsPost', function()
{
	return {
		restrict: 'E',
		templateUrl: '/app/components/forums/post/post.html',
		scope: {
            itemId: '=itemId'
        },
		bindToController: true,
		controllerAs: 'ctrl',
		controller: function( $scope ) {}
    }
} );
