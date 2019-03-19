import { Connection } from 'game-jolt-frontend-lib/components/connection/connection-service';
import AppErrorPage from 'game-jolt-frontend-lib/components/error/page/page.vue';
import AppGrowls from 'game-jolt-frontend-lib/components/growls/growls.vue';
import AppLoadingBar from 'game-jolt-frontend-lib/components/loading/bar/bar.vue';
import { AppTheme } from 'game-jolt-frontend-lib/components/theme/theme';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { loadCurrentLanguage } from '../utils/translations';
import AppCookieBanner from '../_common/cookie/banner/banner.vue';

let components: any = {
	AppTheme,
	AppLoadingBar,
	AppGrowls,
	AppErrorPage,
	AppCookieBanner,
};

if (GJ_IS_CLIENT) {
	// TODO check if the .default is actually needed here
	components = {
		...components,
		...require('../_common/client/base/base.vue').default,
	};
}

@Component({
	components,
})
export default class App extends Vue {
	readonly Connection = Connection;

	mounted() {
		loadCurrentLanguage(this);
	}
}
