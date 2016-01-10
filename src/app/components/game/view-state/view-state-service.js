angular.module( 'App.Game.ViewState' ).service( 'Game_ViewState', function()
{
	this.setGame = function( game )
	{
		this.game = game;
		this.showCover = false;
		this.showExtendedHeader = false;
	};

	this.showExtended = function()
	{
		this.showCover = !!this.game.img_header;
		this.showExtendedHeader = true;
	};

	this.hideExtended = function()
	{
		this.showCover = false;
		this.showExtendedHeader = false;
	};

	this.clear = function()
	{
		this.game = undefined;
		this.showCover = false;
		this.showExtendedHeader = false;
	};

	this.clear();
} );
