import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import AppLoading from '../../../../../_common/loading/loading.vue';

/**
 * Used by multiple components to show a processing message.
 */

@Component({
	components: {
		AppLoading,
	},
})
export default class AuthLinkedAccountProcessing extends Vue {}
