import View from '!view!./flow.html?style=./flow.styl';
import { Connection } from 'game-jolt-frontend-lib/components/connection/connection-service';
import { Environment } from 'game-jolt-frontend-lib/components/environment/environment.service';
import { Component } from 'vue-property-decorator';
import { BaseRouteComponent } from '../../../lib/gj-lib-client/components/route/route-component';
import { AppThemeSvg } from '../../../lib/gj-lib-client/components/theme/svg/svg';
import { AppTranslateLangSelector } from '../../../lib/gj-lib-client/components/translate/lang-selector/lang-selector';
import { store } from '../../store/index';

@View
@Component({
	name: 'RouteFlow',
	components: {
		AppThemeSvg,
		AppTranslateLangSelector,
	},
})
export default class RouteFlow extends BaseRouteComponent {
	readonly Environment = Environment;
	readonly Connection = Connection;

	mounted() {
		console.log(store.state.app.user);
	}
}
