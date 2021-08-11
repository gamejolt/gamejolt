<script lang="ts" src="./day"></script>

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
				<th colspan="5">
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
			<tr>
				<th v-for="label of labels" :key="label.abbr" class="text-center">
					<small>{{ label.abbr }}</small>
				</th>
			</tr>
		</thead>
		<tbody>
			<tr v-for="(row, i) of rows" :key="i">
				<td v-for="(dt, n) of row" :key="n" class="text-center">
					<a
						style="width: 100%"
						class="datepicker-btn datepicker-btn-default"
						:class="{
							'datepicker-btn-info': dt.isSelected,
							active: dt.isToday,
						}"
						:disabled="dt.isDisabled"
						@click="select(dt.date)"
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
