import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import AppProgressBar from './bar.vue'

@Component({
	components: {
		AppProgressBar,
	},
})
export default class AppProgressBarStyleguide extends Vue {
	progress = 0;
}
