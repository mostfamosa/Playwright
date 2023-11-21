export function extractNumberFromString(inputString: string | null) {

    if (inputString == null)
        console.error("Cant extract the number from this string: " + inputString);
    else {
        // Use a regular expression to match decimal numbers
        const match = inputString.match(/(\d+(\.\d+)?)\s₪/);

        if (match && match[1]) {
            return parseFloat(match[1]);
        }

        // Return null if no match is found
        return null;
    }
}