import { AppTrackEvent } from '../../../../../_common/analytics/track-event.directive';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import AppTagList from '../../../../components/tag/list/list.vue';

@Component({
	components: {
		AppTagList,
	},
	directives: {
		AppTrackEvent,
	},
})
export default class AppDiscoverHomeTags extends Vue {}
