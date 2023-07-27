<script lang="ts">
import { Options, Watch } from 'vue-property-decorator';
import { Api } from '../../../../../../../../../_common/api/api.service';
import { Environment } from '../../../../../../../../../_common/environment/environment.service';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../../../../../../_common/route/legacy-route-component';
import { Screen } from '../../../../../../../../../_common/screen/screen-service';
import { Sellable } from '../../../../../../../../../_common/sellable/sellable.model';

@Options({
	name: 'RouteDashGamesManageGamePackagesEditWidget',
})
@OptionsForLegacyRoute({
	deps: {},
	resolver: ({ route }) =>
		Api.sendRequest(
			'/web/dash/developer/games/packages/preview/' +
				route.params.id +
				'/' +
				route.params.packageId
		),
})
export default class RouteDashGamesManageGamePackagesEditWidget extends LegacyRouteComponent {
	sellable: Sellable | null = null;
	theme: string = null as any;
	widgetUrl = '';
	widgetCode = '';

	readonly Screen = Screen;

	routeResolved($payload: any) {
		this.sellable = $payload.sellable ? new Sellable($payload.sellable) : null;
		this.theme = ''; // Default to dark.
	}

	@Watch('theme')
	onThemeChanged() {
		if (!this.sellable) {
			return;
		}

		this.widgetUrl = Environment.widgetHost + '/package/v1?key=' + this.sellable.key;
		if (this.theme === 'light') {
			this.widgetUrl += '&theme=light';
		}

		this.widgetCode =
			'<iframe src="' +
			this.widgetUrl +
			'" frameborder="0" width="500" height="245"></iframe>';
	}
}
</script>

<template>
	<div class="row">
		<div class="col-sm-10 col-md-5 col-lg-6">
			<div class="page-help">
				<p>
					<strong>
						<AppTranslate>
							You can use our Package Widget to embed games directly on your own site!
						</AppTranslate>
					</strong>
				</p>

				<p>
					<AppTranslate>
						For purchases made by Game Jolt members, your game will automatically appear
						in their Game Library.
					</AppTranslate>
				</p>
				<p>
					<AppTranslate>
						Purchases made by folks who aren't members or signed into Game Jolt will be
						emailed a link to a game key page; all future updates you make to your games
						will be retrievable through this same page.
					</AppTranslate>
				</p>
			</div>

			<h3>
				<AppTranslate>Configure</AppTranslate>
			</h3>

			<div class="form-horizontal">
				<div class="form-group">
					<label class="control-label col-xs-3"><AppTranslate>Theme</AppTranslate></label>
					<div class="col-xs-9">
						<div class="radio">
							<label>
								<input v-model="theme" type="radio" value="" />
								<AppTranslate>Dark</AppTranslate>
							</label>
						</div>
						<div class="radio">
							<label>
								<input v-model="theme" type="radio" value="light" />
								<AppTranslate>Light</AppTranslate>
							</label>
						</div>
					</div>
				</div>
			</div>

			<h3>
				<AppTranslate>Embed Code</AppTranslate>
			</h3>

			<textarea v-model="widgetCode" class="form-control" rows="3" readonly />
		</div>
		<div class="col-sm-10 col-md-7 col-lg-6">
			<h3 :class="{ 'section-header': Screen.isDesktop }">
				<AppTranslate>Widget Preview</AppTranslate>
			</h3>

			<div class="full-bleed-xs">
				<iframe :src="widgetUrl" frameborder="0" style="width: 100%" height="245" />
			</div>
		</div>
	</div>
</template>
