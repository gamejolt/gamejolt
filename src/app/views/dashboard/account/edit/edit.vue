<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { showSuccessGrowl } from '../../../../../_common/growls/growls.service';
import { BaseRouteComponent, OptionsForRoute } from '../../../../../_common/route/route-component';
import { Scroll } from '../../../../../_common/scroll/scroll.service';
import { useCommonStore } from '../../../../../_common/store/common-store';
import { $gettext } from '../../../../../_common/translate/translate.service';
import FormProfile from '../../../../components/forms/profile/FormProfile.vue';
import { useAccountRouteController } from '../account.vue';

@Options({
	name: 'RouteDashAccountEdit',
	components: {
		FormProfile,
	},
})
@OptionsForRoute()
export default class RouteDashAccountEdit extends BaseRouteComponent {
	routeStore = setup(() => useAccountRouteController()!);
	commonStore = setup(() => useCommonStore());

	get app() {
		return this.commonStore;
	}

	get routeTitle() {
		return this.routeStore.heading;
	}

	routeCreated() {
		this.routeStore.heading = $gettext(`Edit Your Profile`);
	}

	onProfileSaved() {
		showSuccessGrowl(this.$gettext(`Your profile has been updated. Right on!`));
		Scroll.to(0);
	}
}
</script>

<template>
	<div class="row">
		<div class="col-md-9 col-lg-8">
			<FormProfile :user="app.user" @submit="onProfileSaved" />
		</div>
	</div>
</template>
