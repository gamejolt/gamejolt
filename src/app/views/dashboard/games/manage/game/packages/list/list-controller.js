var Loader = require('../../../../../../../../../lib/gj-lib-client/components/loader/loader.service')
	.Loader;

angular
	.module('App.Views.Dashboard')
	.controller(
		'Dashboard.Developer.Games.Manage.Game.Packages.ListCtrl',
		function(
			$scope,
			$state,
			App,
			Game_Package,
			Sellable,
			ModalConfirm,
			Growls,
			gettextCatalog,
			packagesPayload,
		) {
			var _this = this;
			var manageCtrl = $scope.manageCtrl;

			$scope.Game_Package = Game_Package;
			$scope.Loader = Loader;

			Loader.load('ui-tree');

			App.title = gettextCatalog.getString('Manage Packages for {{ game }}', {
				game: manageCtrl.game.title,
			});

			this.packages = Game_Package.populate(packagesPayload.packages);
			this.sellables = _.indexBy(
				Sellable.populate(packagesPayload.sellables),
				'game_package_id',
			);

			this.onPackagesSorted = onPackagesSorted;
			this.removePackage = removePackage;

			_this.packagesSort = _.pluck(this.packages, 'id');

			function onPackagesSorted(event) {
				var newPackagesSort = _.pluck(_this.packages, 'id');

				if (!angular.equals(newPackagesSort, _this.packagesSort)) {
					_this.packagesSort = newPackagesSort;
					Game_Package.$saveSort(manageCtrl.game.id, _this.packagesSort);
				}
			}

			function removePackage(_package) {
				ModalConfirm.show(
					gettextCatalog.getString(
						'Are you sure you want to remove this package? All of the releases and builds it contains will be removed as well.',
					),
				)
					.then(function() {
						return _package.$remove($scope.manageCtrl['game']);
					})
					.then(function() {
						Growls.success(
							gettextCatalog.getString('The game package has been removed.'),
							gettextCatalog.getString('Package Removed'),
						);

						// We have to do a refresh since a new package may have been chosen as the primary sellable.
						$state.reload($state.current);
					});
			}
		},
	);
