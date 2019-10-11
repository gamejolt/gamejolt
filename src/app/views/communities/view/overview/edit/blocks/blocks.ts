import { Component } from 'vue-property-decorator';
import { Api } from '../../../../../../../_common/api/api.service';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../../../_common/route/route-component';
import FormCommunityBlock from '../../../../../../components/forms/community/ban/block.vue';
import { RouteStore, RouteStoreModule } from '../edit.store';

@Component({
	name: 'RouteCommunitiesViewEditBlocks',
	components: {
		FormCommunityBlock,
	},
})
@RouteResolver({
	deps: { params: ['id'] },
	resolver({ route }) {
		return Api.sendRequest('/web/dash/communities/blocks/' + route.params.id, {});
	},
})
export default class RouteCommunitiesViewEditBlocks extends BaseRouteComponent {
	@RouteStoreModule.State
	community!: RouteStore['community'];
}
