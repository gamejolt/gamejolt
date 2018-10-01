import View from '!view!./app.html';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { AppErrorPage } from '../lib/gj-lib-client/components/error/page/page';
import { AppTheme } from '../lib/gj-lib-client/components/theme/theme';

@View
@Component({
	components: {
		AppTheme,
		AppErrorPage,
	},
})
export class App extends Vue {}
