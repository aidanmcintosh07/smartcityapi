import { apiKey } from "./config";

addEventListener("fetch", (event) => {
	event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
	const url = new URL(request.url);
	const endpoint = url.pathname;
	const queryParams = url.searchParams;

	if (endpoint === "/api/cities") {
		const city = queryParams.get("city");

		if (!city) {
			return new Response(JSON.stringify({ error: "Please provide a city" }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}

		const prompt = `What is the weather, traffic flow, air quality and temperature in ${city} right now?`;
		const cityData = await fetchCityData(prompt, apiKey);

		if (!cityData) {
			return new Response(
				JSON.stringify({ error: "Unable to generate city information" }),
				{ status: 500, headers: { "Content-Type": "application/json" } }
			);
		}

		const responseData = {
			city: city,
			weather: cityData.weather,
			traffic: cityData.traffic,
			airQuality: cityData.airQuality,
			temperature: cityData.temperature,
		};

		return new Response(JSON.stringify(responseData), {
			headers: { "Content-Type": "application/json" },
		});
	}

	return new Response(JSON.stringify({ error: "Invalid endpoint" }), {
		status: 404,
		headers: { "Content-Type": "application/json" },
	});
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
			max_tokens: 1024,
			temperature: 0.5,
			model: "text-davinci-002",
			n: 1,
			stop: null,
		}),
	});

	const data = await response.json();
	console.log("data", data);

	if (!data.choices || !data.choices[0] || !data.choices[0].text) {
		throw new Error("Unable to generate city information");
	}

	const regex =
		/The weather is (.+), the traffic flow is (.+), the air quality is (.+), and the temperature is (.+)\./i;
	const matches = data.choices[0].text.match(regex);

	if (!matches || matches.length !== 5) {
		throw new Error("Unable to extract city information");
	}

	return {
		weather: matches[1].trim(),
		traffic: matches[2].trim(),
		airQuality: matches[3].trim(),
		temperature: matches[4].trim(),
	};
}
