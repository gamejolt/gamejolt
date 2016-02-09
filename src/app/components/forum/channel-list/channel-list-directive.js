angular.module( 'App.Forum.ChannelList' ).directive( 'gjForumChannelList', function()
{
	return {
		restrict: 'E',
		templateUrl: '/app/components/forum/channel-list/channel-list.html',
		scope: {
			category: '=',
			channels: '=',
			listType: '@'
		},
		bindToController: true,
		controllerAs: 'ctrl',
		controller: function( $scope, Screen )
		{
			$scope.Screen = Screen;
		},
	}
} );
