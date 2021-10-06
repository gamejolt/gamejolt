import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { AppAuthRequired } from '../../auth/auth-required-directive';

@Component({
	directives: {
		AppAuthRequired,
	},
})
export default class AppGameAddBanner extends Vue {}
