<script lang="ts">
import { Options } from 'vue-property-decorator';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../../../_common/route/legacy-route-component';

@Options({
	name: 'RouteCommunitiesViewEditChannels',
	components: {},
})
@OptionsForLegacyRoute()
export default class RouteCommunitiesViewEditChannels extends LegacyRouteComponent {}
</script>

<template>
	<router-view />
</template>

<style lang="stylus" scoped></style>
