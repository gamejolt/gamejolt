angular.module( 'App.Views' ).controller( 'Forums.CategoryCtrl', function( $scope, App, $stateParams )
{
	// Workaround to capitalise the first letter
	// Not sure if there is a helper to do this
	$scope.categoryName =  $stateParams.categoryName.charAt(0).toUpperCase() + $stateParams.categoryName.slice(1);
	
	App.title = $scope.categoryName + " Discussion Channels";
} );
