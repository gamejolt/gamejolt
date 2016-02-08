angular.module( 'App.Forums.TopicList' ).directive( 'gjForumsTopicList', function()
{
	return {
		restrict: 'E',
		templateUrl: '/app/components/forums/topic-list/topic-list.html',
		scope: {
			topics: '=',
		},
		bindToController: true,
		controllerAs: 'ctrl',
		controller: angular.noop,
	}
} );
