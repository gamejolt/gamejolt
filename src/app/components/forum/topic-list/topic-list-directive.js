angular.module( 'App.Forum.TopicList' ).directive( 'gjForumTopicList', function()
{
	return {
		restrict: 'E',
		template: require( '!html-loader!./topic-list.html' ),
		scope: {
			topics: '=',
			postCountPerPage: '=',
		},
		bindToController: true,
		controllerAs: 'ctrl',
		controller: function( $scope, Screen )
		{
			$scope.Screen = Screen;

			this.getPostPage = function( topic )
			{
				if ( !this.postCountPerPage ) {
					return undefined;
				}
				var page = Math.ceil( topic.replies_count / this.postCountPerPage );
				if ( page == 1 ) {
					return undefined;
				}
				return page;
			};
		},
	}
} );
