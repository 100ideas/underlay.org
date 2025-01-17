import { useEffect } from "react";
import { useRouter } from "next/router";
import * as Fathom from "fathom-client";

export const useFathom = () => {
	const router = useRouter();
	useEffect(() => {
		// Initialize Fathom when the app loads
		// Example: yourdomain.com
		//  - Do not include https://
		//  - This must be an exact match of your domain.
		//  - If you're using www. for your domain, make sure you include that here.
		Fathom.load("RUDUJXLT", {
			includedDomains: ["www.underlay.org"],
			url: "https://paul-attractive.underlay.org/script.js",
		});

		function onRouteChangeComplete() {
			Fathom.trackPageview();
		}
		// Record a pageview when route changes
		router.events.on("routeChangeComplete", onRouteChangeComplete);

		// Unassign event listener
		return () => {
			router.events.off("routeChangeComplete", onRouteChangeComplete);
		};
	}, []);
};
