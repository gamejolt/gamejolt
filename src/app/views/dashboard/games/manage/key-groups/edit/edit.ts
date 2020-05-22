import { Component } from 'vue-property-decorator';
import { arrayRemove } from '../../../../../../../utils/array';
import { Api } from '../../../../../../../_common/api/api.service';
import { Clipboard } from '../../../../../../../_common/clipboard/clipboard-service';
import { Environment } from '../../../../../../../_common/environment/environment.service';
import AppExpand from '../../../../../../../_common/expand/expand.vue';
import { number } from '../../../../../../../_common/filters/number';
import { GamePackage } from '../../../../../../../_common/game/package/package.model';
import { Growls } from '../../../../../../../_common/growls/growls.service';
import { KeyGroup } from '../../../../../../../_common/key-group/key-group.model';
import { Key } from '../../../../../../../_common/key/key-model';
import { ModalConfirm } from '../../../../../../../_common/modal/confirm/confirm-service';
import AppProgressBar from '../../../../../../../_common/progress/bar/bar.vue';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../../../_common/route/route-component';
import { AppTimeAgo } from '../../../../../../../_common/time/ago/ago';
import { AppTooltip } from '../../../../../../../_common/tooltip/tooltip-directive';
import FormGameKeyGroupAddKeys from '../../../../../../components/forms/game/key-group/add-keys/add-keys.vue';
import FormGameKeyGroup from '../../../../../../components/forms/game/key-group/key-group.vue';
import { RouteStore, RouteStoreModule } from '../../manage.store';

@Component({
	name: 'RouteDashGamesManageKeyGroupsEdit',
	components: {
		AppProgressBar,
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
@RouteResolver({
	deps: { params: ['keyGroupId'] },
	resolver: ({ route }) =>
		Api.sendRequest(
			`/web/dash/developer/games/key-groups/${route.params.id}/${route.params.keyGroupId}`
		),
})
export default class RouteDashGamesManageKeyGroupsEdit extends BaseRouteComponent {
	@RouteStoreModule.State
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

	get routeTitle() {
		if (this.keyGroup) {
			return this.$gettextInterpolate('Edit Key Group: %{ name }', {
				name: this.keyGroup.name,
			});
		}
		return null;
	}

	routeResolved($payload: any) {
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
