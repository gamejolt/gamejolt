import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { LOCALSTORAGE_VISITED_KEY } from '../../../views/weplay/weplay';
import AppWeplayLogo from '../logo/logo.vue';

@Component({
	components: {
		AppWeplayLogo,
	},
})
export default class AppWeplayBanner extends Vue {
	readonly Screen = Screen;

	hasVisited = false;

	mounted() {
		this.hasVisited = localStorage.getItem(LOCALSTORAGE_VISITED_KEY) === '1';
	}
}
