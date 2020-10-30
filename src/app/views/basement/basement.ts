import Component from 'vue-class-component';
import { Api } from '../../../_common/api/api.service';
import AppProgressBar from '../../../_common/progress/bar/bar.vue';
import { BaseRouteComponent, RouteResolver } from '../../../_common/route/route-component';
import { AppTheme } from '../../../_common/theme/theme';
import { Theme } from '../../../_common/theme/theme.model';
import { store } from '../../store';
import AppFlashlight from './_flashlight.vue';

export const BasementThemeKey = 'basement';

const BasementTheme = new Theme({ highlight: 'acaee6', backlight: '293749' });

@Component({
	name: 'RouteBasement',
	components: {
		AppTheme,
		AppProgressBar,
		AppFlashlight,
	},
})
@RouteResolver({
	deps: {},
	resolver: () => Api.sendRequest('/web/stickers/basement'),
})
export default class RouteBasement extends BaseRouteComponent {
	level = 0;
	required = 0;
	totalCount = 0;
	levelCount = 0;
	monsterImage = '';

	get routeTitle() {
		return 'The Basement';
	}

	get currentProgress() {
		if (this.level === 3) {
			return 100;
		}

		return (this.levelCount / (this.levelCount + this.required)) * 100;
	}

	routeResolved($payload: any) {
		this.level = $payload.level;
		this.required = $payload.required;
		this.totalCount = $payload.totalCount;
		this.levelCount = $payload.levelCount;
		this.monsterImage = $payload.monsterImage;

		store.commit('theme/setPageTheme', { key: BasementThemeKey, theme: BasementTheme });
	}

	routeDestroyed() {
		store.commit('theme/clearPageTheme', BasementThemeKey);
	}
}
