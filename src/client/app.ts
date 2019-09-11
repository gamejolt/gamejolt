import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import AppErrorPage from '../_common/error/page/page.vue';
import { AppTheme } from '../_common/theme/theme';

@Component({
	components: {
		AppTheme,
		AppErrorPage,
	},
})
export default class App extends Vue {}
