angular.module( 'App.Views' ).controller( 'Discover.Games.List.CategoryCtrl', function(
	$scope, $state, $stateParams, $timeout, $interval, App, Meta, Game, SplitTest, dateFilter, gettext, gettextCatalog, payload )
{
	var _this = this;

	// Just pull in the translation labels we need.
	gettext( 'discover.categories.all' );
	gettext( 'discover.categories.arcade' );
	gettext( 'discover.categories.action' );
	gettext( 'discover.categories.adventure' );
	gettext( 'discover.categories.platformer' );
	gettext( 'discover.categories.puzzle' );
	gettext( 'discover.categories.rpg' );
	gettext( 'discover.categories.shooter' );
	gettext( 'discover.categories.sports' );
	gettext( 'discover.categories.strategy_sim' );
	gettext( 'discover.categories.other' );

	gettext( 'games.list.page_title' );
	gettext( 'games.list.page_title_rpg' );
	gettext( 'games.list.page_title_other' );

	gettext( 'games.list.section_featured' );
	gettext( 'games.list.section_new' );
	gettext( 'games.list.section_fresh' );
	gettext( 'games.list.section_hot' );
	gettext( 'games.list.section_best' );

	var listCtrl = $scope.listCtrl;
	var section = $stateParams.section;
	var category = $stateParams.category || null;

	this.games = Game.populate( payload.games );
	listCtrl.gamesCount = payload.gamesCount;
	listCtrl.perPage = payload.perPage;
	listCtrl.currentPage = $stateParams.page || 1;
	listCtrl.section = section;
	listCtrl.category = category;

	listCtrl.hasCleanGameFilters = SplitTest.hasCleanGameFilters( payload );

	if ( $stateParams.date ) {

		// Range?
		if ( $stateParams.date.search( ':' ) !== -1 ) {
			var dateRange = $stateParams.date.split( ':' );

			// Require only 2 dates.
			if ( dateRange.length > 2 ) {
				$state.go( 'error-404' );
				return;
			}

			listCtrl.dateRange = [
				dateFilter( (new Date( dateRange[0] )), 'mediumDate' ),
				dateFilter( (new Date( dateRange[1] )), 'mediumDate' ),
			];
		}
		else {
			listCtrl.date = dateFilter( (new Date( $stateParams.date )), 'mediumDate' );
		}
	}

	if ( section == 'by-date' ) {
		if ( !listCtrl.dateRange ) {
			/// Single date view of games
			/// {{ date }} is available as the localized date
			App.title = gettextCatalog.getString( 'games.list.date_page_title', { date: listCtrl.date } );
		}
		else {
			/// When viewing a date range view of games (games published between two dates)
			/// {{ dateStart }} and {{ dateEnd }} are available as localized dates
			App.title = gettextCatalog.getString( 'games.list.date_range_page_title', { dateStart: listCtrl.dateRange[0], dateEnd: listCtrl.dateRange[1] } );
		}
	}
	else {
		var sectionTranslationKey = 'games.list.section_' + section;
		var sectionHuman = gettextCatalog.getString( sectionTranslationKey );
		var categoryHuman = ' ';
		if ( category ) {
			var categoryTranslationKey = 'discover.categories.' + category.replace( '-', '_' );
			categoryHuman = gettextCatalog.getString( categoryTranslationKey );
			categoryHuman = (' ' + categoryHuman + ' ');
		}

		var translationId = 'games.list.page_title';
		if ( category == 'rpg' ) {
			translationId += '_rpg';
		}
		else if ( category == 'other' ) {
			translationId += '_other';
		}

		App.title = gettextCatalog.getString( translationId, { section: sectionHuman, category: categoryHuman } );
		Meta.description = payload.metaDescription;

		if ( category == 'rpg' ) {
			/// {{ category }} is available as the translated category label
			listCtrl.descriptiveCategory = gettextCatalog.getString( 'games.list.descriptive_category_rpg', { category: categoryHuman } );
		}
		else if ( category == 'other' ) {
			/// {{ category }} is available as the translated category label
			listCtrl.descriptiveCategory = gettextCatalog.getString( 'games.list.descriptive_category_other', { category: categoryHuman } );
		}
		else {
			/// {{ category }} is available as the translated category label
			/// In the case of no category, {{ category }} will be empty ''
			listCtrl.descriptiveCategory = gettextCatalog.getString( 'games.list.descriptive_category', { category: categoryHuman } );
		}
	}

	var badgeImageMap = {
		'featured': '/app/img/categories/featured.png',
		'best': '/app/img/categories/best.png',
		'fresh': '/app/img/categories/best.png',  // TODO: Needs different image.
		'hot': '/app/img/categories/best.png',  // TODO: Needs different image.
		'new': '/app/img/categories/new.png',
		'arcade': '/app/img/categories/arcade.png',
		'action': '/app/img/categories/action.png',
		'adventure': '/app/img/categories/adventure.png',
		'rpg': '/app/img/categories/rpg.png',
		'strategy-sim': '/app/img/categories/strategy-sim.png',
		'platformer': '/app/img/categories/platformer.png',
		'shooter': '/app/img/categories/shooter.png',
		'puzzle': '/app/img/categories/puzzle.png',
		'sports': '/app/img/categories/sports.png',

		'other-1': '/app/img/categories/other-1.png',
		'other-2': '/app/img/categories/other-2.png',
		'other-3': '/app/img/categories/other-3.png',
		'other-4': '/app/img/categories/other-4.png',
		'other-5': '/app/img/categories/other-5.png',
	};

	listCtrl.badgeImage = null;
	if ( category ) {
		listCtrl.badgeImage = badgeImageMap[ category ];
	}
	else if ( section != 'by-date' ) {
		listCtrl.badgeImage = badgeImageMap[ section ];
	}

	// This whole bit of code is purely to do the twitching for the Other category.
	if ( category == 'other' ) {

		var intervalPromise, timeoutPromise;

		// Randomize which one we show first.
		var current = 1 + Math.floor( Math.random() * 5);
		listCtrl.badgeImage = badgeImageMap[ 'other-' + current ];

		intervalPromise = $interval( function()
		{
			var next = current + 1;
			if ( next > 5 ) {
				next = 1;
			}

			listCtrl.badgeImage = badgeImageMap[ 'other-' + next ];

			timeoutPromise = $timeout( angular.noop, 200 )
				.then( function()
				{
					listCtrl.badgeImage = badgeImageMap[ 'other-' + current ];
					timeoutPromise = $timeout( angular.noop, 1000 );
					return timeoutPromise;
				} )
				.then( function()
				{
					listCtrl.badgeImage = badgeImageMap[ 'other-' + next ];
					timeoutPromise = $timeout( angular.noop, 100 );
					return timeoutPromise;
				} )
				.then( function()
				{
					listCtrl.badgeImage = badgeImageMap[ 'other-' + current ];
					timeoutPromise = $timeout( angular.noop, 2000 );
					return timeoutPromise;
				} )
				.then( function()
				{
					listCtrl.badgeImage = badgeImageMap[ 'other-' + next ];
					current = next;
					timeoutPromise = null;
				} );
		}, 25000 );

		$scope.$on( '$destroy', function()
		{
			if ( intervalPromise ) {
				$interval.cancel( intervalPromise );
			}

			if ( timeoutPromise ) {
				$timeout.cancel( timeoutPromise );
			}
		} );
	}
} );
