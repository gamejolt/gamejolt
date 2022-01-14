<script lang="ts">
import { Options } from 'vue-property-decorator';
import { BaseRouteComponent } from '../../../../../../../_common/route/route-component';
import { RouteStore, RouteStoreModule } from '../../manage.store';

@Options({
	name: 'RouteDashGamesManageGameWizardFinish',
})
export default class RouteDashGamesManageGameWizardFinish extends BaseRouteComponent {
	@RouteStoreModule.State
	canPublish!: RouteStore['canPublish'];

	@RouteStoreModule.Action
	publish!: RouteStore['publish'];

	@RouteStoreModule.Action
	saveDraft!: RouteStore['saveDraft'];

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
					<translate>
						Your game is ready to be published to the site! If you're not ready yet, you can always
						save it for later.
					</translate>
				</div>
				<div v-else>
					<translate>
						You still have some information to fill out before we can publish it to the site. You
						can always save it for later and come back to it, though!
					</translate>
				</div>

				<div class="alert-actions">
					<app-button primary :disabled="!canPublish" @click="publish()">
						<translate>Publish</translate>
					</app-button>

					<app-button trans @click="saveDraft()">
						<translate>Save Draft</translate>
					</app-button>
				</div>
			</div>
		</div>
	</div>
</template>
