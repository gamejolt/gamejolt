import View from '!view!./placeholder.html?style=./placeholder.styl';
import { AppButtonPlaceholder } from 'game-jolt-frontend-lib/components/button/placeholder/placeholder';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

@View
@Component({
	components: {
		AppButtonPlaceholder,
	},
})
export class AppActivityFeedItemPlaceholder extends Vue {}
