<template>
	<div class="scoreboard-selector">
		<div class="list-group">
			<!--
			When more than one, you can click to change.
		-->
			<template v-if="tables.length > 1">
				<app-popper block track-trigger-width>
					<a class="list-group-item has-addon">
						<div class="list-group-item-addon">
							<app-jolticon icon="chevron-down" />
						</div>

						<h5 class="list-group-item-heading sans-margin-bottom">
							<strong>{{ currentTable.name }}</strong>
						</h5>
						<p class="list-group-item-text">
							{{ currentTable.description }}
						</p>
					</a>

					<div slot="popover">
						<div class="popper-heading">
							<strong>
								<translate>scores.scoreboard_popover.heading</translate>
							</strong>
						</div>

						<div class="list-group">
							<a
								class="list-group-item has-icon"
								v-for="table of tables"
								:key="table.id"
								@click="selectTable(table)"
							>
								<h5 class="list-group-item-heading sans-margin-bottom">
									<app-jolticon icon="check" v-if="table.id === currentTable.id" />
									<strong>{{ table.name }}</strong>
								</h5>

								<div class="list-group-item-text">{{ table.description }}</div>
							</a>
						</div>
					</div>
				</app-popper>
			</template>
			<!--
			When only one, it's not clickable.
		-->
			<div class="list-group-item" v-else>
				<h5 class="list-group-item-heading sans-margin-bottom">
					<strong>{{ currentTable.name }}</strong>
				</h5>
				<p class="list-group-item-text">
					{{ currentTable.description }}
				</p>
			</div>
		</div>
	</div>
</template>

<script lang="ts" src="./scoreboard-selector" />
