import View from '!view!./processing.html';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { AppLoading } from '../../../../../lib/gj-lib-client/vue/components/loading/loading';

/**
 * Used by multiple components to show a processing message.
 */
@View
@Component({
	components: {
		AppLoading,
	},
})
export class AuthLinkedAccountProcessing extends Vue {}
