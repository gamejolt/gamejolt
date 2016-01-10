angular.module( 'App.Views' ).controller( 'Discover.Games.List.CategoryCtrl', function(
	$scope, $state, $stateParams, $translate, $timeout, $interval, App, Meta, Translate, Game, SplitTest, dateFilter, payload )
{
	var _this = this;

	var listCtrl = $scope.listCtrl;
	var section = $stateParams.section;
	var category = $stateParams.category || null;

	this.games = Game.populate( payload.games );
	listCtrl.gamesCount = payload.gamesCount;
	listCtrl.perPage = payload.perPage;
	listCtrl.currentPage = $stateParams.page || 1;
	listCtrl.section = section;
	listCtrl.category = category;

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
			App.title = $translate.instant( 'games.list.date_page_title', { date: listCtrl.date } );
		}
		else {
			App.title = $translate.instant( 'games.list.date_range_page_title', { dateStart: listCtrl.dateRange[0], dateEnd: listCtrl.dateRange[1] } );
		}
	}
	else {
		var sectionHuman = $translate.instant( 'games.list.section_' + section );
		var categoryHuman = ' ';
		if ( category ) {
			categoryHuman = $translate.instant( 'discover.categories.' + category.replace( '-', '_' ) );
			categoryHuman = (' ' + categoryHuman + ' ');
		}

		var translationId = 'games.list.page_title';
		if ( category == 'rpg' ) {
			translationId += '_rpg';
		}
		else if ( category == 'other' ) {
			translationId += '_other';
		}

		App.title = $translate.instant( translationId, { section: sectionHuman, category: categoryHuman } );
		Meta.description = payload.metaDescription;

		if ( category == 'rpg' ) {
			listCtrl.descriptiveCategory = $translate.instant( 'games.list.descriptive_category_rpg', { category: categoryHuman } );
		}
		else if ( category == 'other' ) {
			listCtrl.descriptiveCategory = $translate.instant( 'games.list.descriptive_category_other', { category: categoryHuman } );
		}
		else {
			// In the case of no category, categoryHuman will be ''.
			listCtrl.descriptiveCategory = $translate.instant( 'games.list.descriptive_category', { category: categoryHuman } );
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
