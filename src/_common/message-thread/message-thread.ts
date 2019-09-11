import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import AppTimelineList from '../timeline-list/timeline-list.vue'

@Component({
	components: {
		AppTimelineList,
	},
})
export default class AppMessageThread extends Vue {
	@Prop(Boolean) isNested?: boolean;
}
