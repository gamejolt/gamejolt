angular
	.module('App.Forms.Dashboard')
	.directive('gjFormDashboardGameBuildBrowserValidator', function(
		$parse,
		Game_Build
	) {
		return {
			restrict: 'A',
			require: 'ngModel',
			link: function(scope, element, attrs, ngModel) {
				var model = $parse(attrs.gjFormDashboardGameBuildBrowserValidator)(
					scope
				);

				// Update the model so the validator kicks in whenever value changes.
				scope.$watch(
					function() {
						if (!model.isBrowserBased()) {
							return true;
						}

						// The required fields for browser games.
						return !!model.embed_width && !!model.embed_height;
					},
					function(val) {
						ngModel.$setViewValue(val);
					}
				);

				ngModel.$validators.browser = function(modelVal, viewVal) {
					return viewVal;
				};
			},
		};
	});
