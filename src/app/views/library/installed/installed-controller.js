angular
	.module('App.Views')
	.controller('Library.InstalledCtrl', function(
		$scope,
		$q,
		ModalConfirm,
		LocalDb_Game,
		LocalDb_Package,
		Client_Library,
		gettextCatalog
	) {
		var _this = this;

		$scope.App.title = gettextCatalog.getString('library.installed.page_title');

		$scope.Client_Library = Client_Library;
		$scope.LocalDb_Package = LocalDb_Package;

		this.games = [];
		this.installingGames = {};
		this.updatingGames = {};

		// It's stupid, but to sort on the page, we need to make sure this is an array instead of object.
		$scope.$watchCollection('Client_Library.games', function() {
			_this.games = _.values(Client_Library.games);
		});

		$scope.$watchCollection(
			function() {
				return _.filter(Client_Library.packages, function(localPackage) {
					if (localPackage.install_state) {
						return true;
					}
					return false;
				});
			},
			function(installingPackages) {
				_this.installingGames = _.groupBy(installingPackages, 'game_id');
			}
		);

		$scope.$watchCollection(
			function() {
				return _.filter(Client_Library.packages, function(localPackage) {
					if (localPackage.update_state) {
						return true;
					}
					return false;
				});
			},
			function(updatingPackages) {
				_this.updatingGames = _.groupBy(updatingPackages, 'game_id');
			}
		);
	});
