<script lang="ts">
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import AppPopper from '../../popper/AppPopper.vue';

@Options({
	components: {
		AppPopper,
	},
})
export default class AppListGroupSelector extends Vue {
	@Prop() current?: any;
	@Prop({ type: Array, default: () => [] }) items!: any[];

	@Emit('change')
	emitChange(_item: any) {}

	select(item: any) {
		this.emitChange(item);
	}
}
</script>

<template>
	<div class="list-group">
		<AppPopper popover-class="fill-bg" block track-trigger-width hide-on-state-change>
			<a class="list-group-item has-addon">
				<div class="list-group-item-addon">
					<AppJolticon icon="chevron-down" />
				</div>

				<slot :item="current" />
			</a>

			<template #popover>
				<div class="list-group">
					<a
						v-for="item of items"
						:key="item.id"
						class="list-group-item has-addon"
						@click="select(item)"
					>
						<div class="list-group-item-addon">
							<AppJolticon v-if="current && current.id === item.id" icon="check" />
						</div>

						<slot :item="item" />
					</a>
				</div>
			</template>
		</AppPopper>
	</div>
</template>
