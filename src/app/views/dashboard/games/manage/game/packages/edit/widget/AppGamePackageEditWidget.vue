<script lang="ts">
import { ref, watch } from 'vue';

import { Api } from '~common/api/api.service';
import { Environment } from '~common/environment/environment.service';
import { createAppRoute, defineAppRouteOptions } from '~common/route/route-component';
import { getScreen } from '~common/screen/screen-service';
import { SellableModel } from '~common/sellable/sellable.model';
import AppTranslate from '~common/translate/AppTranslate.vue';

export default {
	name: 'RouteDashGamesManageGamePackagesEditWidget',
	...defineAppRouteOptions({
		reloadOn: 'never',
		resolver: ({ route }) =>
			Api.sendRequest(
				'/web/dash/developer/games/packages/preview/' +
					route.params.id +
					'/' +
					route.params.packageId
			),
	}),
};
</script>

<script lang="ts" setup>
const sellable = ref<SellableModel | null>(null);
const theme = ref<string>(null as any);
const widgetUrl = ref('');
const widgetCode = ref('');

watch(theme, () => {
	if (!sellable.value) {
		return;
	}

	widgetUrl.value = Environment.widgetHost + '/package/v1?key=' + sellable.value.key;
	if (theme.value === 'light') {
		widgetUrl.value += '&theme=light';
	}

	widgetCode.value =
		'<iframe src="' + widgetUrl.value + '" frameborder="0" width="500" height="245"></iframe>';
});

createAppRoute({
	onResolved({ payload }) {
		sellable.value = payload.sellable ? new SellableModel(payload.sellable) : null;
		theme.value = ''; // Default to dark.
	},
});
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
			<h3 :class="{ 'section-header': getScreen().isDesktop.value }">
				<AppTranslate>Widget Preview</AppTranslate>
			</h3>

			<div class="full-bleed-xs">
				<iframe :src="widgetUrl" frameborder="0" style="width: 100%" height="245" />
			</div>
		</div>
	</div>
</template>
