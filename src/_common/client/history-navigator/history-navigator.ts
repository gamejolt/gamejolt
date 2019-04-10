import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import AppJolticon from 'game-jolt-frontend-lib/vue/components/jolticon/jolticon.vue'
import { ClientHistoryNavigator } from './history-navigator.service';

@Component({
	components: {
		AppJolticon,
	},
})
export default class AppClientHistoryNavigator extends Vue {
	readonly HistoryNavigator = ClientHistoryNavigator;
}
