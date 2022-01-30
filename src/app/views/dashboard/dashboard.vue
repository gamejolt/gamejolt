<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { BaseRouteComponent, OptionsForRoute } from '../../../_common/route/route-component';
import { useCommonStore } from '../../../_common/store/common-store';

@Options({
	name: 'RouteDash',
})
@OptionsForRoute()
export default class RouteDash extends BaseRouteComponent {
	commonStore = setup(() => useCommonStore());

	get app() {
		return this.commonStore;
	}
}
</script>

<template>
	<div v-if="app.user">
		<router-view />
	</div>
</template>
