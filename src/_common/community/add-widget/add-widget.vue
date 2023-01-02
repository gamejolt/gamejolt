<script lang="ts">
import { setup } from 'vue-class-component';
import { Options, Prop, Vue } from 'vue-property-decorator';
import { vAppAuthRequired } from '../../auth/auth-required-directive';
import { showErrorGrowl } from '../../growls/growls.service';
import { useCommonStore } from '../../store/common-store';
import { TooltipPlacement } from '../../tooltip/tooltip-controller';
import { vAppTooltip } from '../../tooltip/tooltip-directive';

@Options({
	directives: {
		AppTooltip: vAppTooltip,
		AppAuthRequired: vAppAuthRequired,
	},
})
export default class AppCommunityAddWidget extends Vue {
	@Prop({ type: String, default: 'bottom' })
	tooltipPlacement!: TooltipPlacement;

	commonStore = setup(() => useCommonStore());

	get user() {
		return this.commonStore.user;
	}

	get canCreate() {
		return this.user && !!this.user.can_create_communities;
	}

	get tooltip() {
		let content;
		if (this.canCreate || !this.user) {
			content = this.$gettext(`Create a community`);
		} else {
			content = this.$gettext(`You own too many communities`);
		}

		return {
			content,
			placement: this.tooltipPlacement,
		};
	}

	showGrowl() {
		if (!this.user) {
			return;
		}

		showErrorGrowl({
			message: this.$gettext(
				`You own too many communities. You must remove one before creating another.`
			),
			sticky: true,
		});
	}
}
</script>

<template>
	<router-link
		v-if="canCreate"
		v-app-tooltip="tooltip"
		class="-add"
		:to="{ name: 'dash.communities.add' }"
	>
		<AppJolticon icon="add" big />
	</router-link>
	<a
		v-else
		v-app-auth-required
		v-app-tooltip="tooltip"
		class="-add"
		:class="{ '-disabled': user }"
		@click="showGrowl"
	>
		<AppJolticon icon="add" big />
	</a>
</template>

<style lang="stylus" scoped>
.-add
	pressy()
	display: flex
	justify-content: center
	align-items: center
	border: $border-width-large dashed
	border-color: var(--theme-fg-muted)
	color: var(--theme-fg-muted)
	border-radius: 100%
	cursor: pointer
	position: absolute
	width: 100%
	height: 100%
	outline: 0

	&:not(.-disabled):hover
		border-color: var(--theme-link)
		color: var(--theme-link)

.-disabled
	unpressy()
	cursor: not-allowed

	> *
		pointer-events: none
</style>
