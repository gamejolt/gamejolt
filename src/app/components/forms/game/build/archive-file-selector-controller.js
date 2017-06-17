angular
	.module('App.Forms.Dashboard')
	.controller('Forms_Dashboard_Game_Build_ArchiveFileSelectorCtrl', function(
		$scope,
		$modalInstance,
		Api,
		data,
	) {
		var _this = this;

		this.isLoading = true;
		this.files = [];

		var params = [
			data.game.id,
			data.package.id,
			data.release.id,
			data.build.id,
			data.build.primary_file.id,
			data.platform,
		];
		Api.sendRequest(
			'/web/dash/developer/games/builds/files/archive-file-list/' +
				params.join('/'),
		)
			.then(function(response) {
				_this.files = response.fileList || [];
				_this.isLoading = false;
			})
			.catch(function() {
				_this.files = [];
				_this.isLoading = false;
			});

		this.select = function(selected) {
			$modalInstance.close(selected);
		};

		this.close = function() {
			$modalInstance.dismiss();
		};
	});
