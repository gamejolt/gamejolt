import AppErrorPage from 'game-jolt-frontend-lib/components/error/page/page.vue';
import { AppTheme } from 'game-jolt-frontend-lib/components/theme/theme';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

@Component({
	components: {
		AppTheme,
		AppErrorPage,
	},
})
export default class App extends Vue {}
