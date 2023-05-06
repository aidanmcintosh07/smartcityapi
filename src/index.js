const apiKey = "vnvvknvav";

addEventListener("fetch", (event) => {
	event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
	const url = new URL(request.url);
	const endpoint = url.pathname.split("/")[1];

	if (endpoint === "cities") {
		const city = url.searchParams.get("city");

		if (!city) {
			return new Response("Please provide a city", { status: 400 });
		}

		const prompt = `What is the weather, traffic flow, and air quality in ${city} right now?`;
		const cityData = await fetchCityData(prompt, apiKey);

		const cityText = cityData.city;

		const responseData = {
			weather: cityData.weather,
			traffic: cityData.traffic,
			airQuality: cityData.airQuality,
		};

		return new Response(JSON.stringify(responseData), {
			headers: { "Content-Type": "application/json" },
		});
	}

	return new Response("Invalid endpoint", { status: 404 });
}

async function fetchCityData(prompt, apiKey) {
	const response = await fetch("https://api.openai.com/v1/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`,
		},
		body: JSON.stringify({
			prompt: prompt,
			max_token: 1024,
			temperature: 0.5,
			model: "text-davinci-002",
			n: 1,
			stop: null,
		}),
	});

	const data = await response.json();

	if (!data.choices || !data.choices[0] || !data.choices[0].text) {
		throw new Error("Unable to generate city information");
	}

	return {
		city: data.choices[0].text.trim(),
	};
}
