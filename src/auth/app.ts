import { Connection } from '../_common/connection/connection-service';
import AppErrorPage from '../_common/error/page/page.vue';
import AppGrowls from '../_common/growls/growls.vue';
import AppLoadingBar from '../_common/loading/bar/bar.vue';
import { AppTheme } from '../_common/theme/theme';
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
	components.AppClientBase = require('../_common/client/base/base.vue').default;
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
