angular.module( 'App.Trophy.Completion' ).directive( 'gjTrophyCompletion', function()
{
	return {
		restrict: 'E',
		template: require( '!html-loader!./completion.html' ),
		scope: {
			total: '=trophyCompletionTotal',
			achieved: '=trophyCompletionAchieved',
			experience: '=trophyCompletionExperience',
		},
		bindToController: true,
		controllerAs: 'ctrl',
		controller: function()
		{
			this.completionRate = Math.ceil( this.achieved / this.total * 100 );
		}
	};
} );
