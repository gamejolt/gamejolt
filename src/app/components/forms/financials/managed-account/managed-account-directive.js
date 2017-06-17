var Loader = require('../../../../../../lib/gj-lib-client/components/loader/loader.service')
	.Loader;

angular
	.module('App.Forms.Dashboard')
	.directive('gjFormDashboardFinancialsManagedAccount', function(
		$q,
		$ocLazyLoad,
		$window,
		Form,
		Api,
		Growls,
		Environment,
		Geo,
		currencyFilter
	) {
		var form = new Form({
			template: require('./managed-account.html'),
			resetOnSubmit: true,
		});

		var StripeFileUploadUrl = 'https://uploads.stripe.com/v1/files';
		var stripePublishableKey;

		form.onInit = function(scope) {
			scope.Geo = Geo;
			scope.stripeMeta = null;
			scope.additionalOwnerIndex = 0;

			scope.currencyFilter = currencyFilter;
			scope.formState.isLoaded = false;
			scope.formState.genericError = false;
			scope.formState.currencies = [];

			// if ( Environment.env === 'development' ) {
			// 	scope.formModel.bankAccount_country = 'GB';
			// 	scope.formModel.bankAccount_currency = 'GBP',
			// 	scope.formModel.bankAccount_accountNumber = '00012345';
			// 	scope.formModel.bankAccount_routingNumber = '108800';
			// 	scope.formModel.bankAccount_accountHolderName = 'MR I C ROFLCOPTER';
			// 	scope.formModel.bankAccount_accountHolderType = 'individual';
			// }

			// Gotta load in the Stripe JS API as well.
			Loader.load('upload')
				.then(function() {
					return $ocLazyLoad.load([
						{ type: 'js', path: 'https://js.stripe.com/v2/' },
					]);
				})
				.then(function() {
					return Api.sendRequest('/web/dash/financials/account');
				})
				.then(function(payload) {
					stripePublishableKey = payload.stripe.publishableKey;
					Stripe.setPublishableKey(payload.stripe.publishableKey);

					angular.extend(scope, payload);

					scope.stripeMeta = {};
					angular.extend(scope.stripeMeta, payload.stripe.required);

					// We currently don't allow them to edit, so we don't pull the current Stripe
					// fields in to the formModel.
					// var flatObj = {};
					// dotflatten( flatObj, payload.stripe.current );
					// angular.extend( scope.formModel, flatObj );

					scope.formModel.additional_owners_count = 0;
					if (
						payload.stripe &&
						payload.stripe.current &&
						payload.stripe.current.legal_entity.additional_owners
					) {
						scope.formModel.additional_owners_count =
							payload.stripe.current.legal_entity.additional_owners.length;
					}

					// Due by will be set if this account is required to fill in more by a specific date.
					// This is for additional collection of fields beyond what we want initially.
					scope.formState.isComplete =
						payload.account.is_verified &&
						!payload.stripe.current.verification.due_by;

					scope.formState.isLoaded = true;
				});

			function dotflatten(res, obj, current) {
				for (var key in obj) {
					var value = obj[key];
					var newKey = current ? current + '-' + key : key; // joined key with hyphen

					if (
						value &&
						(typeof value === 'array' || typeof value === 'object')
					) {
						// It's nested, so do it again.
						dotflatten(res, value, newKey);
					} else {
						// Values are always strings.
						if (value) {
							value = '' + value;
						}
						res[newKey] = value;
					}
				}
			}

			scope.helpers = {};

			scope.helpers.requiresField = function(field) {
				if (!scope.stripeMeta) {
					return undefined;
				}

				return (
					scope.stripeMeta.minimum.indexOf(field) !== -1 ||
					// We special case personal_id_number.
					// We need it for taxes, so we collect it if it's just in "additional".
					(field === 'legal_entity.personal_id_number' &&
						scope.stripeMeta.additional.indexOf(field) !== -1) ||
					(scope.stripe.current &&
						scope.stripe.current.verification &&
						scope.stripe.current.verification.fields_needed &&
						scope.stripe.current.verification.fields_needed.indexOf(field) !==
							-1)
				);
			};

			scope.helpers.getStripeField = function(fieldPath) {
				if (!scope.stripe.current) {
					return undefined;
				}

				// Gotta traverse the object chain.
				// We should return false if any of the paths don't exist.
				var pieces = fieldPath.split('.');
				var field = pieces.pop();
				var obj = scope.stripe.current;

				for (var i = 0; i < pieces.length; ++i) {
					if (!obj[pieces[i]]) {
						return undefined;
					}
					obj = obj[pieces[i]];
				}

				if (!obj[field]) {
					return undefined;
				}

				return obj[field];
			};

			// This is only needed after the initial submission in some instances.
			scope.helpers.requiresVerificationDocument = function() {
				return (
					scope.helpers.requiresField('legal_entity.verification.document') ||
					scope.helpers.requiresField(
						'legal_entity.additional_owners.0.verification.document'
					) ||
					scope.helpers.requiresField(
						'legal_entity.additional_owners.1.verification.document'
					) ||
					scope.helpers.requiresField(
						'legal_entity.additional_owners.2.verification.document'
					) ||
					scope.helpers.requiresField(
						'legal_entity.additional_owners.3.verification.document'
					)
				);
			};

			scope.helpers.isVerificationPending = function() {
				// If they're in pending state and we don't require more info from them.
				if (
					scope.account.status === 'pending' &&
					!scope.helpers.requiresVerificationDocument()
				) {
					return true;
				}

				return false;
			};

			scope.helpers.addAdditionalOwner = function() {
				++scope.formModel.additional_owners_count;
			};

			scope.helpers.removeAdditionalOwner = function(index) {
				// Helpers.
				function removeOwnerData(i) {
					var regex = new RegExp('legal_entity-additional_owners-' + i + '-');
					for (var field in scope.formModel) {
						if (regex.test(field)) {
							delete scope.formModel[field];
						}
					}
				}

				function copyOwnerData(oldIndex, newIndex) {
					var regex = new RegExp(
						'legal_entity-additional_owners-' + oldIndex + '-'
					);
					for (var field in scope.formModel) {
						if (regex.test(field)) {
							var newField = field.replace(
								'-' + oldIndex + '-',
								'-' + newIndex + '-'
							);
							scope.formModel[newField] = scope.formModel[field];
						}
					}
				}

				// Reindex all the owners after the one that was removed to be shifted over once.
				for (
					var i = index + 1;
					i < scope.formModel.additional_owners_count;
					++i
				) {
					// We have to remove the owner data from the index before.
					// If the current owner doesn't have all fields filled, it won't overwrite completely.
					// It needs a "pristine" state to copy into.
					removeOwnerData(i - 1);
					copyOwnerData(i, i - 1);
				}

				// Clear out all the fields for the last one as well since it's now shifted.
				removeOwnerData(scope.formModel.additional_owners_count - 1);
				--scope.formModel.additional_owners_count;
			};

			// scope.updateCurrencies = function( )
			// {
			// 	scope.formState.currencies = scope.stripe.currencies[ scope.formModel.bankAccount_country ];
			// }
		};

		function uploadIdDocument(inputId) {
			return $q(function(resolve, reject) {
				var formData = new FormData();
				formData.append('purpose', 'identity_document');
				formData.append(
					'file',
					document.getElementById(inputId).querySelector("input[type='file']")
						.files[0]
				);

				var xhr = new XMLHttpRequest();
				xhr.open('POST', StripeFileUploadUrl);
				xhr.setRequestHeader('Authorization', 'Bearer ' + stripePublishableKey);
				xhr.setRequestHeader('Accept', 'application/json'); // Makes sure it doesn't return as JSONP.
				xhr.send(formData);

				xhr.onreadystatechange = function() {
					if (xhr.readyState === 4) {
						if (xhr.status === 200) {
							resolve(JSON.parse(xhr.responseText));
						} else {
							reject(JSON.parse(xhr.responseText).error);
						}
					}
				};
			});
		}

		function createPiiToken(data) {
			return $q(function(resolve, reject) {
				if (!data['legal_entity-personal_id_number']) {
					resolve(null);
					return;
				}

				Stripe.piiData.createToken(
					{
						personal_id_number: data['legal_entity-personal_id_number'],
					},
					function(status, response) {
						if (response.error) {
							reject(response.error);
						} else {
							resolve(response.id);
						}
					}
				);
			});
		}

		form.onSubmit = function(scope) {
			// We don't want to send the sensitive data to GJ.
			var data = angular.copy(scope.formModel);

			var requestPromise = $q.when(data);

			if (
				scope.formModel['legal_entity-verification-document'] &&
				scope.formModel['legal_entity-verification-status'] !== 'verified'
			) {
				requestPromise = requestPromise
					.then(function() {
						return uploadIdDocument('legal_entity-verification-document-input');
					})
					.then(function(response) {
						data['legal_entity-verification-document'] = response.id;
					});
			}

			// Additional files
			for (var i = 0; i < 4; i++) {
				if (
					scope.formModel[
						'legal_entity-additional_owners-' + i + '-verification-document'
					]
				) {
					var curIndex = i;
					requestPromise = requestPromise
						.then(function() {
							return uploadIdDocument(
								'legal_entity-additional_owners-' +
									curIndex +
									'-verification-document-input'
							);
						})
						.then(function(response) {
							data[
								'legal_entity-additional_owners-' +
									curIndex +
									'-verification-document'
							] =
								response.id;
						});
				}
			}

			scope.formState.genericError = false;

			return requestPromise
				.then(function() {
					return createPiiToken(data);
				})
				.catch(function(error) {
					// Error from Stripe.
					console.error(error);
					scope.formState.genericError = error.message;

					// Rethrow to make sure that no "then" blocks below go through.
					throw error;
				})
				.then(function(id) {
					// Override the SSN with the token.
					// This way the raw SSN never hits our server. Only the token.
					if (id) {
						data['legal_entity-personal_id_number'] = id;
					}

					return Api.sendRequest('/web/dash/financials/account', data);
				})
				.then(function(response) {
					if (response.success === false) {
						scope.formState.genericError = true;
					}

					return response;
				});
		};

		return form;
	});
