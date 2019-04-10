<template>
	<div class="col-sm-8">
		<table class="table table-striped table-condensed">
			<thead>
				<tr>
					<th>
						<translate>Rating Given</translate>
					</th>
					<th class="text-right">
						<translate>Count</translate>
					</th>
					<th style="width: 150px"></th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="i of [1, 0]">
					<td v-if="i === 1">
						<translate>Like</translate>
					</td>
					<td v-else>
						<translate>Dislike</translate>
					</td>
					<td class="text-right">
						{{ reportData.data[i] || 0 | number }}
					</td>
					<td>
						<div
							class="report-percentage"
							:style="{ width: ((reportData.data[i] || 0) / reportData.total) * 70 + 'px' }"
						></div>
						<small>
							{{
								reportData.data[i] / reportData.total ||
									0 | number({ style: 'percent', maximumFractionDigits: 2 })
							}}
						</small>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<style lang="stylus" src="./report-percentage.styl" scoped></style>

<script lang="ts" src="./rating-breakdown"></script>
