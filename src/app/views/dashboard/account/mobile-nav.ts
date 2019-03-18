import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import AppPageHeader from '../../../components/page-header/page-header.vue';

@Component({
	components: {
		AppPageHeader,
	},
})
export default class RouteDashAccountMobileNav extends Vue {}
