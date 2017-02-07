angular.module( 'App.Trophy.List' ).directive( 'gjTrophyList', function()
{
	return {
		restrict: 'E',
		template: require( '!html-loader!./list.html' ),
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
