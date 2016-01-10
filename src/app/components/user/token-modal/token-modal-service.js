angular.module( 'App.User.TokenModal' ).service( 'User_TokenModal', function( $modal )
{
	this.show = function()
	{
		var modalInstance = $modal.open( {
			templateUrl: '/app/components/user/token-modal/token-modal.html',
			controller: 'User_TokenModalCtrl',
			controllerAs: 'modalCtrl',
			size: 'sm',
		} );

		return modalInstance.result;
	};
} );

