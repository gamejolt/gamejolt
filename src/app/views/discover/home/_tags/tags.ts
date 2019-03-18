import View from '!view!./tags.html?style=./tags.styl';
import { AppTrackEvent } from 'game-jolt-frontend-lib/components/analytics/track-event.directive';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { AppTagList } from '../../../../components/tag/list/list';

@View
@Component({
	components: {
		AppTagList,
	},
	directives: {
		AppTrackEvent,
	},
})
export class AppDiscoverHomeTags extends Vue {}
