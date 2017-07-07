import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./list.html';

import { Meta } from '../../../../../lib/gj-lib-client/components/meta/meta-service';
import { RouteResolve } from '../../../../../lib/gj-lib-client/utils/router';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { AppPageHeader } from '../../../../components/page-header/page-header';
import { AppChannelThumbnail } from '../../../../components/channel/thumbnail/thumbnail';

@View
@Component({
	components: {
		AppPageHeader,
		AppChannelThumbnail,
	},
})
export default class RouteDiscoverChannelsList extends Vue {
	channels: any[] = [];
	gameCounts: any = {};

	@RouteResolve()
	routeResolve() {
		return Api.sendRequest('/web/discover/channels');
	}

	routeInit() {
		Meta.title = this.$gettext('Top Channels');
		Meta.description =
			'Find and discover indie games around specific interests.';
	}

	routed() {
		this.channels = this.$payload.channels;
		this.$payload.gameCounts.forEach((item: any) =>
			this.$set(this.gameCounts, item.channel, item.count)
		);
	}
}
