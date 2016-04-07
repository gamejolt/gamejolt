angular.module( 'App.Game.ViewState' ).service( 'Game_ViewState', function()
{
	this.setGame = function( game )
	{
		this.game = game;
		this.hasCover = false;
		this.showExtendedHeader = false;
	};

	this.showExtended = function()
	{
		this.hasCover = !!this.game.img_header;
		this.showExtendedHeader = true;
	};

	this.hideExtended = function()
	{
		this.hasCover = false;
		this.showExtendedHeader = false;
	};

	this.clear = function()
	{
		this.game = undefined;
		this.hasCover = false;
		this.showExtendedHeader = false;
	};

	this.clear();
} );
