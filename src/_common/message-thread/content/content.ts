import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import AppTimelineListItem from '../../timeline-list/item/item.vue'

@Component({
	components: {
		AppTimelineListItem,
	},
})
export default class AppMessageThreadContent extends Vue {}
