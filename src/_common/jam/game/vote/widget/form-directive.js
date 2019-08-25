angular
	.module('gj.Jam.Game.Vote.Widget')
	.directive('gjJamGameVoteWidgetForm', function(Form, Jam_Game_Vote, Screen) {
		var form = new Form({
			template: require('./form.html'),
		});

		form.scope.jam = '=gjJam';
		form.scope.game = '=gjGame';
		form.scope.votingCategories = '=gjJamVotingCategories';
		form.scope.userRatings = '=gjUserRatings';

		form.onInit = function(scope) {
			scope.Screen = Screen;
			scope.overallRating = undefined;

			// Get the default values based on this user's ratings (if any yet).
			scope.formModel = {
				votes: {},
				vote: undefined,
			};

			if (scope.userRatings && angular.isArray(scope.userRatings) && scope.userRatings.length) {
				if (scope.jam.voting_type == 'categories') {
					angular.forEach(scope.userRatings, function(userRatings) {
						scope.formModel.votes[userRatings.jam_voting_category_id] = userRatings.rating;
					});
				} else if (scope.jam.voting_type == 'overall') {
					scope.formModel.vote = _.first(scope.userRatings).rating;
				}
			}

			scope.recalcOverall = function() {
				// For overall rating type, we just copy the form model's value into the overall rating.
				if (scope.jam.voting_type == 'overall') {
					scope.overallRating = scope.formModel.vote;
				} else {
					// For categories we have to generate the overall based on each category's rating.
					var total = 0;
					var count = 0;

					angular.forEach(scope.formModel.votes, function(categoryVote, category) {
						if (categoryVote) {
							total += categoryVote;
							++count;
						}
					});

					if (count) {
						// We cast it to two decimals, but then it's ALWAYS 2 decimals: 1.50...
						// So cast it back to a float to drop trailing 0s.
						scope.overallRating = parseFloat((total / count).toFixed(2));
					} else {
						scope.overallRating = undefined;
					}
				}
			};

			scope.onClear = function() {
				Jam_Game_Vote.$clearVote(scope.jam.id, scope.game).then(function() {
					// Reset the form model and recalc the overall.
					scope.formModel = {
						votes: {},
						vote: undefined,
					};

					scope.recalcOverall();
				});
			};

			// Recalc on initial load.
			scope.recalcOverall();
		};

		// Custom submit handler.
		form.onSubmit = function(scope) {
			return Jam_Game_Vote.$saveVote(scope.jam.id, scope.game, scope.formModel);
		};

		return form;
	});
