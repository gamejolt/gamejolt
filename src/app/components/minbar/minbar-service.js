angular.module( 'App.Minbar' ).service( 'Minbar', function()
{
	this.items = [];

	this.add = function( item )
	{
		this.items.push( item );
		return item;
	};

	this.remove = function( item )
	{
		_.remove( this.items, item );
	};
} );
