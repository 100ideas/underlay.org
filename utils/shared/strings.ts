import { remove as removeDiacritics } from "diacritics";

export const slugifyString = (input: string) => {
	if (typeof input !== "string") {
		console.error("input is not a valid string");
		return "";
	}

	return removeDiacritics(input)
		.replace(/ /g, "-")
		.replace(/[^a-zA-Z0-9-]/gi, "")
		.toLowerCase();
};

export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export const toTitleCase = (str: string) =>
	str.replace(
		/\w\S*/g,
		(txt: string) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
	);

const strConcat = (...strings: string[]) => strings.reduce((acc, str) => acc + str, "");

export const joinOxford = (
	items: string[],
	{ joiner = strConcat, empty = "", ampersand = false } = {}
) => {
	const twoAnd = ampersand ? " & " : " and ";
	const manyAnd = ampersand ? " & " : ", and ";
	if (items.length === 0) {
		return empty;
	}
	return items.reduce((acc: string, item: string, index: number) =>
		joiner(acc, items.length === 2 ? twoAnd : index === items.length - 1 ? manyAnd : ", ", item)
	);
};

export const btoaUniversal = (input: string) => {
	try {
		return btoa(input);
	} catch (err) {
		return Buffer.from(input).toString("base64");
	}
};
