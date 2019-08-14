angular
	.module('gj.Jam.Game.Vote.Widget')
	.directive('gjJamGameVoteWidget', function() {
		return {
			restrict: 'E',
			template: require('!html-loader!./widget.html'),
			scope: {},
			bindToController: {
				jam: '=gjJam',
				game: '=gjGame',
			},
			controllerAs: 'ctrl',
			controller: function($scope, App, Environment, Api, Jam_VotingCategory) {
				var _this = this;

				$scope.App = App;
				$scope.Environment = Environment;

				if (App.user) {
					this.isLoading = true;

					Api.sendRequest(
						'/jams-io/voting/' + this.jam.id + '/' + this.game.id,
						null,
						{ detach: true }
					).then(function(payload) {
						_this.isLoading = false;
						_this.isParticipant = payload.isParticipant || false;

						// These are the categories that people can vote in.
						// Will be passed in during and after the voting period.
						if (angular.isDefined(payload.votingCategories)) {
							_this.votingCategories = Jam_VotingCategory.populate(
								payload.votingCategories
							);
						}

						// User ratings for when jam voting is in progress.
						// This is their ratings that they've given to the categories for the game.
						if (angular.isDefined(payload.userRatings)) {
							_this.userRatings = payload.userRatings;
						}
					});
				} else {
					this.isLoading = false;
				}
			},
		};
	});
