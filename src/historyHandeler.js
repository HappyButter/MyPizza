import Chart from "chart.js/auto";

const getHitoricalDataBtn = document.getElementById("get-historical-data-btn");
const saveToFileBtn = document.getElementById("save-to-file-btn");
const dateFrom = document.getElementById("datetime-from");
const dateTo = document.getElementById("datetime-to");

let ctx = document.getElementById("historical-chart");

let historicalDataChart = null;
let historicalData = null;

const getDataURL = "http://192.168.137.167:4444/history";

const getHistoricalData = async (e) => {
	e.preventDefault();
	if (historicalDataChart) historicalDataChart.destroy();

	try {
		const queryParams = {};
		if (dateFrom?.value) queryParams["from"] = dateFrom.value.replace("T", "/");
		if (dateTo?.value) queryParams["to"] = dateTo.value.replace("T", "/");

		const parsedURL = createURLWithQueryParams(getDataURL, queryParams);

		historicalData = await fetch(parsedURL).then((response) => response.json());
		if (!historicalData) return;

		saveToFileBtn?.classList.remove("hidden");

		historicalDataChart = new Chart(ctx, {
			type: "line",
			data: parseData(historicalData),
		});
	} catch (e) {
		console.log(e);
	}
};

function parseData(data) {
	const parsedData = data.reduce(
		(previousParsedData, step) => {
			const stepTime = step.Time.replace("/", " ");
			return {
				...previousParsedData,
				timeStamps: [...previousParsedData.timeStamps, stepTime],
				heatBedTemps: [...previousParsedData.heatBedTemps, step.B],
				expectedHeatBedTemps: [...previousParsedData.expectedHeatBedTemps, step.B_set],
				ambientTemps: [...previousParsedData.ambientTemps, step.T],
			};
		},
		{ timeStamps: [], heatBedTemps: [], expectedHeatBedTemps: [], ambientTemps: [] }
	);

	return {
		labels: parsedData.timeStamps,
		datasets: [
			{
				data: parsedData.heatBedTemps,
				label: "heat bed temps",
				borderColor: "#3e95cd",
			},
			{
				data: parsedData.expectedHeatBedTemps,
				label: "expected heat bed temps",
				borderColor: "#8e5ea2",
			},
			{
				data: parsedData.ambientTemps,
				label: "ambient temps",
				borderColor: "#3cba9f",
			},
		],
	};
}

function createURLWithQueryParams(url, params) {
	if (Object.keys(params).length === 0) return url;
	return url + "?" + new URLSearchParams(params);
}

function download(filename, type) {
	var file = new Blob([JSON.stringify(historicalData)], { type: type });
	if (window.navigator.msSaveOrOpenBlob)
		// IE10+
		window.navigator.msSaveOrOpenBlob(file, filename);
	else {
		// Others
		let a = document.createElement("a"),
			url = URL.createObjectURL(file);
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		setTimeout(function () {
			document.body.removeChild(a);
			window.URL.revokeObjectURL(url);
		}, 0);
	}
}

getHitoricalDataBtn?.addEventListener("click", (e) => getHistoricalData(e));

saveToFileBtn?.addEventListener("click", () => download("historicalData.txt", "text/plain"));
