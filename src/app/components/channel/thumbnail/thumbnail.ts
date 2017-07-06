import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./thumbnail.html?style=./thumbnail.styl';

import { Channels } from '../channels-service';
import { AppTrackEvent } from '../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { number } from '../../../../lib/gj-lib-client/vue/filters/number';

@View
@Component({
	directives: {
		AppTrackEvent,
	},
})
export class AppChannelThumbnail extends Vue {
	@Prop([String])
	channel: string;
	@Prop([Number])
	gamesCount?: number;

	Channels = Channels;
	number = number;
}
