<script lang="ts" src="./selector"></script>

<template>
	<div class="list-group">
		<app-popper popover-class="fill-bg" block track-trigger-width hide-on-state-change>
			<a class="list-group-item has-addon">
				<div class="list-group-item-addon">
					<app-jolticon icon="chevron-down" />
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
							<app-jolticon v-if="current && current.id === item.id" icon="check" />
						</div>

						<slot :item="item" />
					</a>
				</div>
			</template>
		</app-popper>
	</div>
</template>
