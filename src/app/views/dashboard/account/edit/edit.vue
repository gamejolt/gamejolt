<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { showSuccessGrowl } from '../../../../../_common/growls/growls.service';
import { BaseRouteComponent, RouteResolver } from '../../../../../_common/route/route-component';
import { Scroll } from '../../../../../_common/scroll/scroll.service';
import { useCommonStore } from '../../../../../_common/store/common-store';
import { Translate } from '../../../../../_common/translate/translate.service';
import FormProfile from '../../../../components/forms/profile/profile.vue';
import { RouteStore, routeStore, RouteStoreModule } from '../account.store';

@Options({
	name: 'RouteDashAccountEdit',
	components: {
		FormProfile,
	},
})
@RouteResolver({
	deps: {},
	resolver: () => Promise.resolve(),
	resolveStore() {
		routeStore.commit('setHeading', Translate.$gettext('Edit Your Profile'));
	},
})
export default class RouteDashAccountEdit extends BaseRouteComponent {
	commonStore = setup(() => useCommonStore());

	get app() {
		return this.commonStore;
	}

	@RouteStoreModule.State
	heading!: RouteStore['heading'];

	get routeTitle() {
		return this.heading;
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
			<form-profile :model="app.user" @submit="onProfileSaved" />
		</div>
	</div>
</template>
