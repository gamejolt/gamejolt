var GamePackagePayloadModel = require('../../../../../../../../../lib/gj-lib-client/components/game/package/package-payload.model')
	.GamePackagePayloadModel;

angular
	.module('App.Views.Dashboard')
	.controller(
		'Dashboard.Developer.Games.Manage.Game.Packages.EditCtrl',
		function(
			$scope,
			$state,
			Api,
			App,
			Game_Package,
			Game_Release,
			Sellable,
			ModalConfirm,
			Growls,
			gettextCatalog,
			packagePayload,
			$timeout,
		) {
			var _this = this;

			$scope.Game_Package = Game_Package;
			$scope.Game_Release = Game_Release;

			this.package = new Game_Package(packagePayload.package);
			this.sellable = new Sellable(packagePayload.sellable);
			this.releases = Game_Release.populate(packagePayload.releases);

			this.previewData = null;
			this.previewPackage = null;
			this.isShowingPackageEdit = false;

			App.title = gettextCatalog.getString(
				'dash.games.packages.edit.page_title',
				{
					game: $scope.manageCtrl.game.title,
					package: this.package.title || $scope.manageCtrl.game.title,
				},
			);

			this.newRelease = newRelease;
			this.removeRelease = removeRelease;
			this.loadPreview = loadPreview;
			this.onEdited = onEdited;
			this.onBuildsProcessed = onBuildsProcessed;

			this.loadPreview();

			function loadPreview() {
				_this.isLoadingPreview = true;
				Api.sendRequest(
					'/web/dash/developer/games/packages/preview/' +
						_this.package.game_id +
						'/' +
						_this.package.id,
					null,
					{ detach: true },
				).then(function(response) {
					// We pull all new stuff for the preview so that we don't step on the form.
					_this.previewData = new GamePackagePayloadModel(response);
					_this.previewSellable = response.sellable
						? new Sellable(response.sellable)
						: null;
					_this.previewPackage = _.find(_this.previewData.packages, {
						id: _this.package.id,
					});
					_this.buildsProcessingCount = response.buildsProcessingCount || 0;
					_this.isLoadingPreview = false;

					// Clear out any "bought" status in the sellable so it always shows as if we haven't bought it yet.
					if (_this.previewSellable) {
						_this.previewSellable.is_owned = false;
					}
				});
			}

			function onBuildsProcessed(response) {
				this.loadPreview();

				if (response.game) {
					$scope['manageCtrl'].game.assign(response.game);
				}
			}

			function onEdited(formModel) {
				this.loadPreview();
			}

			function newRelease() {
				this.isAddingRelease = true;

				Api.sendRequest(
					'/web/dash/developer/games/releases/create-stub/' +
						this.package.game_id +
						'/' +
						this.package.id,
					{},
					{ detach: true },
				)
					.then(function(response) {
						$state.go('dash.games.manage.game.packages.release.edit', {
							packageId: _this.package.id,
							releaseId: response.newReleaseId,
						});
					})
					.catch(function() {
						Growls.error(
							gettextCatalog.getString('Could not create new release.'),
						);
						_this.isAddingRelease = false;
					});
			}

			function removeRelease(release) {
				ModalConfirm.show(
					gettextCatalog.getString(
						'dash.games.releases.manage.remove_release_confirmation',
					),
				)
					.then(function() {
						return release.$remove($scope.manageCtrl['game']);
					})
					.then(function() {
						Growls.success(
							gettextCatalog.getString(
								'dash.games.releases.manage.remove_release_growl',
							),
							gettextCatalog.getString(
								'dash.games.releases.manage.remove_release_growl_title',
							),
						);
						_.remove(_this.releases, { id: release.id });
					});
			}
		},
	);
