import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { AppLazyPlaceholder } from '../../../../_common/lazy/placeholder/placeholder';

// JODO: This doesn't yet look like the post page before content.

@Component({
	components: {
		AppLazyPlaceholder,
	},
})
export default class AppPostViewPlaceholder extends Vue {}
