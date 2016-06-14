import { lazyModule } from './../../../../../../../../lib/gj-lib-client/util/ng1-helpers';

class AddCtrl
{
	/*@ngInject*/
	constructor(
		private $state: angular.ui.IStateService,
		App,
		private Growls,
		gettextCatalog
	)
	{
		App.title = gettextCatalog.getString( 'Add Devlog Post' );
	}

	onSubmitted()
	{
		this.Growls.success(
			// gettextCatalog.getString( 'dash.games.news.add.added_growl' ),
			// gettextCatalog.getString( 'dash.games.news.add.added_growl_title' )
		);
		this.$state.go( '^.list' );
	}
}

lazyModule( 'App.Views' ).controller( 'Dashboard.Developer.Games.Manage.Devlog.AddCtrl', AddCtrl );
