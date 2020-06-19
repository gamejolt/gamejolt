<template>
	<div class="list-group">
		<app-popper popover-class="fill-bg" block track-trigger-width hide-on-state-change>
			<a class="list-group-item has-addon">
				<div class="list-group-item-addon">
					<app-jolticon icon="chevron-down" />
				</div>

				<slot :item="current" />
			</a>

			<div slot="popover">
				<div class="list-group">
					<a
						class="list-group-item has-addon"
						v-for="item of items"
						:key="item.id"
						@click="select(item)"
					>
						<div class="list-group-item-addon">
							<app-jolticon icon="check" v-if="current && current.id === item.id" />
						</div>

						<slot :item="item" />
					</a>
				</div>
			</div>
		</app-popper>
	</div>
</template>

<script lang="ts" src="./selector"></script>
