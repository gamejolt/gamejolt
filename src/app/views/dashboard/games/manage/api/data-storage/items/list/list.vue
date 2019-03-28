<template>
	<div>
		<h2 class="section-header">
			<translate>dash.games.data_store.items.heading</translate>
		</h2>

		<div class="page-help">
			<p v-translate>
				You can use the API to store data...
				<em>in the cloud!</em>
				All stored data items will show up here.
			</p>
			<p>
				<translate>
					Currently, you can only view (and remove) globally stored data items. Stored user data
					items are not viewable at this time.
				</translate>
			</p>
			<p>
				<a class="link-help" href="https://help.gamejolt.com/dev-data-storage" target="_blank">
					<translate>dash.games.data_store.items.page_help_link</translate>
				</a>
			</p>
		</div>

		<div class="table-responsive">
			<table class="table table-condensed">
				<colgroup>
					<col class="col-xs-3" />
					<col class="col-xs-4" />
				</colgroup>
				<thead>
					<tr>
						<th>
							<translate>dash.games.data_store.items.key_label</translate>
						</th>
						<th>
							<translate>dash.games.data_store.items.preview_label</translate>
						</th>
						<th>
							<translate>dash.games.data_store.items.date_label</translate>
						</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="item of items" :key="item.id">
						<td class="small">
							<router-link
								class="table-primary-link"
								:to="{
									name: 'dash.games.manage.api.data-storage.items.view',
									params: { item: item.id },
								}"
							>
								<code>{{ item.key }}</code>
							</router-link>
						</td>
						<td class="small">
							{{ item.data.slice(0, 50) }}
							<template v-if="item.data.length > 50">
								...
							</template>
						</td>
						<td class="small">
							{{ item.posted_on | date('medium') }}
						</td>
						<td class="text-right">
							<div class="table-controls">
								<app-popper>
									<a class="link-muted">
										<app-jolticon icon="cog" />
									</a>

									<div slot="popover" class="list-group list-group-dark nowrap">
										<a class="list-group-item has-icon" @click="removeItem(item)">
											<app-jolticon icon="remove" notice />
											<translate>dash.games.data_store.items.remove_button</translate>
										</a>
									</div>
								</app-popper>
							</div>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</template>

<script lang="ts" src="./list" />
