import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import AppErrorPage from '../_common/error/page/page.vue';
import AppCommonShell from '../_common/shell/shell.vue';

@Component({
	components: {
		AppCommonShell,
		AppErrorPage,
	},
})
export default class App extends Vue {}
