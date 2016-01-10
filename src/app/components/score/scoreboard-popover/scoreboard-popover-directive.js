angular.module( 'App.Score.ScoreboardPopover' ).directive( 'gjScoreboardPopover', function()
{
	return {
		restrict: 'E',
		scope: {
			currentTable: '=scoreboardPopoverCurrentTable',
			tables: '=scoreboardPopoverTables',
			onSelectTable: '&scoreboardPopoverOnSelect',
		},
		templateUrl: '/app/components/score/scoreboard-popover/scoreboard-popover.html',
		controllerAs: 'ctrl',
		bindToController: true,
		controller: function()
		{
			this.selectTable = function( table )
			{
				if ( this.onSelectTable ) {
					this.onSelectTable( { table: table } );
				}
			};
		}
	};
} );
