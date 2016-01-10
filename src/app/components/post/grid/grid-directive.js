angular.module( 'App.Post.Grid' ).directive( 'gjPostGrid', function()
{
	return {
		restrict: 'E',
		templateUrl: '/app/components/post/grid/grid.html',
		scope: {},
		bindToController: {
			items: '=postGridItems',
			hideThumb: '=?postGridHideThumb',
			size: '@?postGridSize',
		},
		controllerAs: 'ctrl',
		controller: function()
		{
			// Default.
			this.colClasses = 'col-xs-9 col-sm-4';

			if ( this.size == 'small' ) {
				this.colClasses = 'col-xs-9 col-sm-6';
			}
		},
	};
} );
