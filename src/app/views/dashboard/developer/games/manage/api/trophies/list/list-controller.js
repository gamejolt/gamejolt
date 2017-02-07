var Loader = require( '../../../../../../../../../lib/gj-lib-client/components/loader/loader.service' ).Loader;

angular.module( 'App.Views.Dashboard' ).controller( 'Dashboard.Developer.Games.Manage.Api.Trophies.ListCtrl', function( $scope, $timeout, App, Game_Trophy, ModalConfirm, Scroll, gettextCatalog, payload )
{
	var _this = this;

	$scope.Loader = Loader;
	Loader.load( 'ui-tree' );

	App.title = gettextCatalog.getString( 'dash.games.trophies.page_title', { game: $scope.manageCtrl.game.title } );

	$scope.Game_Trophy = Game_Trophy;

	this.trophyLabels = {};
	this.trophyLabels[ Game_Trophy.DIFFICULTY_BRONZE ] = gettextCatalog.getString( 'trophies.bronze' );
	this.trophyLabels[ Game_Trophy.DIFFICULTY_SILVER ] = gettextCatalog.getString( 'trophies.silver' );
	this.trophyLabels[ Game_Trophy.DIFFICULTY_GOLD ] = gettextCatalog.getString( 'trophies.gold' );
	this.trophyLabels[ Game_Trophy.DIFFICULTY_PLATINUM ] = gettextCatalog.getString( 'trophies.platinum' );

	this.trophies = Game_Trophy.populate( payload.trophies );

	this.isAdding = {};
	this.activeItem = {};
	this.trophySorts = {};
	this.hasHiddenTrophies = false;

	refreshTrophies();

	this.canDrop = canDrop;
	this.onTrophyAdded = onTrophyAdded;
	this.onTrophyEdited = onTrophyEdited;
	this.onTrophySorted = onTrophySorted;
	this.removeTrophy = removeTrophy;

	function canDrop( sourceScope, destScope, destIndex )
	{
		// Difficulty is pull into the scopes by the ng-repeat on the page.
		// We check to see if the difficulties are the same.
		// We don't currently allow dragging/dropping between difficulty levels just yet.
		if ( sourceScope.difficulty == destScope.difficulty ) {
			return true;
		}

		return false;
	}

	function onTrophyAdded( trophy )
	{
		// Close all "add" forms.
		this.isAdding = {};

		this.trophies.push( trophy );
		refreshTrophies();

		// We want to scroll to the top of the item's position when saving since the form is pretty long.
		// The position may change if they changed the difficulty level, so we let angular compile first.
		$timeout( function()
		{
			Scroll.to( 'trophy-container-' + trophy.id );
		} );
	}

	function onTrophyEdited( trophy )
	{
		// Close all "edit" forms.
		_this.activeItem = {};

		// May have switched difficulty level, so we gotta fully refresh.
		refreshTrophies();

		// We want to scroll to the top of the item's position when saving since the form is pretty long.
		// The position may change if they changed the difficulty level, so we let angular compile first.
		$timeout( function()
		{
			Scroll.to( 'trophy-container-' + trophy.id );
		} );
	}

	function onTrophySorted( event )
	{
		var difficulty = event.source.nodeScope.trophy.difficulty;
		var newSort = _.pluck( _this.groupedTrophies[ difficulty ], 'id' );

		// Make sure that the sorting has changed.
		if ( !angular.equals( newSort, _this.trophySorts[ difficulty ] ) ) {

			// Save off the sort.
			_this.trophySorts[ difficulty ] = newSort;
			Game_Trophy.$saveSort( $scope.manageCtrl.game.id, difficulty, newSort );
		}
	}

	function removeTrophy( trophy )
	{
		ModalConfirm.show( gettextCatalog.getString( 'dash.games.trophies.remove_confirmation' ) )
			.then( function()
			{
				return trophy.$remove();
			} )
			.then( function()
			{
				_.remove( _this.trophies, { id: trophy.id } );
				refreshTrophies();
			} );
	}

	function refreshTrophies()
	{
		_this.groupedTrophies = _.groupBy( _this.trophies, 'difficulty' );

		// Make sure the sorts are correct for each group.
		angular.forEach( _this.groupedTrophies, function( trophies, difficulty )
		{
			updateSort( difficulty );
		} );

		// See if any of the trophies are hidden.
		_this.hasHiddenTrophies = false;
		if ( _.find( _this.trophies, { visible: false } ) ) {
			_this.hasHiddenTrophies = true;
		}
	}

	function updateSort( difficulty )
	{
		_this.trophySorts[ difficulty ] = _.pluck( _this.groupedTrophies[ difficulty ], 'id' );
	}
} );
