import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import View from '!view!./list.html?style=./list.styl';

import { AppTrackEvent } from '../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { AppNoAutoscroll } from '../../../../lib/gj-lib-client/components/scroll/auto-scroll/no-autoscroll.directive.vue';
import { Genre } from '../genre';

@View
@Component({
	directives: {
		AppTrackEvent,
		AppNoAutoscroll,
	},
})
export class AppGenreList extends Vue {
	readonly Genre = Genre;
}
