import View from '!view!./tags.html?style=./tags.styl';
import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { CommunityTag } from 'game-jolt-frontend-lib/components/community/tag/tag.model';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { Component } from 'vue-property-decorator';
import { Growls } from '../../../../../../lib/gj-lib-client/components/growls/growls.service';
import { FormCommunityTag } from '../../../../../components/forms/community/tag/tag';
import { RouteStore, RouteStoreModule } from '../manage.store';

const draggable = require('vuedraggable');

@View
@Component({
	name: 'RouteDashCommunitiesManageTags',
	components: {
		FormCommunityTag,
		draggable,
	},
})
@RouteResolver({
	resolver({ route }) {
		return Api.sendRequest('/web/dash/communities/tags/' + route.params.id);
	},
})
export default class RouteDashCommunitiesManageTags extends BaseRouteComponent {
	@RouteStoreModule.State
	community!: RouteStore['community'];

	tags: CommunityTag[] = [];

	get routeTitle() {
		if (this.community) {
			return this.$gettextInterpolate(`Edit Tags for %{ community }`, {
				community: this.community.name,
			});
		}
		return null;
	}

	routeResolved(payload: any) {
		this.tags = CommunityTag.populate(payload.tags);
	}

	saveSort() {
		CommunityTag.$saveSort(this.community.id, this.tags.map(i => i.id));
	}

	onTagAdded(tag: CommunityTag) {
		this.tags.unshift(tag);
	}

	async onTagRemove(tag: CommunityTag) {
		try {
			await tag.$remove();
		} catch (e) {
			console.error(e);
			Growls.error('Could not remove tag');
		}

		if (tag._removed) {
			this.tags = this.tags.filter(i => i.id !== tag.id);
		}
	}
}
