<script lang="ts">
import { Options } from 'vue-property-decorator';
import {
	BaseRouteComponent,
	OptionsForRoute,
} from '../../../../../../_common/route/route-component';

@Options({
	name: 'RouteCommunitiesViewEditChannels',
	components: {},
})
@OptionsForRoute()
export default class RouteCommunitiesViewEditChannels extends BaseRouteComponent {}
</script>

<template>
	<router-view />
</template>

<style lang="stylus" scoped></style>
