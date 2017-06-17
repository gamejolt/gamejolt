angular
	.module('App.Forms.Dashboard')
	.directive('gjFormDashboardGameRelease', function(
		$q,
		Form,
		Api,
		Screen,
		Game_Release,
		Game_Build,
		Game_Build_LaunchOption,
		ModalConfirm,
		Growls,
		gettextCatalog
	) {
		var form = new Form({
			model: 'Game_Release',
			template: require('./release.html'),
		});

		form.scope.game = '=gjGame';
		form.scope.package = '=?gjGamePackage';
		form.scope.builds = '=?gjGameBuilds';
		form.scope.launchOptions = '=?gjGameLaunchOptions';
		form.scope.buildDownloadCounts = '=gjBuildDownloadCounts';
		form.scope.onUnpublishRelease = '&gjOnUnpublishRelease';
		form.scope.onRemoveRelease = '&gjOnRemoveRelease';
		form.scope.areBuildsLockedByJam = '=?';
		form.scope.areWebBuildsLockedBySellable = '=?';

		form.controller = [
			'$scope',
			function($scope) {
				this.buildForms = {};
				$scope.ctrl = this;
			},
		];

		form.onInit = function(scope) {
			scope.Screen = Screen;
			scope.Game_Release = Game_Release;

			scope.formModel.game_id = scope.game.id;
			scope.formModel.game_package_id = scope.package.id;

			scope.Game_Release = Game_Release;
			scope.Game_Build = Game_Build;

			scope.onBuildAdded = onBuildAdded;
			scope.updateBuildLaunchOptions = updateBuildLaunchOptions;
			scope.onBuildEdited = onBuildEdited;
			scope.removeBuild = removeBuild;
			scope.onBuildProcessingComplete = onBuildProcessingComplete;
			scope.savePublished = savePublished;
			scope.saveDraft = saveDraft;
			scope.unpublish = unpublish;
			scope.remove = remove;

			if (!scope.isLoaded) {
				Api.sendRequest(
					'/web/dash/developer/games/releases/save/' +
						scope.game.id +
						'/' +
						scope.package.id
				).then(function(payload) {
					scope.isLoaded = true;

					if (scope.method === 'add') {
						scope.formModel.version_number = payload.nextVersion || '0.1.0';
					}
				});
			}

			function onBuildProcessingComplete(build, response) {
				// Just copy over the new build data into our current one.
				build.assign(response.build);
			}

			function onBuildAdded(build) {
				scope.builds.push(build);
			}

			/**
		 * Launch options include launch options for alll builds in this release.
		 * When launch options are modified for a build, we need to merge the changes back into
		 * the global array of them.
		 **/
			function updateBuildLaunchOptions(build, launchOptions) {
				// Remove old ones for build.
				if (scope.launchOptions && scope.launchOptions.length) {
					_.remove(scope.launchOptions, { game_build_id: build.id });
				}

				// If no new ones, skip.
				if (!launchOptions || !launchOptions.length) {
					return;
				}

				// Add the new ones into the global list.
				scope.launchOptions = scope.launchOptions.concat(
					Game_Build_LaunchOption.populate(launchOptions)
				);
			}

			function onBuildEdited(build, response) {
				updateBuildLaunchOptions(build, response.launchOptions);
			}

			function removeBuild(build) {
				ModalConfirm.show(
					gettextCatalog.getString(
						'dash.games.releases.builds.remove_build_confirmation'
					)
				)
					.then(function() {
						return build.$remove(scope.game);
					})
					.then(function() {
						_.remove(scope.builds, { id: build.id });

						Growls.success(
							gettextCatalog.getString(
								'dash.games.releases.builds.remove_build_growl'
							),
							gettextCatalog.getString(
								'dash.games.releases.builds.remove_build_growl_title'
							)
						);
					});
			}

			function save() {
				// Save all the managed build forms before saving the release.
				var buildFormSavePromises = _(scope.ctrl.buildForms)
					.filter(function(buildForm) {
						return !buildForm.scope.isDeprecated;
					})
					.map(function(buildForm) {
						return buildForm.scope.onSubmit();
					})
					.value();

				return $q.all(buildFormSavePromises).then(function() {
					scope.onSubmit();
				});
			}

			function savePublished() {
				ModalConfirm.show(
					gettextCatalog.getString(
						'dash.games.releases.manage.publish_release_confirmation'
					)
				)
					.then(function() {
						scope.formModel.should_publish = true;
						return save();
					})
					.then(function() {
						Growls.success(
							gettextCatalog.getString(
								'dash.games.releases.manage.publish_release_growl'
							),
							gettextCatalog.getString(
								'dash.games.releases.manage.publish_release_growl_title'
							)
						);
					});
			}

			function saveDraft() {
				scope.formModel.should_publish = false;
				save();
			}

			function unpublish() {
				scope.onUnpublishRelease({ $release: scope.baseModel });
			}

			function remove() {
				scope.onRemoveRelease({ $release: scope.baseModel });
			}
		};

		form.onSubmitSuccess = function(scope, response) {
			if (scope.game) {
				scope.game.assign(response.game);
			}
		};

		return form;
	});
