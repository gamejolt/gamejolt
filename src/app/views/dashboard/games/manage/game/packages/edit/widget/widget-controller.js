angular
	.module('App.Views.Dashboard')
	.controller(
		'Dashboard.Developer.Games.Manage.Game.Packages.Edit.WidgetCtrl',
		function($scope, $sce, $state, Environment, Sellable, widgetPayload) {
			var _this = this;

			this.sellable = widgetPayload.sellable
				? new Sellable(widgetPayload.sellable)
				: null;
			this.theme = ''; // Default to dark.

			$scope.$watch('widgetCtrl.theme', function() {
				var widgetUrl =
					Environment.widgetHost + '/package/v1?key=' + _this.sellable.key;
				if (_this.theme === 'light') {
					widgetUrl += '&theme=light';
				}

				_this.widgetUrl = $sce.trustAsResourceUrl(widgetUrl);
				_this.widgetCode =
					'<iframe src="' +
					widgetUrl +
					'" frameborder="0" width="500" height="245"></iframe>';
			});
		}
	);
