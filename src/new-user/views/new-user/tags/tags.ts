import View from '!view!./tags.html?style=./tags.styl';
import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { stringSort } from 'game-jolt-frontend-lib/utils/array';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../lib/gj-lib-client/components/route/route-component';
import { arrayRemove } from '../../../../lib/gj-lib-client/utils/array';
import { Store } from '../../../store/index';

@View
@Component({
	name: 'RouteNewUserTags',
	components: {},
})
@RouteResolver({
	resolver: () => Api.sendRequest('/web/new-user/tags'),
})
export default class RouteNewUserTags extends BaseRouteComponent {
	@State
	app!: Store['app'];

	genres: string[] = [];
	content: string[] = [];
	activeTags: string[] = [];

	get nextButtonText() {
		return this.activeTags.length > 0 ? 'Continue' : 'Skip';
	}

	routeResolved($payload: any) {
		if ($payload) {
			if ($payload.genres) {
				this.genres = $payload.genres.sort(stringSort);
			}
			if ($payload.content) {
				this.content = $payload.content.sort(stringSort);
			}
			if ($payload.selectedTags) {
				this.activeTags = $payload.selectedTags;
			}
		}
	}

	toggleTag(tag: string) {
		if (this.activeTags.includes(tag)) {
			arrayRemove(this.activeTags, t => t === tag);
		} else {
			this.activeTags.push(tag);
		}
	}

	async onClickNext() {
		await Api.sendRequest(
			'/web/new-user/set-tags',
			{ tags: this.activeTags },
			{
				allowComplexData: ['tags'],
				processPayload: false,
			}
		);

		this.$router.push({ name: 'new-user.explore' });
	}
}
