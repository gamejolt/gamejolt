import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./app.html';

import { AppErrorPage } from '../lib/gj-lib-client/components/error/page/page';
import { AppGrowls } from '../lib/gj-lib-client/components/growls/growls';
import { AppLoadingBar } from '../lib/gj-lib-client/components/loading/bar/bar';
import { loadCurrentLanguage } from '../utils/translations';
import { AppSiteEditor } from './components/site-editor/site-editor';

@View
@Component({
	components: {
		AppErrorPage,
		AppLoadingBar,
		AppGrowls,
		AppSiteEditor,
	},
})
export class App extends Vue {
	mounted() {
		loadCurrentLanguage(this);
	}
}
