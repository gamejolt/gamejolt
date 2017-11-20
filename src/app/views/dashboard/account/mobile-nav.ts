import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import View from '!view!./mobile-nav.html';

import { AppPageHeader } from '../../../components/page-header/page-header';

@View
@Component({
	components: {
		AppPageHeader,
	},
})
export default class RouteDashAccountMobileNav extends Vue {}
