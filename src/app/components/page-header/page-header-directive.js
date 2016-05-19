angular.module( 'App.PageHeader' ).component( 'gjPageHeader', {
	templateUrl: '/app/components/page-header/page-header.html',
	transclude: {
		coverButtons: '?gjPageHeaderCoverButtons',
		content: 'gjPageHeaderContent',
		spotlight: '?gjPageHeaderSpotlight',
		nav: '?gjPageHeaderNav',
		controls: '?gjPageHeaderControls',
	},
	bindings: {
		coverMediaItem: '<?',
		shouldAffixNav: '<?',
	},
	controller: function( $scope, Screen )
	{
		$scope.Screen = Screen;
	},
} );
