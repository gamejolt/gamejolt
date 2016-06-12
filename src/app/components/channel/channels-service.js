angular.module( 'App.Channels' ).service( 'Channels', function( App, Meta, Environment, gettextCatalog )
{
	this.images = {
		fnaf: '/app/components/channel/fnaf.png',
		horror: '/app/components/channel/horror.png',
		fangame: '/app/components/channel/fangame.png',
		analog: '/app/components/channel/analog.png',
		multiplayer: '/app/components/channel/multiplayer.png',
		vr: '/app/components/channel/vr.png',
	};
} );
