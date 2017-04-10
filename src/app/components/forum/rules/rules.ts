import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./rules.html';

import { AppExpand } from '../../../../lib/gj-lib-client/components/expand/expand';

@View
@Component({
	components: {
		AppExpand,
	},
})
export class AppForumRules extends Vue
{
	isShowingRules = false;
}
