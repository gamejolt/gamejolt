import View from '!view!./placeholder.html';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { AppActivityFeedItemPlaceholder } from '../item/placeholder/placeholder';

@View
@Component({
	components: {
		AppActivityFeedItemPlaceholder,
	},
})
export class AppActivityFeedPlaceholder extends Vue {}
