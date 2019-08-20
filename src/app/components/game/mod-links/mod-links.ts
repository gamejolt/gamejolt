import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Api } from '../../../../_common/api/api.service';
import { Environment } from '../../../../_common/environment/environment.service';
import { Game } from '../../../../_common/game/game.model';
import { Growls } from '../../../../_common/growls/growls.service';

@Component({})
export default class AppGameModLinks extends Vue {
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
