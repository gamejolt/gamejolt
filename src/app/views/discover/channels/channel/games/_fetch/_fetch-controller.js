angular.module( 'App.Views' ).controller( 'Discover.Channels.Channel.Games._FetchCtrl', function(
	$scope, $state, $stateParams, $timeout, $interval, App, Meta, Game, SplitTest, dateFilter, gettext, gettextCatalog, payload )
{
	var _this = this;

	console.log( payload );

	var gamesCtrl = $scope.gamesCtrl;
	// var section = $stateParams.section;
	// var category = $stateParams.category || null;

	this.games = Game.populate( payload.games );
	gamesCtrl.processPayload( $stateParams, payload );

	// gamesCtrl.gamesCount = payload.gamesCount;
	// gamesCtrl.perPage = payload.perPage;
	// gamesCtrl.currentPage = $stateParams.page || 1;
	// gamesCtrl.category = category;


	// var sectionTranslationKey = 'games.list.section_' + section;
	// var sectionHuman = gettextCatalog.getString( sectionTranslationKey );
	// var categoryHuman = ' ';
	// if ( category ) {
	// 	var categoryTranslationKey = 'discover.categories.' + category.replace( '-', '_' );
	// 	categoryHuman = gettextCatalog.getString( categoryTranslationKey );
	// 	categoryHuman = (' ' + categoryHuman + ' ');
	// }

	// var translationId = 'games.list.page_title';
	// if ( category == 'rpg' ) {
	// 	translationId += '_rpg';
	// }
	// else if ( category == 'other' ) {
	// 	translationId += '_other';
	// }

	// App.title = gettextCatalog.getString( translationId, { section: sectionHuman, category: categoryHuman } );
	// Meta.description = payload.metaDescription;

	// if ( category == 'rpg' ) {
	// 	/// {{ category }} is available as the translated category label
	// 	gamesCtrl.descriptiveCategory = gettextCatalog.getString( 'games.list.descriptive_category_rpg', { category: categoryHuman } );
	// }
	// else if ( category == 'other' ) {
	// 	/// {{ category }} is available as the translated category label
	// 	gamesCtrl.descriptiveCategory = gettextCatalog.getString( 'games.list.descriptive_category_other', { category: categoryHuman } );
	// }
	// else {
	// 	/// {{ category }} is available as the translated category label
	// 	/// In the case of no category, {{ category }} will be empty ''
	// 	gamesCtrl.descriptiveCategory = gettextCatalog.getString( 'games.list.descriptive_category', { category: categoryHuman } );
	// }
} );
