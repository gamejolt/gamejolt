<script lang="ts">
import { computed } from 'vue';

import AppButton from '../../../../../../../_common/button/AppButton.vue';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../../../_common/route/route-component';
import AppTranslate from '../../../../../../../_common/translate/AppTranslate.vue';
import { $gettext } from '../../../../../../../_common/translate/translate.service';
import { useGameDashRouteController } from '../../manage.store';

export default {
	name: 'RouteDashGamesManageGameWizardFinish',
	...defineAppRouteOptions({
		reloadOn: 'always',
	}),
};
</script>

<script lang="ts" setup>
const routeStore = useGameDashRouteController()!;

const canPublish = computed(() => routeStore.canPublish);

createAppRoute({
	routeTitle: computed(() => $gettext('The End Is Not the End')),
});
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
