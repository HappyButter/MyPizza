const currentHeatBedTemp = document.getElementById("current-heat-bed-temp-value");
const currentAmbientTemp = document.getElementById("current-ambient-temp-value");
const expectedTemp = document.getElementById("expected-temp-value");
const submitTempBtn = document.getElementById("submit-temp-btn");
const machineSwitchBtn = document.getElementById("machine-switch-btn");
const retryConnectionBtn = document.getElementById("retry-connection-btn");
const inputTemp = document.getElementById("input-temp");

const url = "http://192.168.137.167:4444/temperature";

let isMachineOn = false;
let intervalFetchData = null;

getMachineExpectedTemp(expectedTemp, url);

async function getMachineExpectedTemp(elem, url) {
	try {
		const response = await fetch(url).then((response) => response.json());

		if (parseInt(response.B_set) === 0) {
			if (machineSwitchBtn.checked) machineSwitchBtn?.click();
			isMachineOn = false;
		} else {
			if (!machineSwitchBtn.checked) machineSwitchBtn?.click();
			isMachineOn = true;
		}

		elem.innerText = response.B_set + " \u2103";
	} catch (err) {
		console.log(err);
	}
}

function startShowingCurrentTemperature(elemB, elemT, url, intervalValue) {
	if (intervalFetchData) return;
	let numberOfFailure = 0;

	intervalFetchData = setInterval(async () => {
		if (numberOfFailure === 5) {
			clearInterval(intervalFetchData);
			intervalFetchData = null;
			alert("went wrong... went very wrong...");

			retryConnectionBtn?.classList.remove("hidden");
			homeContent?.classList.add("hidden");
			historicalDataContent?.classList.add("hidden");
		}

		try {
			const response = await fetch(url).then((response) => response.json());
			if (parseInt(response.B_set) === 0 && machineSwitchBtn.checked) {
				machineSwitchBtn?.click();
			}
			elemB.innerText = response.B + " \u2103";
			elemT.innerText = response.T + " \u2103";
		} catch (err) {
			numberOfFailure++;
		}
	}, intervalValue);
}

async function setExpectedTempValue(elem, url, expectedTemp) {
	try {
		const reqBody = JSON.stringify({ B_set: parseInt(expectedTemp) });

		const res = await fetch(url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: reqBody,
		}).then((response) => response.json());

		if (parseInt(res.B_set) !== 0) {
			if (!machineSwitchBtn.checked) machineSwitchBtn?.click();
			isMachineOn = true;
		}

		elem.innerText = res.B_set + " \u2103";
	} catch (err) {
		console.log(err);
	}
}

const turnOffMachine = async (url) => {
	try {
		const res = await fetch(url, {
			method: "DELETE",
		}).then((response) => response.json());

		if (res) isMachineOn = false;
	} catch (err) {
		console.log(err);
	}
};

const switchMachine = async (elem, url, expectedTemp) => {
	isMachineOn ? turnOffMachine(url) : setExpectedTempValue(elem, url, expectedTemp);
};

function isTempValid(temp) {
	const parsedTemp = parseInt(temp);
	return parsedTemp <= 100 && parsedTemp >= 1;
}

const handleSubmitBtn = (elem, url, expectedTemp) => {
	if (isTempValid(expectedTemp)) {
		console.log(isMachineOn);
		isMachineOn
			? setExpectedTempValue(elem, url, expectedTemp)
			: (elem.innerText = expectedTemp + " \u2103");
	} else {
		alert("We????e dobr?? tempereature dej!");
	}
};

// button handling
submitTempBtn?.addEventListener("click", () => handleSubmitBtn(expectedTemp, url, inputTemp.value));
machineSwitchBtn?.addEventListener("click", () =>
	switchMachine(expectedTemp, url, expectedTemp?.innerText)
);

retryConnectionBtn?.addEventListener("click", () => {
	startShowingCurrentTemperature(currentHeatBedTemp, currentAmbientTemp, url, 1500);
	retryConnectionBtn.classList.add("hidden");
	homeContent?.classList.remove("hidden");
	historicalDataContent?.classList.add("hidden");
});

// nav handling
const homeNavBtn = document.getElementById("home");
const homeContent = document.getElementById("home-content");
const historicalDataNavBtn = document.getElementById("historical-data");
const historicalDataContent = document.getElementById("historical-data-content");

homeNavBtn?.addEventListener("click", () => {
	homeContent?.classList.remove("hidden");
	historicalDataContent?.classList.add("hidden");
});

historicalDataNavBtn?.addEventListener("click", () => {
	historicalDataContent?.classList.remove("hidden");
	homeContent?.classList.add("hidden");
});

startShowingCurrentTemperature(currentHeatBedTemp, currentAmbientTemp, url, 1500);
