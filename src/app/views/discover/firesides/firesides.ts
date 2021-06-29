import Component from 'vue-class-component';
import { Api } from '../../../../_common/api/api.service';
import { Fireside } from '../../../../_common/fireside/fireside.model';
import AppIllustration from '../../../../_common/illustration/illustration.vue';
import AppLoadingFade from '../../../../_common/loading/fade/fade.vue';
import { BaseRouteComponent, RouteResolver } from '../../../../_common/route/route-component';
import { Screen } from '../../../../_common/screen/screen-service';
import { AppState, AppStore } from '../../../../_common/store/app-store';
import AppFiresideBadgeAdd from '../../../components/fireside/badge/add/add.vue';
import AppFiresideBadge from '../../../components/fireside/badge/badge.vue';
import AppPageContainer from '../../../components/page-container/page-container.vue';

const endpoint = `/web/fireside/discover`;

type RoutePayload = {
	userFireside: any;
	followedFiresides: any[];
	popularFiresides: any[];
	backgroundImageUrl: string;
};

@Component({
	name: 'RouteDiscoverFiresides',
	components: {
		AppPageContainer,
		AppFiresideBadge,
		AppFiresideBadgeAdd,
		AppIllustration,
		AppLoadingFade,
	},
})
@RouteResolver({
	resolver: () => Api.sendRequest(endpoint),
})
export default class RouteDiscoverFiresides extends BaseRouteComponent {
	@AppState user!: AppStore['user'];

	isLoading = false;
	userFireside: Fireside | null = null;
	followedFiresides: Fireside[] = [];
	popularFiresides: Fireside[] = [];
	backgroundImageUrl: string | null = null;

	get routeTitle() {
		return this.$gettext(`Discover Firesides`);
	}

	get shouldShowBackgroundImage() {
		return this.backgroundImageUrl && (Screen.isLg || Screen.isMd);
	}

	routeResolved($payload: RoutePayload) {
		this.processPayload($payload);
	}

	private processPayload(payload: RoutePayload) {
		this.backgroundImageUrl = payload.backgroundImageUrl;

		if (payload.userFireside) {
			this.userFireside = new Fireside(payload.userFireside);
		} else {
			this.userFireside = null;
		}

		if (payload.followedFiresides) {
			this.followedFiresides = Fireside.populate(payload.followedFiresides);
		} else {
			this.followedFiresides = [];
		}

		if (payload.popularFiresides) {
			this.popularFiresides = Fireside.populate(payload.popularFiresides);
		} else {
			this.popularFiresides = [];
		}
	}

	private async refresh() {
		this.isLoading = true;

		const payload = await Api.sendRequest(endpoint);
		this.processPayload(payload);

		this.isLoading = false;
	}

	onClickRefresh() {
		this.refresh();
	}

	onFiresideExpired() {
		this.refresh();
	}
}
