export function binarySearch(sortedArray, key, searchTerm){
    let start = 0;
    let end = sortedArray.length - 1;

    while (start <= end) {
        let middle = Math.floor((start + end) / 2);

        if (sortedArray[middle][key] === searchTerm) {
            return sortedArray[middle];
        } else if (sortedArray[middle][key] < searchTerm) {
            start = middle + 1;
        } else {
            end = middle - 1;
        }
    }
    // key wasn't found
    return null;
}