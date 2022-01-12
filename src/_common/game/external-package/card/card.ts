import { Options, Prop, Vue } from 'vue-property-decorator';
import { Analytics } from '../../../analytics/analytics.service';
import AppCard from '../../../card/card.vue';
import AppFadeCollapse from '../../../fade-collapse/fade-collapse.vue';
import { Navigate } from '../../../navigate/navigate.service';
import { AppTooltip } from '../../../tooltip/tooltip-directive';
import { GameBuild } from '../../build/build.model';
import { GameExternalPackage } from '../external-package.model';

@Options({
	components: {
		AppCard,
		AppFadeCollapse,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppGameExternalPackageCard extends Vue {
	@Prop(Object)
	package!: GameExternalPackage;

	showFullDescription = false;
	canToggleDescription = false;

	readonly GameBuild = GameBuild;

	get platforms() {
		const platforms = [];
		for (let prop in this.package) {
			if (!(this.package as any)[prop]) {
				continue;
			}

			for (let prefix of ['os_', 'type_']) {
				if (!prop.startsWith(prefix)) {
					continue;
				}

				const field = prop.substr(prefix.length);
				if (field in GameBuild.platformSupportInfo) {
					platforms.push(field);
				}
			}
		}
		return platforms;
	}

	gotoExternal() {
		Analytics.trackEvent('game-package-card', 'download', 'external');

		Navigate.newWindow(this.package.url);
	}
}
