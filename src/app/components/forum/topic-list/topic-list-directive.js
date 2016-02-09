angular.module( 'App.Forum.TopicList' ).directive( 'gjForumTopicList', function()
{
	return {
		restrict: 'E',
		templateUrl: '/app/components/forum/topic-list/topic-list.html',
		scope: {
			topics: '=',
		},
		bindToController: true,
		controllerAs: 'ctrl',
		controller: function( $scope, Screen )
		{
			$scope.Screen = Screen;
		},
	}
} );
