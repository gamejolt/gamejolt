import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { ClientHistoryNavigator } from './history-navigator.service';

@Component({})
export default class AppClientHistoryNavigator extends Vue {
	readonly HistoryNavigator = ClientHistoryNavigator;
}
