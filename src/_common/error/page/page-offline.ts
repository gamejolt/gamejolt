import { Vue } from 'vue-property-decorator';
import { Navigate } from '../../navigate/navigate.service';

export default class AppErrorPageOffline extends Vue {
	retry() {
		Navigate.reload();
	}
}
