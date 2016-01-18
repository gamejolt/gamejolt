angular.module( 'App.Trophy.List' ).directive( 'gjTrophyList', function()
{
	return {
		restrict: 'E',
		templateUrl: '/app/components/trophy/list/list.html',
		scope: {
			trophies: '=trophyListTrophies',
			achieved: '=trophyListAchieved',
		},
		bindToController: true,
		controllerAs: 'ctrl',
		controller: function( $scope, Game_Trophy )
		{
			this.achievedIndexed = Game_Trophy.indexAchieved( this.achieved );
		}
	};
} );
