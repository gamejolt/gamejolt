import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { Environment } from '../../environment/environment.service';

@Component({})
export default class AppCookieBanner extends Vue {
	readonly Environment = Environment;

	forceClosed = false;

	get shouldShow() {
		if (GJ_IS_SSR || GJ_IS_CLIENT) {
			return false;
		}

		return !this.forceClosed && !window.localStorage.getItem('banner:cookie');
	}

	close() {
		this.forceClosed = true;
		window.localStorage.setItem('banner:cookie', Date.now() + '');
	}
}
