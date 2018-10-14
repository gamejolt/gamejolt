import View from '!view!./view.html';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { Meta } from '../../../../../lib/gj-lib-client/components/meta/meta-service';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../lib/gj-lib-client/components/route/route-component';
import { number } from '../../../../../lib/gj-lib-client/vue/filters/number';
import { Channels } from '../../../../components/channel/channels-service';
import { AppPageHeader } from '../../../../components/page-header/page-header';
import { Store } from '../../../../store/index';
import { ChannelsViewHelper } from '../channels-view-helper';

@View
@Component({
	name: 'RouteDiscoverChannelsView',
	components: {
		AppPageHeader,
	},
})
@RouteResolver({
	cache: true,
	lazy: true,
	deps: { params: ['channel'] },
	resolver: ({ route }) => Api.sendRequest('/web/discover/channels/' + route.params.channel),
})
export default class RouteDiscoverChannelsView extends BaseRouteComponent {
	@State
	route!: Store['route'];

	channel = '';

	number = number;
	Meta = Meta;
	Channels = Channels;

	get img() {
		const info = Channels.channels.find(i => i.id === this.channel);
		return info && info.image;
	}

	get routeTitle() {
		return ChannelsViewHelper.getRouteTitle(this.route.params.channel);
	}

	routeCreated() {
		this.channel = this.route.params.channel;
		ChannelsViewHelper.setDefaultMetaData(this.route.params.channel);
	}

	routeResolved($payload: any) {
		// Overwrite channel from server so we can decide how it displays in the
		// end.
		this.channel = $payload.channel;
	}
}
