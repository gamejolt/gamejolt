import View from '!view!./body.html';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { AppShellFooter } from '../footer/footer';

// Includes global styling.
require('./body.styl');

@View
@Component({
	components: {
		AppShellFooter,
	},
})
export class AppShellBody extends Vue {}
