import { Options, Vue } from 'vue-property-decorator';
import { ClientHistoryNavigator } from './history-navigator.service';

@Options({})
export default class AppClientHistoryNavigator extends Vue {
	readonly HistoryNavigator = ClientHistoryNavigator;
}
