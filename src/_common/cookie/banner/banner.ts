import { Options, Vue } from 'vue-property-decorator';
import { Environment } from '../../environment/environment.service';

@Options({})
export default class AppCookieBanner extends Vue {
	readonly Environment = Environment;

	forceClosed = false;

	get shouldShow() {
		if (import.meta.env.SSR || GJ_IS_DESKTOP_APP) {
			return false;
		}

		return !this.forceClosed && !window.localStorage.getItem('banner:cookie');
	}

	close() {
		this.forceClosed = true;
		window.localStorage.setItem('banner:cookie', Date.now() + '');
	}
}
