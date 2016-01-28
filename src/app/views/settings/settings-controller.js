angular.module( 'App.Views' ).controller( 'SettingsCtrl', function( App, gettextCatalog )
{
	App.title = gettextCatalog.getString( 'settings.page_title');
} );
