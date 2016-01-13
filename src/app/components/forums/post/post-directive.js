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
		controller: function( $scope )
        {    
            this.repliesActive = false;
            
            this.viewReplies = function()
            {
                if ( !this.repliesActive ) {
                    // TODO: Load in the replies using an API request here
                    this.repliesActive = true;
                } else {
                    this.repliesActive = false;
                }
            }
        }
    }
} );
