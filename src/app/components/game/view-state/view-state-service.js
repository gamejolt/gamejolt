angular.module( 'App.Game.ViewState' ).service( 'Game_ViewState', function( Game )
{
	this.setGame = function( game )
	{
		this.game = game;
		this.hasCover = false;
		this.showExtendedHeader = false;
		this.isDevlog = this.game.development_status == Game.DEVELOPMENT_STATUS_WIP;
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
