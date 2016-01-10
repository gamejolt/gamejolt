angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.Manage.Api.Scoreboards.ListCtrl', function( $scope, $translate, Translate, Game_ScoreTable, ModalConfirm, payload )
{
	var _this = this;

	Translate.pageTitle( 'dash.games.scoreboards.page_title', { game: $scope.manageCtrl.game.title } );

	$scope.Game_ScoreTable = Game_ScoreTable;

	this.scoreTables = Game_ScoreTable.populate( payload.scoreTables );
	this.isAdding = false;
	this.activeItem = null;
	this.currentSort = null;

	updateSort()

	this.onTableAdded = onTableAdded;
	this.onTableEdited = onTableEdited;
	this.onTablesSorted = onTablesSorted;
	this.removeTable = removeTable;

	function onTableAdded( table )
	{
		this.scoreTables.push( table );
		this.isAdding = false;
		updateSort();
	}

	function onTableEdited( table )
	{
		this.activeItem = null;
	}

	function onTablesSorted( event )
	{
		var newSort = _.pluck( _this.scoreTables, 'id' );

		// Make sure that the sorting has changed.
		if ( !angular.equals( newSort, _this.currentSort ) ) {

			// Save off the sort.
			_this.currentSort = newSort;
			Game_ScoreTable.$saveSort( $scope.manageCtrl.game.id, newSort );
		}
	}

	function removeTable( table )
	{
		ModalConfirm.show( $translate.instant( 'dash.games.scoreboards.remove_confirmation' ) )
			.then( function()
			{
				return table.$remove();
			} )
			.then( function()
			{
				_.remove( _this.scoreTables, { id: table.id } );
				updateSort();
			} );
	}

	function updateSort()
	{
		_this.currentSort = _.pluck( _this.scoreTables, 'id' );
	}
} );
