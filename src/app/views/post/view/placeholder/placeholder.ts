import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { AppLazyPlaceholder } from '../../../../../_common/lazy/placeholder/placeholder';

@Component({
	components: {
		AppLazyPlaceholder,
	},
})
export default class AppPostViewPlaceholder extends Vue {}
