import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./list.html?style=./list.styl';

import { AppTrackEvent } from '../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { AppNoAutoscroll } from '../../../../lib/gj-lib-client/components/scroll/auto-scroll/no-autoscroll.directive.vue';
import { makeObservableService } from '../../../../lib/gj-lib-client/utils/vue';
import { Genre } from '../genre';

@View
@Component({
	directives: {
		AppTrackEvent,
		AppNoAutoscroll,
	},
})
export class AppGenreList extends Vue {
	Genre = makeObservableService(Genre);
}
