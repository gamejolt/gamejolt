import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./wizard-finish.html';

import { Meta } from '../../../../../../../lib/gj-lib-client/components/meta/meta-service';
import { RouteState, RouteStore, RouteAction } from '../../manage.state';

@View
@Component({})
export default class RouteDashGamesManageGameWizardFinish extends Vue {
	@RouteState canPublish: RouteStore['canPublish'];
	@RouteAction publish: RouteStore['publish'];
	@RouteAction saveDraft: RouteStore['saveDraft'];

	created() {
		Meta.title = this.$gettext('The End Is Not the End');
	}
}
