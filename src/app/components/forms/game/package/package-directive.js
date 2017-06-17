var moment = require('moment-timezone');
var jstz = require('jstimezonedetect');

angular
	.module('App.Forms.Dashboard')
	.directive('gjFormDashboardGamePackage', function(
		$state,
		Form,
		App,
		Api,
		Game_Package,
		Sellable,
		Sellable_Pricing,
		Timezone,
		ModalConfirm,
		gettextCatalog
	) {
		var form = new Form({
			model: 'Game_Package',
			template: require('./package.html'),
			resetOnSubmit: true,
		});

		form.scope.game = '=gjGame';
		form.scope.sellable = '=gjSellable';
		form.scope.package = '=gjGamePackage';
		form.scope.saleCanceled = '&saleCanceled';

		form.onInit = function(scope) {
			scope.$state = $state;
			scope.App = App;
			scope.Game_Package = Game_Package;
			scope.formModel.game_id = scope.game.id;

			scope.formState.showDescriptionInput = scope.formModel.description
				? true
				: false;
			scope.formState.isShowingSaleForm = false;

			scope.now = Date.now();
			scope.pricings = [];

			// Auto-detect timezone.
			scope.formModel.sale_timezone = jstz.determine().name();

			// Get timezones list.
			scope.timezones = [];
			Timezone.getTimezones().then(function(timezones) {
				scope.timezones = timezones;

				scope.timezones.forEach(function(tz) {
					var offset = tz.o / 3600;
					if (offset > 0) {
						offset = '+' + offset + ':00';
					} else if (offset === 0) {
						offset = '';
					}
					tz.label = '(UTC' + offset + ') ' + tz.i;
				});
			});

			scope.isProcessing = true;

			var params = [scope.formModel.game_id];
			if (scope.method === 'edit') {
				params.push(scope.formModel.id);
			}

			Api.sendRequest(
				'/web/dash/developer/games/packages/save/' + params.join('/')
			).then(function(payload) {
				scope.isLoaded = true;
				scope.isProcessing = false;

				scope.startedPrimary = scope.sellable && scope.sellable.primary;
				scope.hasPrimarySellable = payload.hasPrimarySellable;
				scope.minPrice = payload.minPrice || 50;
				scope.isUserVerified = payload.isUserVerified;
				scope.isFangame = payload.isFangame;
				scope.pricings = Sellable_Pricing.populate(payload.pricings);
				scope.originalPricing = undefined;
				scope.promotionalPricing = undefined;

				// If there is no primary sellable yet, let's mark this as the primary sellable.
				// This will only be used if they set the pricing type to something other than free.
				scope.formModel.primary = false;
				if (!scope.hasPrimarySellable) {
					scope.formModel.primary = true;
				}

				scope.formModel.pricing_type = 'free';
				scope.formModel.sale_start = moment()
					.add(1, 'day')
					.startOf('day')
					.valueOf();
				scope.formModel.sale_end = moment()
					.add(1, 'week')
					.startOf('day')
					.valueOf();

				if (scope.method === 'add') {
					scope.formModel.visibility = Game_Package.VISIBILITY_PUBLIC;
					if (payload.hasDefaultPackage) {
						scope.formModel.title = '';
					} else {
						scope.formModel.title = scope.game.title;
					}
				} else {
					if (!scope.formModel.title) {
						scope.formModel.title = scope.game.title;
					}

					scope.formModel.primary = scope.sellable.primary;

					if (scope.sellable.type !== 'free') {
						scope.formModel.pricing_type = scope.sellable.type;

						scope.originalPricing = Sellable_Pricing.getOriginalPricing(
							scope.pricings
						);
						scope.promotionalPricing = Sellable_Pricing.getPromotionalPricing(
							scope.pricings
						);

						scope.formModel.price = scope.originalPricing
							? scope.originalPricing.amount / 100
							: 0;

						if (scope.promotionalPricing) {
							scope.formModel.sale_timezone = scope.promotionalPricing.timezone;
							scope.formModel.sale_start = scope.promotionalPricing.start;
							scope.formModel.sale_end = scope.promotionalPricing.end;
							scope.formModel.sale_price =
								scope.promotionalPricing.amount / 100;

							scope.saleStartLocal = moment(scope.promotionalPricing.start).tz(
								scope.promotionalPricing.timezone
							);
							scope.saleEndLocal = moment(scope.promotionalPricing.end).tz(
								scope.promotionalPricing.timezone
							);
						}

						scope.formState.hasSuggestedPrice = !!scope.formModel.price;
					}
				}
			});

			// Only do this first load.
			if (!scope.isLoaded) {
				scope.$watch('formState.hasSuggestedPrice', function(val) {
					if (scope.formModel.pricing_type === 'pwyw' && !val) {
						scope.formModel.price = null;
					}
				});

				scope.$watch('formModel.sale_start_now', function(val) {
					// If the form control isn't on the page, then this won't be defined.
					// We only want to do this logic if the control is visible (when they first set up sale).
					if (typeof val === 'undefined') {
						return;
					}

					if (val) {
						scope.formModel.sale_start = Date.now();
					} else {
						scope.formModel.sale_start = moment()
							.add(1, 'day')
							.startOf('day')
							.valueOf();
					}
				});

				scope.cancelSale = function() {
					ModalConfirm.show(
						gettextCatalog.getString(
							'Are you sure you want to cancel this sale?'
						)
					)
						.then(function() {
							scope.isProcessing = true;
							var params = [scope.formModel.game_id, scope.formModel.id];
							return Api.sendRequest(
								'/web/dash/developer/games/packages/cancel-sales/' +
									params.join('/')
							);
						})
						.then(function(payload) {
							scope.promotionalPricing = undefined;
							scope.formModel.sale_timezone = jstz.determine.name();
							scope.formModel.sale_start = undefined;
							scope.formModel.sale_end = undefined;
							scope.formModel.sale_price = undefined;
							scope.isProcessing = false;

							form.onSubmitSuccess(scope, payload);

							if (scope.saleCanceled) {
								scope.saleCanceled({ formModel: scope.formModel });
							}
						});
				};
			}
		};

		form.onSubmitSuccess = function(scope, response) {
			if (scope.sellable) {
				scope.sellable.assign(response.sellable);
			}

			if (scope.game) {
				scope.game.assign(response.game);
			}
		};

		return form;
	});
