<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../../../../_common/route/legacy-route-component';
import { useGameDashRouteController } from '../../manage.store';

@Options({
	name: 'RouteDashGamesManageGameWizardFinish',
})
@OptionsForLegacyRoute({
	reloadOn: 'always',
})
export default class RouteDashGamesManageGameWizardFinish extends LegacyRouteComponent {
	routeStore = setup(() => useGameDashRouteController()!);

	get canPublish() {
		return this.routeStore.canPublish;
	}

	get routeTitle() {
		return this.$gettext('The End Is Not the End');
	}
}
</script>

<template>
	<div class="row">
		<div class="col-sm-7">
			<div class="alert">
				<div v-if="canPublish">
					<AppTranslate>
						Your game is ready to be published to the site! If you're not ready yet, you
						can always save it for later.
					</AppTranslate>
				</div>
				<div v-else>
					<AppTranslate>
						You still have some information to fill out before we can publish it to the
						site. You can always save it for later and come back to it, though!
					</AppTranslate>
				</div>

				<div class="alert-actions">
					<AppButton primary :disabled="!canPublish" @click="routeStore.publish()">
						<AppTranslate>Publish</AppTranslate>
					</AppButton>

					<AppButton trans @click="routeStore.saveDraft()">
						<AppTranslate>Save Draft</AppTranslate>
					</AppButton>
				</div>
			</div>
		</div>
	</div>
</template>
