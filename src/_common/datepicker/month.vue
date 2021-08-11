<script lang="ts" src="./month"></script>

<template>
	<table class="datepicker-table">
		<thead>
			<tr>
				<th>
					<button
						type="button"
						class="datepicker-btn datepicker-btn-default pull-left"
						style="width: 100%"
						@click="move(-1)"
					>
						<app-jolticon icon="chevron-left" />
					</button>
				</th>
				<th>
					<button
						type="button"
						class="datepicker-btn datepicker-btn-default"
						style="width: 100%"
						@click="parent.toggleMode()"
					>
						<strong>{{ title }}</strong>
					</button>
				</th>
				<th>
					<button
						type="button"
						class="datepicker-btn datepicker-btn-default pull-right"
						style="width: 100%"
						@click="move(1)"
					>
						<app-jolticon icon="chevron-right" />
					</button>
				</th>
			</tr>
		</thead>
		<tbody>
			<tr v-for="(row, i) of rows" :key="i">
				<td v-for="dt of row" :key="dt.date.getTime()" class="text-center">
					<button
						type="button"
						style="width: 100%"
						class="datepicker-btn datepicker-btn-default"
						:class="{
							'datepicker-btn-info': dt.isSelected,
							active: dt.isToday,
						}"
						:disabled="dt.isDisabled"
						@click="select(dt.date)"
					>
						<span :class="{ 'text-info': dt.isToday }">{{ dt.label }}</span>
					</button>
				</td>
			</tr>
		</tbody>
	</table>
</template>
