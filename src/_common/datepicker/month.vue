<template>
	<table class="datepicker-table">
		<thead>
			<tr>
				<th>
					<button
						type="button"
						class="datepicker-btn datepicker-btn-default pull-left"
						@click="move(-1)"
						style="width: 100%"
					>
						<app-jolticon icon="chevron-left" />
					</button>
				</th>
				<th>
					<button
						type="button"
						class="datepicker-btn datepicker-btn-default"
						@click="parent.toggleMode()"
						style="width: 100%;"
					>
						<strong>{{ title }}</strong>
					</button>
				</th>
				<th>
					<button
						type="button"
						class="datepicker-btn datepicker-btn-default pull-right"
						@click="move(1)"
						style="width: 100%"
					>
						<app-jolticon icon="chevron-right" />
					</button>
				</th>
			</tr>
		</thead>
		<tbody>
			<tr v-for="row of rows">
				<td v-for="dt of row" :key="dt.date.getTime()" class="text-center">
					<button
						type="button"
						style="width: 100%;"
						class="datepicker-btn datepicker-btn-default"
						:class="{
							'datepicker-btn-info': dt.isSelected,
							active: dt.isToday,
						}"
						@click="select(dt.date)"
						:disabled="dt.isDisabled"
					>
						<span :class="{ 'text-info': dt.isToday }">{{ dt.label }}</span>
					</button>
				</td>
			</tr>
		</tbody>
	</table>
</template>

<script lang="ts" src="./month"></script>
