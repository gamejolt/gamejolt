import View from '!view!./retrieve.html';
import { Component } from 'vue-property-decorator';
import { Api } from '../../../lib/gj-lib-client/components/api/api.service';
import { GameBundle } from '../../../lib/gj-lib-client/components/game-bundle/game-bundle.model';
import { Game } from '../../../lib/gj-lib-client/components/game/game.model';
import { Meta } from '../../../lib/gj-lib-client/components/meta/meta-service';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../lib/gj-lib-client/components/route/route-component';
import { FormRetrieve } from '../../components/forms/retrieve/retrieve';
import { AppInvalidKey } from '../../components/invalid-key/invalid-key';

interface SuccessPayload {
	error: false;
	type: 'game' | 'bundle';
	key: string;
	payload?: any;
}

interface ErrorPayload {
	error: true;
}

type Payload = SuccessPayload | ErrorPayload | undefined;

@View
@Component({
	name: 'RouteRetrieve',
	components: {
		FormRetrieve,
		AppInvalidKey,
	},
})
@RouteResolver({
	async resolver({ route }): Promise<Payload> {
		let type: 'game' | 'bundle' | undefined;
		let key = '';

		// Retrieving all keys. We don't need to call the API.
		if (!route.params.input) {
			return undefined;
		}

		const matches = route.params.input.match(/(g|b)\-([0-9a-zA-Z]+)/);
		if (matches) {
			if (matches[1] === 'g') {
				type = 'game';
			} else if (matches[1] === 'b') {
				type = 'bundle';
			}
		}

		// Invalid key passed in.
		if (!matches || !type) {
			return { error: true };
		}

		key = matches[2];

		// Retrieving a key for a particular bundle or game.
		return {
			error: false,
			type,
			key,
			payload: await Api.sendRequest(`/claim/retrieve/${type}/${key}`),
		};
	},
})
export default class RouteRetrieve extends BaseRouteComponent {
	invalidKey = false;
	key = '';
	bundle: GameBundle | null = null;
	game: Game | null = null;
	resourceTitle = '';

	readonly Meta = Meta;

	get routeTitle() {
		if (this.resourceTitle) {
			return this.$gettextInterpolate(`Retrieve Your Keys for %{ resource }`, {
				resource: this.resourceTitle,
			});
		}

		return this.$gettext(`Retrieve Your Keys`);
	}

	routeResolved($payload: Payload) {
		// Invalid key.
		if ($payload && ($payload.error || $payload.payload.error)) {
			this.invalidKey = true;
			return;
		}

		// Retrieving a key for a particular bundle or game.
		if ($payload && !$payload.error) {
			const {
				key,
				payload: { bundle, game },
			} = $payload;
			this.key = key;
			this.bundle = bundle ? new GameBundle(bundle) : null;
			this.game = game ? new Game(game) : null;
		}

		this.resourceTitle = '';
		if (this.bundle) {
			this.resourceTitle = this.bundle.title;
		} else if (this.game) {
			this.resourceTitle = this.game.title;
		}
	}

	onSubmit() {
		this.$router.push({ name: 'sent-key' });
	}
}
