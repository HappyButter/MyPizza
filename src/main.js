const currentHeatBedTemp = document.getElementById("current-heat-bed-temp-value");
const currentAmbientTemp = document.getElementById("current-ambient-temp-value");
const expectedTemp = document.getElementById("expected-temp-value");
const submitTempBtn = document.getElementById("submit-temp-btn");
const machineSwitchBtn = document.getElementById("machine-switch-btn");
const inputTemp = document.getElementById("input-temp");

const url = "http://192.168.137.167:4444/temperature";

let isMachineOn = false;

getMachineExpectedTemp(expectedTemp, url);

async function getMachineExpectedTemp(elem, url) {
	try {
		const response = await fetch(url).then((response) => response.json());

		if (parseInt(response.B_set) === 0) {
			if (machineSwitchBtn.checked) machineSwitchBtn?.click();
			isMachineOn = false;
		}

		elem.innerText = response.B_set + " \u2103";
	} catch (err) {
		console.log(err);
	}
}

function startShowingCurrentTemperature(elemB, elemT, url, intervalValue) {
	setInterval(async () => {
		try {
			const response = await fetch(url).then((response) => response.json());
			if (parseInt(response.B_set) === 0 && machineSwitchBtn.checked) {
				machineSwitchBtn?.click();
			}
			elemB.innerText = response.B + " \u2103";
			elemT.innerText = response.T + " \u2103";
		} catch (err) {
			console.log(err);
		}
	}, intervalValue);
}

async function setExpectedTempValue(elem, url, expectedTemp) {
	try {
		const reqBody = JSON.stringify({ B: expectedTemp });

		const res = await fetch(url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: reqBody,
		}).then((response) => response.json());

		elem.innerText = res.B_set + " \u2103";
	} catch (err) {
		alert(err);
	}
}

const turnOffMachine = async (url) => {
	try {
		await fetch(url, {
			method: "DELETE",
		}).then((response) => response.json());
	} catch (err) {
		alert(err);
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
		!isMachineOn
			? setExpectedTempValue(elem, url, expectedTemp)
			: (elem.innerText = expectedTemp + " \u2103");
	} else {
		alert("Weźże dobrą tempereature dej!");
	}
};

const handlePowerBtn = () => {
	isMachineOn = !machineSwitchBtn?.checked;
	switchMachine(expectedTemp, url, expectedTemp?.innerText);
};

// button handling
submitTempBtn?.addEventListener("click", () => handleSubmitBtn(expectedTemp, url, inputTemp.value));
machineSwitchBtn?.addEventListener("click", handlePowerBtn);

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
