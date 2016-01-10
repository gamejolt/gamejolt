angular.module( 'App.Views' ).controller( 'Forums.Channels.ViewCtrl', function( $scope, App, $stateParams )
{
	App.title = "#" + $stateParams.channelName + " Discussion Forum";
	$scope.channelName = $stateParams.channelName;
} );
