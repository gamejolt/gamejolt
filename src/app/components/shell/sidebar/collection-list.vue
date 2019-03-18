<template>
	<ul class="shell-nav">
		<li
			class="offline-disable"
			v-for="collection of filtered"
			:key="collection._id"
			v-show="!filter || filterComparator(collection)"
		>
			<router-link
				:to="collection.routeLocation"
				active-class="active"
				:title="collection.getTitle()"
				v-app-track-event="`sidebar:collection:playlist`"
			>
				<span class="shell-nav-icon">
					<app-jolticon icon="playlist" />
				</span>

				<span class="shell-nav-label" v-if="collection.type === 'developer'">
					@{{ collection.owner.username }}
				</span>

				<span class="shell-nav-label" v-else>
					{{ collection.name }}

					<small v-if="collection.from_subscription && collection.owner">
						<translate>library.by</translate>
						@{{ collection.owner.username }}
					</small>
				</span>
			</router-link>
		</li>
	</ul>
</template>

<script lang="ts" src="./collection-list" />
