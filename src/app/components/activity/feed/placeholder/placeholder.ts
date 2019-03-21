import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import AppActivityFeedItemPlaceholder from '../item/placeholder/placeholder.vue';

@Component({
	components: {
		AppActivityFeedItemPlaceholder,
	},
})
export default class AppActivityFeedPlaceholder extends Vue {}
