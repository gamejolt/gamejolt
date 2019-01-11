import View from '!view!./design.html';
import { BaseRouteComponent } from 'game-jolt-frontend-lib/components/route/route-component';
import { ThemeMutation, ThemeStore } from 'game-jolt-frontend-lib/components/theme/theme.store';
import { Component } from 'vue-property-decorator';
import { FormCommunityDesign } from '../../../../../components/forms/community/design/design';
import { RouteStore, RouteStoreModule } from '../manage.store';

@View
@Component({
	name: 'RouteDashCommunitiesManageDesign',
	components: {
		FormCommunityDesign,
	},
})
export default class RouteDashCommunitiesManageDesign extends BaseRouteComponent {
	@RouteStoreModule.State
	community!: RouteStore['community'];

	@ThemeMutation
	setPageTheme!: ThemeStore['setPageTheme'];

	get routeTitle() {
		if (this.community) {
			return this.$gettextInterpolate(`Edit Design for %{ community }`, {
				community: this.community.name,
			});
		}
		return null;
	}

	onSubmit() {
		this.setPageTheme(this.community.theme || null);
	}
}
