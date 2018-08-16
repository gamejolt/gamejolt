import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./mod-links.html';

import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { Environment } from '../../../../lib/gj-lib-client/components/environment/environment.service';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { Growls } from '../../../../lib/gj-lib-client/components/growls/growls.service';

@View
@Component({
	components: {
		AppJolticon,
	},
})
export class AppGameModLinks extends Vue {
	@Prop(Object) game!: Game;

	Environment = Environment;

	async tag(tag: string) {
		// It won't return what site api expects for output, so gotta catch.
		try {
			await Api.sendRequest(`/games/tags/tag/${this.game.id}/${tag}`, null, {
				apiPath: '/moderate',
				processPayload: false,
			});
		} catch (_e) {
			Growls.success('Tagged the game.');
		}
	}

	async untag(tag: string) {
		// It won't return what site api expects for output, so gotta catch.
		try {
			await Api.sendRequest(`/games/tags/untag/${this.game.id}/${tag}`, null, {
				apiPath: '/moderate',
				processPayload: false,
			});
		} catch (_e) {
			Growls.success('Untagged the game.');
		}
	}
}
