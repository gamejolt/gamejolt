export class Graph {
	static createGraphData(data: any[]): any {
		let graphData: any = {};
		graphData.graph = [];
		graphData.tableData = [];
		graphData.tableTotals = {};
		graphData.colTotals = {};

		for (const row of data) {
			if (!row.time) {
				for (const k in row) {
					if (k === 'time') {
						continue;
					}

					graphData.graph.push({
						label: k,
						data: [],
					});

					graphData.tableTotals[k] = row[k];
					graphData.colTotals[k] = 0;
				}

				continue;
			}

			let tableData: any = {
				time: row.time * 1000,
			};

			let i = 0;
			for (const k in row) {
				if (k === 'time') {
					continue;
				}

				tableData[k] = row[k];

				graphData.graph[i].data.push([row.time * 1000, parseInt(row[k], 10)]);

				graphData.colTotals[k] += parseInt(row[k], 10);

				++i;
			}

			graphData.tableData.push(tableData);
		}

		return graphData;
	}
}
