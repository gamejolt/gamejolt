import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./thumbnail.html?style=./thumbnail.styl';

import { Channels } from '../channels-service';
import { AppTrackEvent } from '../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { Location } from 'vue-router';

@View
@Component({
	directives: {
		AppTrackEvent,
	},
})
export class AppChannelThumbnail extends Vue {
	@Prop(String) channel: string;

	get channelInfo() {
		return Channels.channels.find(i => i.id === this.channel)!;
	}

	get location(): Location {
		if (this.channelInfo.type === 'channel') {
			return {
				name: 'discover.channels.view.overview',
				params: { channel: this.channel },
			};
		}

		return {
			name: 'discover.games.list._fetch-category',
			params: {
				section: null as any,
				category: this.channel,
			},
		};
	}
}
