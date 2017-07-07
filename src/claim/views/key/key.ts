import Vue from 'vue';
import VueRouter from 'vue-router';
import { State } from 'vuex-class';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./key.html';

import { RouteResolve } from '../../../lib/gj-lib-client/utils/router';
import { Api } from '../../../lib/gj-lib-client/components/api/api.service';
import { Environment } from '../../../lib/gj-lib-client/components/environment/environment.service';
import { AppKeyGame } from './_game/game';
import { Game } from '../../../lib/gj-lib-client/components/game/game.model';
import { GameBundle } from '../../../lib/gj-lib-client/components/game-bundle/game-bundle.model';
import { AppInvalidKey } from '../../components/invalid-key/invalid-key';
import { AppKeyBundle } from './_bundle/bundle';
import { ModalConfirm } from '../../../lib/gj-lib-client/components/modal/confirm/confirm-service';
import { Growls } from '../../../lib/gj-lib-client/components/growls/growls.service';
import { Store } from '../../store/index';

@View
@Component({
	components: {
		AppInvalidKey,
	},
})
export default class RouteKey extends Vue {
	@Prop([String])
	accessKey: string;

	@State app: Store['app'];

	invalidKey = false;
	type = '';

	get loginUrl() {
		return (
			Environment.authBaseUrl +
			'/login?redirect=' +
			encodeURIComponent(this.$route.fullPath)
		);
	}

	get component() {
		if (this.type === 'bundle' && !this.$route.query.bundleGameId) {
			return AppKeyBundle;
		}
		return AppKeyGame;
	}

	@RouteResolve({ cache: true })
	routeResolve(this: undefined, route: VueRouter.Route) {
		let url = '/claim/view/' + route.params.accessKey;

		if (route.query.bundleGameId) {
			url += '?game_id=' + route.query.bundleGameId;
		}

		return Api.sendRequest(url);
	}

	routed() {
		if (this.$payload.error === 'invalid-key') {
			this.invalidKey = true;
			return;
		}

		this.type = this.$payload.type;
	}

	async claim(resource: Game | GameBundle) {
		console.log('claim', resource);
		const resourceName = resource instanceof GameBundle ? 'bundle' : 'game';

		const result = await ModalConfirm.show(
			this.$gettextInterpolate(
				`Claiming this %{ type } into your Library will allow you to access it through your Game Jolt account and invalidate this key page.`,
				{ type: resourceName }
			)
		);

		const user = this.app.user;
		if (!result || !user) {
			return;
		}

		try {
			await Api.sendRequest('/web/library/claim-key', { key: this.accessKey });

			if (resource instanceof GameBundle) {
				window.location.href =
					Environment.wttfBaseUrl +
					`/library/bundle/${resource.slug}/${resource.id}/games`;
			} else if (resource instanceof Game) {
				window.location.href =
					Environment.wttfBaseUrl + `/profile/${user.slug}/${user.id}/owned`;
			}
		} catch (_e) {
			Growls.error(
				this.$gettext(
					`For some reason we couldn't claim this into your account!`
				)
			);
		}
	}
}
