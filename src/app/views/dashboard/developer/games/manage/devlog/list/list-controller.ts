import { Injectable, Inject } from 'ng-metadata/core';
import { App } from './../../../../../../../app-service';

@Injectable()
export class ListCtrl
{
	currentPage: number;
	perPage: number;
	totalCount: number;
	commentCounts: any;
	viewCounts: any;
	newsArticles: any[];

	constructor(
		@Inject( '$scope' ) $scope: ng.IScope,
		@Inject( '$stateParams' ) $stateParams: ng.ui.IStateParamsService,
		@Inject( 'App' ) app: App,
		@Inject( 'Game_NewsArticle' ) newsArticle: any,
		@Inject( 'gettextCatalog' ) gettextCatalog: ng.gettext.gettextCatalog,
		@Inject( 'payload' ) payload: any
	)
	{
		app.title = gettextCatalog.getString( 'dash.games.news.page_title', { game: $scope['manageCtrl'].game.title } );

		this.currentPage = $stateParams['page'] || 1;
		this.perPage = payload.perPage || 0;
		this.totalCount = payload.newsArticlesCount || 0;

		this.commentCounts = payload.commentCounts || {};
		this.viewCounts = payload.viewCounts || {};

		this.newsArticles = newsArticle.populate( payload.newsArticles );
	}
}
