import View from '!view!./edit.html';
import { Component } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { Api } from '../../../../../../../lib/gj-lib-client/components/api/api.service';
import { Clipboard } from '../../../../../../../lib/gj-lib-client/components/clipboard/clipboard-service';
import { Environment } from '../../../../../../../lib/gj-lib-client/components/environment/environment.service';
import { AppExpand } from '../../../../../../../lib/gj-lib-client/components/expand/expand';
import { GamePackage } from '../../../../../../../lib/gj-lib-client/components/game/package/package.model';
import { Growls } from '../../../../../../../lib/gj-lib-client/components/growls/growls.service';
import { KeyGroup } from '../../../../../../../lib/gj-lib-client/components/key-group/key-group.model';
import { Key } from '../../../../../../../lib/gj-lib-client/components/key/key-model';
import { ModalConfirm } from '../../../../../../../lib/gj-lib-client/components/modal/confirm/confirm-service';
import { AppProgressBar } from '../../../../../../../lib/gj-lib-client/components/progress/bar/bar';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../../../lib/gj-lib-client/components/route/route-component';
import { AppTimeAgo } from '../../../../../../../lib/gj-lib-client/components/time/ago/ago';
import { AppTooltip } from '../../../../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { arrayRemove } from '../../../../../../../lib/gj-lib-client/utils/array';
import { AppJolticon } from '../../../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { number } from '../../../../../../../lib/gj-lib-client/vue/filters/number';
import { FormGameKeyGroupAddKeys } from '../../../../../../components/forms/game/key-group/add-keys/add-keys';
import { FormGameKeyGroup } from '../../../../../../components/forms/game/key-group/key-group';
import { RouteState, RouteStore } from '../../manage.store';

@View
@Component({
	name: 'RouteDashGamesManageKeyGroupsEdit',
	components: {
		AppProgressBar,
		AppJolticon,
		AppExpand,
		AppTimeAgo,
		FormGameKeyGroup,
		FormGameKeyGroupAddKeys,
	},
	directives: {
		AppTooltip,
	},
	filters: {
		number,
	},
})
export default class RouteDashGamesManageKeyGroupsEdit extends BaseRouteComponent {
	@RouteState
	game!: RouteStore['game'];

	keyGroup: KeyGroup = null as any;
	packages: GamePackage[] = [];
	keys: Key[] = [];

	isShowingAddKeys = false;

	search = {
		filter: '',
		state: 'all',
	};
	number = number;
	Environment = Environment;
	KeyGroup = KeyGroup;

	@RouteResolve({
		deps: { params: ['keyGroupId'] },
	})
	routeResolve(this: undefined, route: Route) {
		return Api.sendRequest(
			`/web/dash/developer/games/key-groups/${route.params.id}/${route.params.keyGroupId}`
		);
	}

	get routeTitle() {
		if (this.keyGroup) {
			return this.$gettextInterpolate('Edit Key Group: %{ name }', {
				name: this.keyGroup.name,
			});
		}
		return null;
	}

	routed($payload: any) {
		this.keyGroup = new KeyGroup($payload.keyGroup);
		this.packages = GamePackage.populate($payload.packages);
		this.keys = Key.populate($payload.keys);
	}

	async searchKeys() {
		const response = await Api.sendRequest(
			'/web/dash/developer/games/key-groups/search-keys/' +
				`${this.$route.params.id}/${this.$route.params.keyGroupId}`,
			this.search
		);

		this.keys = Key.populate(response.keys);
	}

	copyKeyLink(key: Key) {
		Clipboard.copy(`${Environment.baseUrl}/claim/${key.key}`);
	}

	onNewKeysAdded() {
		// Gotta reload to show the new keys.
		this.reloadRoute();
		this.isShowingAddKeys = false;
	}

	async removeGroup(keyGroup: KeyGroup) {
		const resolved = await ModalConfirm.show(
			this.$gettext(
				// tslint:disable-next-line:max-line-length
				'Are you sure you want to remove this key group? All keys within this key group will be invalidated. Any access that users may have gained from these keys will be revoked. This can not be reversed.'
			),
			this.$gettext('Remove key group?')
		);

		if (!resolved) {
			return;
		}

		try {
			await keyGroup.$remove();
		} catch (e) {
			Growls.error(this.$gettext('Could not remove key group for some reason.'));
			return;
		}

		Growls.success(
			this.$gettext('The key group has been removed.'),
			this.$gettext('Removed Key Group')
		);

		this.$router.push({
			name: 'dash.games.manage.key-groups.list',
		});
	}

	async removeKey(key: Key) {
		const resolved = await ModalConfirm.show(
			this.$gettext(
				// tslint:disable-next-line:max-line-length
				`Are you sure you want to remove this key? This will revoke this key's access, or anyone that has claimed this key. This can not be reversed.`
			),
			this.$gettext('Remove key?')
		);

		if (!resolved) {
			return;
		}

		try {
			await key.$remove();
		} catch (e) {
			Growls.error(this.$gettext('Could not remove key for some reason.'));
			return;
		}

		Growls.success(this.$gettext('The key has been removed.'), this.$gettext('Removed Key'));

		arrayRemove(this.keys, k => k.id === key.id);
	}
}
