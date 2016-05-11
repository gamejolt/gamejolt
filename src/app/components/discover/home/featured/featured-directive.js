angular.module( 'App.Views' ).component( 'gjDiscoverHomeFeatured', {
	bindings: {
		items: '<featuredItems',
	},
	templateUrl: '/app/components/discover/home/featured/featured.html',
	controller: function( Screen )
	{
		this.Screen = Screen;
		this.itemsSmUp = this.items.slice( 2 );
	},
} );
