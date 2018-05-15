import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import View from '!view!./flash.html';

import { Store } from '../../../store/index';

@View
@Component({})
export class AppEmbedFlash extends Vue {
	@State url: Store['url'];
	@State build: Store['build'];
	@State username: Store['username'];
	@State token: Store['token'];

	get query() {
		if (this.username && this.token) {
			return `?gjapi_username=${this.username}&gjapi_token=${this.token}`;
		}
		return '';
	}
}
