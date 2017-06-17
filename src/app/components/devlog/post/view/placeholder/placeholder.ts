import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./placeholder.html';

import { AppLazyPlaceholder } from '../../../../../../lib/gj-lib-client/components/lazy/placeholder/placeholder';

@View
@Component({
	components: {
		AppLazyPlaceholder,
	},
})
export class AppDevlogPostViewPlaceholder extends Vue {}
