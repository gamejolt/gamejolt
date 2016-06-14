import { lazyModule } from './../../../../../../../../lib/gj-lib-client/util/ng1-helpers';

class ListCtrl
{
	currentPage: number;
	perPage: number;
	totalCount: number;
	commentCounts: any;
	viewCounts: any;
	newsArticles: any[];

	/*@ngInject*/
	constructor( $scope, $stateParams, App, Game_NewsArticle, gettextCatalog, payload )
	{
		App.title = gettextCatalog.getString( 'dash.games.news.page_title', { game: $scope.manageCtrl.game.title } );

		this.currentPage = $stateParams.page || 1;
		this.perPage = payload.perPage || 0;
		this.totalCount = payload.newsArticlesCount || 0;

		this.commentCounts = payload.commentCounts || {};
		this.viewCounts = payload.viewCounts || {};

		this.newsArticles = Game_NewsArticle.populate( payload.newsArticles );
	}
}

lazyModule( 'App.Views' ).controller( 'Dashboard.Developer.Games.Manage.Devlog.ListCtrl', ListCtrl );
