import View from '!view!./tags.html?style=./tags.styl';
import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { stringSort } from 'game-jolt-frontend-lib/utils/array';
import { Component } from 'vue-property-decorator';
import { Mutation, State } from 'vuex-class';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../lib/gj-lib-client/components/route/route-component';
import { arrayRemove } from '../../../../lib/gj-lib-client/utils/array';
import { Store } from '../../../store/index';

@View
@Component({
	name: 'RouteFlowTags',
	components: {},
})
@RouteResolver({
	resolver: () => Api.sendRequest('/web/new-user/tags'),
})
export default class RouteFlowTags extends BaseRouteComponent {
	@State
	app!: Store['app'];

	genres: string[] = [];
	content: string[] = [];
	activeTags: string[] = [];

	@Mutation
	setTags!: Store['setTags'];

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
		this.setTags(this.activeTags);

		this.$router.push({ name: 'flow.explore' });
	}
}
