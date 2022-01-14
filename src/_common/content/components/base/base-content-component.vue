<script lang="ts">
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { AppTooltip } from '../../../tooltip/tooltip-directive';

@Options({
	directives: {
		AppTooltip,
	},
})
export default class AppBaseContentComponent extends Vue {
	@Prop(Boolean) isEditing!: boolean;
	@Prop(Boolean) showEdit!: boolean;
	@Prop(Boolean) isDisabled!: boolean;

	readonly GJ_IS_MOBILE_APP = GJ_IS_MOBILE_APP;

	@Emit('removed')
	emitRemoved() {}

	@Emit('edit')
	emitEdit() {}

	onRemovedClicked() {
		if (!this.isDisabled) {
			this.emitRemoved();
		}
	}

	onEditClicked() {
		if (!this.isDisabled) {
			this.emitEdit();
		}
	}
}
</script>

<template>
	<div class="base-content-component">
		<div v-if="isEditing" class="-controls theme-dark">
			<app-button
				v-if="!GJ_IS_MOBILE_APP && showEdit"
				circle
				overlay
				icon="edit"
				:disabled="isDisabled"
				@click="onEditClicked"
			/>
			<app-button
				circle
				overlay
				icon="remove"
				:disabled="isDisabled"
				@click="onRemovedClicked"
			/>
		</div>

		<slot />
	</div>
</template>

<style lang="stylus" scoped>
.base-content-component
	position: relative
	white-space: normal

	.-controls
		z-index: 10
		position: absolute
		top: 4px
		right: 4px
</style>
