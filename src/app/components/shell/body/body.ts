import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import AppShellFooter from '../footer/footer.vue'

// Includes global styling.
require('./body.styl');

@Component({
	components: {
		AppShellFooter,
	},
})
export default class AppShellBody extends Vue {}
