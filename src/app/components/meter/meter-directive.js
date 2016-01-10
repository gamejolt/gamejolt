angular.module( 'App.Meter' ).directive( 'gjMeter', function()
{
	return {
		restrict: 'E',
		templateUrl: '/app/components/meter/meter.html',
		scope: {
			rating: '=meterRating',
			isBig: '=?meterBig',
		},
		bindToController: true,
		controllerAs: 'ctrl',
		controller: function()
		{
			this.level = (this.rating || 0) * 2;
		}
	};
} );
