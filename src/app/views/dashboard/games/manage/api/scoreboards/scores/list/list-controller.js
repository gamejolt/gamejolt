angular
	.module('App.Views.Dashboard')
	.controller(
		'Dashboard.Developer.Games.Manage.Api.Scoreboards.Scores.ListCtrl',
		function(
			$scope,
			$state,
			App,
			Scroll,
			Game_ScoreTable,
			User_GameScore,
			gettextCatalog,
			payload,
		) {
			var _this = this;

			this.scoreTables = Game_ScoreTable.populate(payload.scoreTables);

			this.scoreTable = new Game_ScoreTable(payload.scoreTable);
			this.scores = User_GameScore.populate(payload.scores);

			this.selectedTable = _.find(this.scoreTables, { id: this.scoreTable.id });

			App.title = gettextCatalog.getString(
				'dash.games.scores.list.page_title',
				{
					game: $scope.manageCtrl.game.title,
					table: this.scoreTable.name,
				},
			);

			this.changeTable = function(tableId) {
				Scroll.shouldAutoScroll = false;
				$state.go($state.current, { table: tableId });
			};

			this.onScoreRemoved = function(score) {
				Scroll.shouldAutoScroll = false;
				$state.reload($state.current);
			};
		},
	);
