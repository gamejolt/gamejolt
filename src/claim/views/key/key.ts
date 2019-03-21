import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { Environment } from 'game-jolt-frontend-lib/components/environment/environment.service';
import { GameBundle } from 'game-jolt-frontend-lib/components/game-bundle/game-bundle.model';
import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import { Growls } from 'game-jolt-frontend-lib/components/growls/growls.service';
import { ModalConfirm } from 'game-jolt-frontend-lib/components/modal/confirm/confirm-service';
import { Navigate } from 'game-jolt-frontend-lib/components/navigate/navigate.service';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import AppInvalidKey from '../../components/invalid-key/invalid-key.vue';
import { Store } from '../../store/index';
import AppKeyBundle from './_bundle/bundle.vue';
import AppKeyGame from './_game/game.vue';

@Component({
	name: 'RouteKey',
	components: {
		AppInvalidKey,
	},
})
@RouteResolver({
	cache: true,
	resolver({ route }) {
		let url = '/claim/view/' + route.params.accessKey;

		if (route.query.bundleGameId) {
			url += '?game_id=' + route.query.bundleGameId;
		}

		return Api.sendRequest(url);
	},
})
export default class RouteKey extends BaseRouteComponent {
	@State
	app!: Store['app'];

	// Use payload here so that the children can be reactive to it.
	payload = null as any;
	invalidKey = false;
	type = '';

	get accessKey() {
		return this.$route.params.accessKey;
	}

	get loginUrl() {
		return (
			Environment.authBaseUrl + '/login?redirect=' + encodeURIComponent(this.$route.fullPath)
		);
	}

	get component() {
		if (this.type === 'bundle' && !this.$route.query.bundleGameId) {
			return AppKeyBundle;
		}
		return AppKeyGame;
	}

	routeCreated() {
		this.payload = null;
		this.type = '';
	}

	get routeTitle() {
		if (this.payload) {
			if (this.type === 'bundle') {
				return this.$gettextInterpolate(`Key Page for %{ bundle }`, {
					bundle: this.payload.bundle.title,
				});
			} else if (this.type === 'game') {
				return this.$gettextInterpolate(`Key Page for %{ game }`, {
					game: this.payload.game.title,
				});
			} else if (this.type === 'bundle-game' && this.payload.bundle) {
				return this.$gettextInterpolate(`Key Page for %{ game } in %{ bundle }`, {
					game: this.payload.game.title,
					bundle: this.payload.bundle.title,
				});
			}
		}

		return null;
	}

	routeResolved($payload: any) {
		if ($payload.error === 'invalid-key') {
			this.invalidKey = true;
			return;
		}

		this.payload = $payload;
		this.type = this.payload.type;
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
			const response = await Api.sendRequest(
				'/web/library/claim-key',
				{ key: this.accessKey },
				{ detach: true }
			);

			if (response && response.error && response.error === 'already-claimed-in-group') {
				this.invalidKey = true;
				Growls.error(this.$gettext(`You already claimed a key for that!`));
				return;
			}

			let location = '';
			if (resource instanceof GameBundle) {
				location =
					Environment.wttfBaseUrl +
					`/library/bundle/${resource.slug}/${resource.id}/games`;
			} else if (resource instanceof Game) {
				location = Environment.wttfBaseUrl + `/profile/${user.slug}/${user.id}/owned`;
			}

			if (location) {
				Navigate.goto(location);
			}
		} catch (_e) {
			Growls.error(
				this.$gettext(`For some reason we couldn't claim this into your account!`)
			);
		}
	}
}
