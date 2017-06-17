import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./devlogs.html';

import { AppPageHeader } from '../../../components/page-header/page-header';

@View
@Component({
	components: {
		AppPageHeader,
	},
})
export default class RouteDiscoverDevlogs extends Vue {}
