import { AppLazyPlaceholder } from 'game-jolt-frontend-lib/components/lazy/placeholder/placeholder';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

@Component({
	components: {
		AppLazyPlaceholder,
	},
})
export default class AppPostViewPlaceholder extends Vue {}
