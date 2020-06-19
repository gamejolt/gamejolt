import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import AppNavChannelCards from './cards.vue';

@Component({
	components: {
		AppNavChannelCards,
	},
})
export default class AppNavChannels extends Vue {}
