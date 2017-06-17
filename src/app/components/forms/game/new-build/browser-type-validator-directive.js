angular
	.module('App.Forms.Dashboard')
	.directive('gjFormDashboardGameNewBuildBrowserTypeValidator', function(
		$parse,
		Game_Build,
	) {
		return {
			restrict: 'A',
			require: 'ngModel',
			link: function(scope, element, attrs, ngModel) {
				var validTypesParsed = $parse(
					attrs.gjFormDashboardGameNewBuildBrowserTypeValidator,
				);

				ngModel.$validators.browserType = function(modelVal, viewVal) {
					if (!viewVal) {
						return true;
					}

					var file = viewVal[0];
					if (!file) {
						return true;
					}

					// Will be undefined if this is attached to a downloadable
					// rather than browser upload.
					var validTypes = validTypesParsed(scope);
					if (typeof validTypes === 'undefined') {
						return true;
					}

					var fileType = file.name.slice(file.name.lastIndexOf('.'));
					return validTypes.indexOf(fileType) !== -1;
				};
			},
		};
	});
