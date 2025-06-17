const PERSON = 0; const WORLD  = 1; const OBJECT = 2; const ACTION = 3; const NATURE = 4; const RANDOM = 5;
/**
 * Shuffle an array pseudo-randomly
 * @param {Array} arr The array to be sorted.
 * @returns {Array} An array containing all the elements of `arr`, in a random order.
 */
export function shuffle_array(arr){
    let newArr = [];
    let index;
    while (arr.length !== 0) {
        index = Math.floor(Math.random() * arr.length);
        newArr.push(arr[index]);
        arr.splice(index, 1);
    }
    return newArr;
}

/**
 * Generate an array filled with a specified value
 * @param {int} len Desired length of the returned array.
 * @param {any} value The value to be put in all entries of the returned array.
 * @returns {Array} An array filled with `len` copies of `value`
 */
export function generate_array(len, value){
    let arr = [];
    for (let i =0;i<len;i++){arr.push(value);}
    return arr;
}

/**
 *
 * @param {string} url The url passed to `fetch()` whose text will replace the current pages html.
 * @returns {Promise<void>}
 */
export async function set_innerHTML(url){
    let file = await fetch(url);
    document.body.innerHTML = await file.text();
}

export function get_category_enum(cat){
    switch (cat){
        case "person":
            return PERSON;
        case "world":
            return WORLD;
        case "object":
            return OBJECT;
        case "action":
            return ACTION;
        case "nature":
            return NATURE;
        case "random":
            return RANDOM;
        default: return new Error("Invalid category");
    }
}