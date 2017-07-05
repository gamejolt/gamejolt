// angular
// 	.module('App.Views.Dashboard')
// 	.controller('Dashboard.Developer.Games.Manage.KeyGroups.EditCtrl', function(
// 		$scope,
// 		$state,
// 		$stateParams,
// 		App,
// 		Api,
// 		KeyGroup,
// 		Game_Package,
// 		Key,
// 		Clipboard,
// 		ModalConfirm,
// 		Growls,
// 		Environment,
// 		gettextCatalog,
// 		payload
// 	) {
// 		var _this = this;

// 		$scope.KeyGroup = KeyGroup;

// 		this.keyGroup = payload.keyGroup ? new KeyGroup(payload.keyGroup) : null;
// 		this.packages = Game_Package.populate(payload.packages);
// 		this.keys = Key.populate(payload.keys);

// 		this.search = {
// 			filter: '',
// 			state: 'all',
// 		};

// 		App.title = gettextCatalog.getString('Edit Key Group: {{ name }}', {
// 			name: this.keyGroup.name,
// 		});

// 		this.searchKeys = function() {
// 			Api.sendRequest(
// 				'/web/dash/developer/games/key-groups/search-keys/' +
// 					$stateParams.id +
// 					'/' +
// 					$stateParams.keyGroupId,
// 				this.search
// 			).then(function(response) {
// 				_this.keys = Key.populate(response.keys);
// 			});
// 		};

// 		this.copyKeyLink = function(key) {
// 			Clipboard.copy(Environment.secureBaseUrl + '/claim/' + key.key);
// 		};

// 		this.onNewKeysAdded = function() {
// 			// Only reload this single state.
// 			$state.reload('dash.games.manage.key-groups.edit');
// 		};

// 		this.removeGroup = function(keyGroup, disableKeys) {
// 			ModalConfirm.show(
// 				gettextCatalog.getString(
// 					'Are you sure you want to remove this key group? All keys within this key group will be invalidated. Any access that users may have gained from these keys will be revoked. This can not be reversed.'
// 				),
// 				gettextCatalog.getString('Remove key group?')
// 			)
// 				.then(function() {
// 					return keyGroup.$remove().catch(function() {
// 						Growls.error(
// 							gettextCatalog.getString(
// 								'Could not remove key group for some reason.'
// 							)
// 						);
// 					});
// 				})
// 				.then(function() {
// 					Growls.success(
// 						gettextCatalog.getString('The key group has been removed.'),
// 						gettextCatalog.getString('Removed Key Group')
// 					);
// 					$state.go('dash.games.manage.key-groups.list');
// 				});
// 		};

// 		this.removeKey = function(key) {
// 			ModalConfirm.show(
// 				gettextCatalog.getString(
// 					"Are you sure you want to remove this key? This will revoke this key's access, or anyone that has claimed this key. This can not be reversed."
// 				),
// 				gettextCatalog.getString('Remove key?')
// 			)
// 				.then(function() {
// 					return key.$remove().catch(function() {
// 						Growls.error(
// 							gettextCatalog.getString('Could not remove key for some reason.')
// 						);
// 					});
// 				})
// 				.then(function() {
// 					Growls.success(
// 						gettextCatalog.getString('The key has been removed.'),
// 						gettextCatalog.getString('Removed Key')
// 					);
// 					_.remove(_this.keys, { id: key.id });
// 				});
// 		};
// 	});

import Vue from 'vue';
import VueRouter from 'vue-router';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./edit.html';
import { BeforeRouteEnter } from '../../../../../../../lib/gj-lib-client/utils/router';
import { Api } from '../../../../../../../lib/gj-lib-client/components/api/api.service';
import { KeyGroup } from '../../../../../../../lib/gj-lib-client/components/key-group/key-group.model';
import { GamePackage } from '../../../../../../../lib/gj-lib-client/components/game/package/package.model';
import { Key } from '../../../../../../../lib/gj-lib-client/components/key/key-model';
import { Meta } from '../../../../../../../lib/gj-lib-client/components/meta/meta-service';
import { Clipboard } from '../../../../../../../lib/gj-lib-client/components/clipboard/clipboard-service';
import { Environment } from '../../../../../../../lib/gj-lib-client/components/environment/environment.service';
import { ModalConfirm } from '../../../../../../../lib/gj-lib-client/components/modal/confirm/confirm-service';
import { Growls } from '../../../../../../../lib/gj-lib-client/components/growls/growls.service';
import { arrayRemove } from '../../../../../../../lib/gj-lib-client/utils/array';

@View
@Component({})
export default class RouteDashGamesManageKeyGroupsEdit extends Vue {
	keyGroup: KeyGroup | null = null;
	packages: GamePackage[] = [];
	keys: Key[] = [];

	isShowingAddKeys = false;

	search = {
		filter: '',
		state: 'all',
	};
	KeyGroup = KeyGroup;

	@BeforeRouteEnter()
	routeEnter(this: undefined, route: VueRouter.Route) {
		return Api.sendRequest(
			'/web/dash/developer/games/key-groups/' +
				`${route.params.id}/${route.params.keyGroupId}`
		);
	}

	routed() {
		// TODO: why is this nullable?
		this.keyGroup = this.$payload.keyGroup
			? new KeyGroup(this.$payload.keyGroup)
			: null;
		this.packages = GamePackage.populate(this.$payload.packages);
		this.keys = Key.populate(this.$payload.keys);

		Meta.title = this.$gettextInterpolate('Edit Key Group: %{ name }', {
			name: this.keyGroup ? this.keyGroup.name : 'none',
		});
	}

	searchKeys() {
		Api.sendRequest(
			'/web/dash/developer/games/key-groups/search-keys/' +
				`${this.$route.params.id}/${this.$route.params.keyGroupId}`,
			this.search
		).then(response => {
			this.keys = Key.populate(response.keys);
		});
	}

	copyKeyLink(key: Key) {
		Clipboard.copy(`${Environment.secureBaseUrl}/claim/${key.key}`);
	}

	onNewKeysAdded() {
		// Only reload this single state.
		// TODO: reload might not work this way, check this.
		this.$router.push({
			name: 'dash.games.manage.key-groups.edit',
			params: this.$route.params,
		});

		// $state.reload('dash.games.manage.key-groups.edit');
	}

	removeGroup(keyGroup: KeyGroup) {
		ModalConfirm.show(
			this.$gettext(
				// tslint:disable-next-line:max-line-length
				'Are you sure you want to remove this key group? All keys within this key group will be invalidated. Any access that users may have gained from these keys will be revoked. This can not be reversed.'
			),
			this.$gettext('Remove key group?')
		)
			.then(() => {
				return keyGroup.$remove().catch(() => {
					Growls.error(
						this.$gettext('Could not remove key group for some reason.')
					);
				});
			})
			.then(() => {
				Growls.success(
					this.$gettext('The key group has been removed.'),
					this.$gettext('Removed Key Group')
				);
				this.$router.push({
					name: 'dash.games.manage.key-groups.list',
				});
			});
	}

	removeKey(key: Key) {
		ModalConfirm.show(
			this.$gettext(
				// tslint:disable-next-line:max-line-length
				`Are you sure you want to remove this key? This will revoke this key's access, or anyone that has claimed this key. This can not be reversed.`
			),
			this.$gettext('Remove key?')
		)
			.then(() => {
				return key.$remove().catch(() => {
					Growls.error(this.$gettext('Could not remove key for some reason.'));
				});
			})
			.then(() => {
				Growls.success(
					this.$gettext('The key has been removed.'),
					this.$gettext('Removed Key')
				);

				arrayRemove(this.keys, k => k.id === key.id);
			});
	}
}
