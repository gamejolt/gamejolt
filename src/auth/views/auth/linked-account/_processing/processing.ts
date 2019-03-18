import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import AppLoading from 'game-jolt-frontend-lib/vue/components/loading/loading.vue'

/**
 * Used by multiple components to show a processing message.
 */

@Component({
	components: {
		AppLoading,
	},
})
export default class AuthLinkedAccountProcessing extends Vue {}
