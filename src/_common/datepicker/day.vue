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
				<th colspan="5">
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
			<tr>
				<th v-for="label of labels" class="text-center">
					<small>{{ label.abbr }}</small>
				</th>
			</tr>
		</thead>
		<tbody>
			<tr v-for="(row, i) of rows" :key="i">
				<td v-for="(dt, n) of row" :key="n" class="text-center">
					<a
						style="width: 100%;"
						class="datepicker-btn datepicker-btn-default"
						:class="{
							'datepicker-btn-info': dt.isSelected,
							active: dt.isToday,
						}"
						@click="select(dt.date)"
						:disabled="dt.isDisabled"
					>
						<span
							:class="{
								'text-muted': dt.isOtherMonth,
								'text-info': dt.isToday,
							}"
						>
							{{ dt.label }}
						</span>
					</a>
				</td>
			</tr>
		</tbody>
	</table>
</template>

<script lang="ts" src="./day"></script>
