angular.module( 'App.Forums.Reply' ).directive( 'gjForumsReply', function()
{
	return {
		restrict: 'E',
		templateUrl: '/app/components/forums/reply/reply.html',
		scope: {
			itemId: '=itemId'
		},
		bindToController: true,
		controllerAs: 'ctrl',
		controller: function( $scope ) {}
	}
} );
