angular.module( 'App.Devlog.Post.Milestone' ).directive( 'gjDevlogPostMilestone', function( Environment )
{
	return {
		restrict: 'AE',
		templateUrl: '/app/components/devlog/post/milestone/milestone.html',
		scope: {},
		bindToController: true,
		controllerAs: 'ctrl',
		controller: function() {}
	};
} );
