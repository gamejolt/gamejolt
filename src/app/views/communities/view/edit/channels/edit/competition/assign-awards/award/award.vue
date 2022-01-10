<script lang="ts" src="./award"></script>

<template>
	<div>
		<app-loading-fade :is-loading="isLoading">
			<div v-if="noAwards" class="alert">
				<p>
					<translate>No entries have been chosen for this award yet.</translate>
				</p>
			</div>
			<template v-else>
				<div v-if="awardedEntries.length > 1" class="alert">
					<p>
						<translate>
							You can sort the entries within this award to decide their order on the
							Games page.
						</translate>
					</p>
				</div>

				<div class="table-responsive">
					<table class="table">
						<colgroup>
							<col :width="draggableItems.length > 1 ? '80px' : '40px'" />
							<col />
							<col />
						</colgroup>

						<thead>
							<tr>
								<th />
								<th>
									<translate>Entry</translate>
								</th>
								<th>
									<translate>Developer</translate>
								</th>
							</tr>
						</thead>

						<draggable
							v-model="draggableItems"
							v-bind="{
								handle: '.-drag-handle',
								delay: 100,
								delayOnTouchOnly: true,
							}"
							tag="tbody"
							item-key="id"
						>
							<template #item="{ element }">
								<tr>
									<td>
										<div class="-drag-container">
											<div
												v-if="draggableItems.length > 1"
												class="-drag-handle"
											>
												<app-jolticon icon="arrows-v" />
											</div>
											<app-button
												v-app-tooltip="
													$gettext(`Remove assigned award from entry`)
												"
												icon="remove"
												sparse
												primary
												@click="onClickUnassign(element)"
											/>
										</div>
									</td>
									<th>
										<a @click="onClickShowEntry(element)">
											{{ element.resource.title }}
										</a>
										<app-jolticon
											v-if="element.is_removed"
											v-app-tooltip.touchable="
												$gettext(`This entry was hidden from the jam`)
											"
											class="text-muted"
											icon="inactive"
										/>
									</th>
									<td>
										{{ element.resource.developer.display_name }}
										<small class="text-muted">
											(@{{ element.resource.developer.username }})
										</small>
									</td>
								</tr>
							</template>
						</draggable>
					</table>
				</div>
			</template>

			<h3><translate>Choose Entries</translate></h3>
			<p class="help-block">
				<translate>Choose an entry or entries to win this award.</translate>
			</p>

			<input
				:key="$route.params.awardId"
				type="text"
				class="form-control -filter-input"
				:placeholder="$gettext(`Filter entries...`)"
				@input="onFilterInput"
			/>

			<template v-if="unassignedCount === 0">
				<div class="alert">
					<p>
						<span v-if="!!filterValue" v-translate="{ filter: filterValue }">
							No entries matched your filter of <code>"%{ filter }"</code>.
						</span>
						<span v-else>
							<translate>There are no more entries without this award.</translate>
						</span>
					</p>
				</div>
			</template>

			<template v-else-if="entries.length > 0">
				<div class="table-responsive">
					<table class="table">
						<colgroup>
							<col width="40px" />
							<col />
							<col />
						</colgroup>

						<thead>
							<tr>
								<th />
								<th>
									<translate>Entry</translate>
								</th>
								<th>
									<translate>Developer</translate>
								</th>
							</tr>
						</thead>

						<tbody>
							<tr v-for="entry of entries" :key="entry.id">
								<td>
									<app-button
										v-app-tooltip="$gettext(`Assign award to entry`)"
										icon="add"
										sparse
										primary
										@click="onClickAssign(entry)"
									/>
								</td>
								<th>
									<a @click="onClickShowEntry(entry)">
										{{ entry.resource.title }}
									</a>
									<app-jolticon
										v-if="entry.is_removed"
										v-app-tooltip.touchable="
											$gettext(`This entry was hidden from the jam`)
										"
										class="text-muted"
										icon="inactive"
									/>
								</th>
								<td>
									{{ entry.resource.developer.display_name }}
									<small class="text-muted">
										(@{{ entry.resource.developer.username }})
									</small>
								</td>
							</tr>
						</tbody>
					</table>
				</div>

				<app-pagination
					:total-items="unassignedCount"
					:current-page="page"
					:items-per-page="perPage"
					prevent-url-change
					@pagechange="onPageChanged"
				/>
			</template>

			<!-- Probably on a too high page -->
			<template v-else>
				<h4>
					<translate>Whoops! There are no entries back here...</translate>
				</h4>
				<app-button icon="reply" @click="onPageChanged(1)">
					<translate>Go back</translate>
				</app-button>
			</template>
		</app-loading-fade>
	</div>
</template>

<style lang="stylus" scoped>
.-filter-input
	margin-bottom: 16px

.-drag-container
	display: flex
	position: relative
	height: 35px

.-drag-handle
	change-bg('gray')
	position: relative
	display: inline-block
	width: 20px
	cursor: move
	user-select: none
	margin-right: 8px
	rounded-corners()

	> .jolticon
		position: absolute
		top: 50%
		left: 0
		margin-top: -8px
		cursor: inherit
		color: $white
</style>
