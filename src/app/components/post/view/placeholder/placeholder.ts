import View from '!view!./placeholder.html';
import { AppLazyPlaceholder } from 'game-jolt-frontend-lib/components/lazy/placeholder/placeholder';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

@View
@Component({
	components: {
		AppLazyPlaceholder,
	},
})
export class AppPostViewPlaceholder extends Vue {}
