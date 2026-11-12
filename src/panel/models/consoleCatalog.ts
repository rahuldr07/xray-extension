/**
 * Static completion catalogue (spec §3, source 3): standard ECMAScript and Web globals,
 * their static members and the common prototype methods, with lib.d.ts parameter names.
 * Stored as compact text — one entry per line, `signature|doc|returns` — and parsed per
 * owner on first use. A `@` prefix marks a class, `#` a namespace; otherwise an entry with
 * `(` is a function (globals) or method (members) and one without is a variable/property.
 */

export type CatalogKind = 'function' | 'method' | 'property' | 'class' | 'keyword' | 'namespace' | 'variable';
export interface CatalogEntry { name: string; kind: CatalogKind; signature?: string; doc: string; returns?: string }

const GLOBALS = `#JSON|Parse and serialize JSON.
#Math|Math constants and functions.
#console|Log to the browser console.
#Reflect|Object operations as functions.
@Object(value?)|Object constructor and static helpers.
@Array(arrayLength?)|Array constructor and static helpers.
@Promise(executor)|Result of an asynchronous operation.
@Number(value?)|Number constructor and numeric constants.
@String(value?)|String constructor and static helpers.
@Boolean(value?)|Boolean constructor.
@Date(value?)|Date and time values.
@RegExp(pattern, flags?)|Regular expression constructor.
@Map(iterable?)|Keyed collection that keeps insertion order.
@Set(iterable?)|Collection of unique values.
@WeakMap(entries?)|Map with object keys that are held weakly.
@Error(message?, options?)|Error object.
@URL(url, base?)|Parsed URL.
@URLSearchParams(init?)|Query string parameters.
@Headers(init?)|HTTP headers.
@Request(input, init?)|HTTP request for fetch.
@Response(body?, init?)|HTTP response.
@FormData(form?, submitter?)|Form fields as key/value pairs.
@Blob(blobParts?, options?)|Immutable raw data.
@AbortController()|Signal to abort a fetch or other task.
@TextEncoder()|Encode strings as UTF-8 bytes.
@TextDecoder(label?, options?)|Decode bytes to a string.
@Element|Base class of every DOM element.
@Document|The DOM document class.
fetch(input, init?)|Start an HTTP request.|Promise<Response>
structuredClone(value, options?)|Deep copy of a value.
setTimeout(handler, timeout?, ...arguments)|Run a function after a delay.|number
clearTimeout(id)|Cancel a setTimeout timer.
setInterval(handler, timeout?, ...arguments)|Run a function repeatedly.|number
clearInterval(id)|Cancel a setInterval timer.
queueMicrotask(callback)|Run a function as a microtask.
requestAnimationFrame(callback)|Run a function before the next repaint.|number
atob(data)|Decode a base64 string.|string
btoa(data)|Encode a string as base64.|string
encodeURIComponent(uriComponent)|Escape a URI component.|string
decodeURIComponent(encodedURIComponent)|Unescape a URI component.|string
encodeURI(uri)|Escape a full URI.|string
decodeURI(encodedURI)|Unescape a full URI.|string
parseInt(string, radix?)|Parse an integer from a string.|number
parseFloat(string)|Parse a floating-point number from a string.|number
isNaN(number)|Whether the value converts to NaN.|boolean
isFinite(number)|Whether the value converts to a finite number.|boolean
Symbol(description?)|Create a unique symbol.
BigInt(value)|Convert a value to a BigInt.|bigint
getComputedStyle(elt, pseudoElt?)|Resolved CSS styles of an element.
alert(message?)|Show a message dialog.
confirm(message?)|Show an OK/Cancel dialog.|boolean
prompt(message?, _default?)|Ask the user for text.
window|The global object of the page.
globalThis|The global object.
self|The global object of the page.
document|The page's DOM document.|Document
location|URL of the current page.|Location
navigator|Information about the browser.|Navigator
localStorage|Storage kept across sessions for this origin.|Storage
sessionStorage|Storage kept for this tab session.|Storage
history|The tab's session history.|History
performance|Timing and performance data.|Performance
crypto|Cryptography and random values.|Crypto
NaN|Not-a-Number.|number
Infinity|Positive infinity.|number`;

// Shared runs of lines (URL parts, Body readers, DOM queries, event listeners).
const URL_PARTS = `href|The full URL.|string
origin|Scheme, host and port.|string
protocol|Scheme with its colon.|string
host|Host name and port.|string
hostname|Host name.|string
port|Port.|string
pathname|Path.|string
search|Query string with its ?.|string`;
const BODY = `json()|Body parsed as JSON.|Promise
text()|Body as text.|Promise
blob()|Body as a Blob.|Promise
arrayBuffer()|Body as an ArrayBuffer.|Promise
formData()|Body as FormData.|Promise
body|Body as a stream.`;
const QUERY = `querySelector(selectors)|First element matching a CSS selector.|Element
querySelectorAll(selectors)|Every element matching a CSS selector.`;
const LISTEN = `addEventListener(type, listener, options?)|Listen for an event.
removeEventListener(type, listener, options?)|Stop listening for an event.`;

const OWNERS: Record<string, string> = {
  Object: `keys(o)|Own enumerable string keys.|string[]
values(o)|Own enumerable property values.|any[]
entries(o)|Own enumerable [key, value] pairs.|any[]
assign(target, ...sources)|Copy own enumerable properties onto target.
fromEntries(entries)|Object from [key, value] pairs.
groupBy(items, keySelector)|Group items into an object by key.
hasOwn(o, v)|Whether o has an own property v.|boolean
freeze(o)|Prevent changes to an object.
isFrozen(o)|Whether an object is frozen.|boolean
seal(o)|Prevent adding or removing properties.
isSealed(o)|Whether an object is sealed.|boolean
preventExtensions(o)|Prevent adding properties.
isExtensible(o)|Whether properties can be added.|boolean
create(o, properties?)|New object with the given prototype.
defineProperty(o, p, attributes)|Define or change one property.
defineProperties(o, properties)|Define or change several properties.
getOwnPropertyNames(o)|Own string keys, enumerable or not.|string[]
getOwnPropertySymbols(o)|Own symbol keys.|symbol[]
getOwnPropertyDescriptor(o, p)|Descriptor of one own property.
getOwnPropertyDescriptors(o)|Descriptors of all own properties.
getPrototypeOf(o)|The prototype of an object.
setPrototypeOf(o, proto)|Set the prototype of an object.
is(value1, value2)|Same-value equality.|boolean
prototype|Methods shared by every object.`,
  JSON: `parse(text, reviver?)|Parse JSON text into a value.
stringify(value, replacer?, space?)|Serialize a value as JSON text.|string`,
  Math: `PI|Ratio of a circle's circumference to its diameter.|number
E|Euler's number.|number
LN2|Natural logarithm of 2.|number
LN10|Natural logarithm of 10.|number
LOG2E|Base-2 logarithm of e.|number
LOG10E|Base-10 logarithm of e.|number
SQRT2|Square root of 2.|number
SQRT1_2|Square root of 1/2.|number
abs(x)|Absolute value.|number
ceil(x)|Round up to an integer.|number
floor(x)|Round down to an integer.|number
round(x)|Round to the nearest integer.|number
trunc(x)|Integer part of a number.|number
sign(x)|Sign of a number: -1, 0 or 1.|number
max(...values)|Largest of the values.|number
min(...values)|Smallest of the values.|number
random()|Pseudo-random number in [0, 1).|number
pow(x, y)|Base x raised to the power y.|number
sqrt(x)|Square root.|number
cbrt(x)|Cube root.|number
hypot(...values)|Square root of the sum of squares.|number
exp(x)|Euler's number raised to the power x.|number
log(x)|Natural logarithm.|number
log2(x)|Base-2 logarithm.|number
log10(x)|Base-10 logarithm.|number
sin(x)|Sine.|number
cos(x)|Cosine.|number
tan(x)|Tangent.|number
atan2(y, x)|Angle from the x axis to (x, y).|number`,
  Array: `isArray(arg)|Whether a value is an array.|boolean
from(arrayLike, mapfn?, thisArg?)|Array from an iterable or array-like.|any[]
of(...items)|Array of the arguments.|any[]
prototype|Methods shared by every array.`,
  'Array.prototype': `map(callbackfn: (value, index, array) => U, thisArg?)|New array of the callback's results.|any[]
filter(predicate: (value, index, array) => unknown, thisArg?)|Items for which the predicate is truthy.|any[]
find(predicate: (value, index, obj) => unknown, thisArg?)|First item matching the predicate.
some(predicate: (value, index, array) => unknown, thisArg?)|Whether any item matches.|boolean
every(predicate: (value, index, array) => unknown, thisArg?)|Whether every item matches.|boolean
includes(searchElement, fromIndex?)|Whether the array contains a value.|boolean
slice(start?, end?)|Copy of a section of the array.|any[]
join(separator?)|Items joined into a string.|string
at(index)|Item at an index; negative counts from the end.
reduce(callbackfn: (previousValue, currentValue, currentIndex, array) => T, initialValue?)|Fold the items into one value.
reduceRight(callbackfn: (previousValue, currentValue, currentIndex, array) => T, initialValue?)|Fold the items from the end.
forEach(callbackfn: (value, index, array) => void, thisArg?)|Call a function for each item.
flatMap(callback: (value, index, array) => U, thisArg?)|Map, then flatten one level.|any[]
flat(depth?)|Flatten nested arrays.|any[]
findIndex(predicate: (value, index, obj) => unknown, thisArg?)|Index of the first match, or -1.|number
findLast(predicate: (value, index, array) => unknown, thisArg?)|Last item matching the predicate.
findLastIndex(predicate: (value, index, array) => unknown, thisArg?)|Index of the last match, or -1.|number
indexOf(searchElement, fromIndex?)|First index of a value, or -1.|number
lastIndexOf(searchElement, fromIndex?)|Last index of a value, or -1.|number
concat(...items)|New array with the items appended.|any[]
sort(compareFn?: (a, b) => number)|Sort in place.|any[]
toSorted(compareFn?: (a, b) => number)|Sorted copy.|any[]
reverse()|Reverse in place.|any[]
toReversed()|Reversed copy.|any[]
splice(start, deleteCount?, ...items)|Remove or insert items in place.|any[]
toSpliced(start, deleteCount?, ...items)|Copy with items removed or inserted.|any[]
with(index, value)|Copy with one item replaced.|any[]
push(...items)|Append items; returns the new length.|number
pop()|Remove and return the last item.
shift()|Remove and return the first item.
unshift(...items)|Prepend items; returns the new length.|number
fill(value, start?, end?)|Fill a range with a value.|any[]
keys()|Iterator of indices.
values()|Iterator of items.
entries()|Iterator of [index, item] pairs.
length|Number of items.|number`,
  String: `fromCharCode(...codes)|String from UTF-16 code units.|string
fromCodePoint(...codePoints)|String from code points.|string
raw(template, ...substitutions)|Raw text of a template literal.|string
prototype|Methods shared by every string.`,
  'String.prototype': `includes(searchString, position?)|Whether the string contains the text.|boolean
startsWith(searchString, position?)|Whether the string starts with the text.|boolean
endsWith(searchString, endPosition?)|Whether the string ends with the text.|boolean
slice(start?, end?)|Section of the string.|string
split(separator, limit?)|Split into an array of strings.|string[]
trim()|Without leading and trailing whitespace.|string
toLowerCase()|Lower-case copy.|string
toUpperCase()|Upper-case copy.|string
replace(searchValue, replaceValue)|Replace the first match.|string
match(regexp)|Match against a regular expression.
at(index)|Character at an index; negative counts from the end.|string
charAt(pos)|Character at a position.|string
charCodeAt(index)|UTF-16 code unit at an index.|number
codePointAt(pos)|Code point at a position.|number
concat(...strings)|Strings appended.|string
indexOf(searchString, position?)|First index of the text, or -1.|number
lastIndexOf(searchString, position?)|Last index of the text, or -1.|number
localeCompare(that, locales?, options?)|Compare in locale order.|number
matchAll(regexp)|Iterator of all regular expression matches.
normalize(form?)|Unicode normalized copy.|string
padStart(maxLength, fillString?)|Padded at the start to a length.|string
padEnd(maxLength, fillString?)|Padded at the end to a length.|string
repeat(count)|The string repeated.|string
replaceAll(searchValue, replaceValue)|Replace every match.|string
search(regexp)|Index of the first regular expression match.|number
substring(start, end?)|Characters between two indices.|string
trimStart()|Without leading whitespace.|string
trimEnd()|Without trailing whitespace.|string
toString()|The string itself.|string
length|Number of UTF-16 code units.|number`,
  Number: `isInteger(number)|Whether a value is an integer.|boolean
isSafeInteger(number)|Whether a value is a safe integer.|boolean
isFinite(number)|Whether a value is a finite number.|boolean
isNaN(number)|Whether a value is NaN.|boolean
parseFloat(string)|Parse a floating-point number.|number
parseInt(string, radix?)|Parse an integer.|number
MAX_SAFE_INTEGER|Largest safe integer (2^53 - 1).|number
MIN_SAFE_INTEGER|Smallest safe integer.|number
MAX_VALUE|Largest representable number.|number
MIN_VALUE|Smallest positive number.|number
EPSILON|Difference between 1 and the smallest number greater than 1.|number
POSITIVE_INFINITY|Positive infinity.|number
NEGATIVE_INFINITY|Negative infinity.|number
NaN|Not-a-Number.|number
prototype|Methods shared by every number.`,
  'Number.prototype': `toFixed(fractionDigits?)|Fixed-point notation.|string
toPrecision(precision?)|Text with the given significant digits.|string
toExponential(fractionDigits?)|Exponential notation.|string
toString(radix?)|Text in the given base.|string
toLocaleString(locales?, options?)|Text formatted for a locale.|string
valueOf()|The primitive number.|number`,
  'Object.prototype': `hasOwnProperty(v)|Whether the object has an own property.|boolean
isPrototypeOf(v)|Whether the object is in v's prototype chain.|boolean
propertyIsEnumerable(v)|Whether an own property is enumerable.|boolean
toString()|String form of the object.|string
toLocaleString()|Locale string form of the object.|string
valueOf()|Primitive value of the object.
constructor|Function that created the object.`,
  Promise: `resolve(value?)|Promise fulfilled with a value.|Promise
reject(reason?)|Promise rejected with a reason.|Promise
all(values)|Fulfils when all fulfil; rejects on the first rejection.|Promise
allSettled(values)|Fulfils when all settle, with each outcome.|Promise
any(values)|Fulfils with the first fulfilment.|Promise
race(values)|Settles like the first promise to settle.|Promise
withResolvers()|A promise with its resolve and reject functions.
prototype|Methods shared by every promise.`,
  'Promise.prototype': `then(onfulfilled?, onrejected?)|Callbacks for fulfilment and rejection.|Promise
catch(onrejected?)|Callback for rejection.|Promise
finally(onfinally?)|Callback when the promise settles.|Promise`,
  Map: `groupBy(items, keySelector)|Group items into a Map by key.|Map
prototype|Methods shared by every Map.`,
  'Map.prototype': `get(key)|Value for a key.
set(key, value)|Set the value for a key.|Map
has(key)|Whether a key is present.|boolean
delete(key)|Remove a key.|boolean
clear()|Remove every entry.
forEach(callbackfn: (value, key, map) => void, thisArg?)|Call a function for each entry.
keys()|Iterator of keys.
values()|Iterator of values.
entries()|Iterator of [key, value] pairs.
size|Number of entries.|number`,
  Set: `prototype|Methods shared by every Set.`,
  'Set.prototype': `add(value)|Add a value.|Set
has(value)|Whether a value is present.|boolean
delete(value)|Remove a value.|boolean
clear()|Remove every value.
forEach(callbackfn: (value, value2, set) => void, thisArg?)|Call a function for each value.
keys()|Iterator of values.
values()|Iterator of values.
entries()|Iterator of [value, value] pairs.
union(other)|Values in either set.|Set
intersection(other)|Values in both sets.|Set
difference(other)|Values not in the other set.|Set
symmetricDifference(other)|Values in exactly one of the sets.|Set
isSubsetOf(other)|Whether every value is in the other set.|boolean
isSupersetOf(other)|Whether every value of the other set is here.|boolean
isDisjointFrom(other)|Whether the sets share no value.|boolean
size|Number of values.|number`,
  Date: `now()|Milliseconds since the epoch, now.|number
parse(s)|Milliseconds since the epoch for a date string.|number
UTC(year, monthIndex?, date?, hours?, minutes?, seconds?, ms?)|Milliseconds since the epoch for a UTC date.|number
prototype|Methods shared by every Date.`,
  'Date.prototype': `getTime()|Milliseconds since the epoch.|number
toISOString()|ISO 8601 text in UTC.|string
toJSON(key?)|ISO text, as JSON.stringify uses it.|string
toLocaleString(locales?, options?)|Date and time for a locale.|string
toLocaleDateString(locales?, options?)|Date for a locale.|string
toLocaleTimeString(locales?, options?)|Time for a locale.|string
toDateString()|Date part as text.|string
toTimeString()|Time part as text.|string
toUTCString()|Date and time in UTC as text.|string
getFullYear()|Year, local time.|number
getMonth()|Month 0–11, local time.|number
getDate()|Day of the month, local time.|number
getDay()|Day of the week 0–6, local time.|number
getHours()|Hours, local time.|number
getMinutes()|Minutes, local time.|number
getSeconds()|Seconds, local time.|number
getMilliseconds()|Milliseconds, local time.|number
getTimezoneOffset()|Minutes between UTC and local time.|number
getUTCFullYear()|Year, UTC.|number
getUTCHours()|Hours, UTC.|number
setTime(time)|Set milliseconds since the epoch.|number
setFullYear(year, month?, date?)|Set the year, local time.|number
setMonth(month, date?)|Set the month, local time.|number
setDate(date)|Set the day of the month, local time.|number
setHours(hours, min?, sec?, ms?)|Set the hours, local time.|number
valueOf()|Milliseconds since the epoch.|number`,
  RegExp: `prototype|Methods shared by every RegExp.`,
  'RegExp.prototype': `test(string)|Whether the string matches.|boolean
exec(string)|First match with its groups, or null.
source|Pattern text.|string
flags|Flag letters.|string
global|Whether the g flag is set.|boolean
ignoreCase|Whether the i flag is set.|boolean
multiline|Whether the m flag is set.|boolean
sticky|Whether the y flag is set.|boolean
unicode|Whether the u flag is set.|boolean
lastIndex|Index where the next match starts.|number`,
  URL: `canParse(url, base?)|Whether a URL parses.|boolean
parse(url, base?)|Parsed URL, or null.|URL
createObjectURL(obj)|Object URL for a Blob.|string
revokeObjectURL(url)|Release an object URL.
prototype|Members shared by every URL.`,
  'URL.prototype': `${URL_PARTS}
searchParams|Query parameters.|URLSearchParams
hash|Fragment with its #.|string
username|User name.|string
password|Password.|string
toString()|The full URL.|string
toJSON()|The full URL.|string`,
  URLSearchParams: `prototype|Methods shared by every URLSearchParams.`,
  'URLSearchParams.prototype': `get(name)|First value of a parameter, or null.|string
getAll(name)|Every value of a parameter.|string[]
set(name, value)|Set a parameter to one value.
has(name, value?)|Whether a parameter is present.|boolean
append(name, value)|Add a parameter value.
delete(name, value?)|Remove a parameter.
sort()|Sort by name.
toString()|Query string without the ?.|string
keys()|Iterator of names.
values()|Iterator of values.
entries()|Iterator of [name, value] pairs.
forEach(callbackfn: (value, key, parent) => void, thisArg?)|Call a function for each parameter.
size|Number of parameters.|number`,
  Headers: `prototype|Methods shared by every Headers.`,
  'Headers.prototype': `get(name)|Value of a header, or null.|string
set(name, value)|Set a header.
has(name)|Whether a header is present.|boolean
append(name, value)|Add a header value.
delete(name)|Remove a header.
getSetCookie()|Every Set-Cookie value.|string[]
keys()|Iterator of names.
values()|Iterator of values.
entries()|Iterator of [name, value] pairs.
forEach(callbackfn: (value, key, parent) => void, thisArg?)|Call a function for each header.`,
  Response: `json(data, init?)|Response with a JSON body.|Response
error()|Network-error response.|Response
redirect(url, status?)|Redirect response.|Response
prototype|Members shared by every Response.`,
  'Response.prototype': `${BODY}
clone()|Copy of the response.|Response
ok|Whether the status is 200–299.|boolean
status|HTTP status code.|number
statusText|HTTP status text.|string
headers|Response headers.|Headers
url|Final URL of the response.|string
redirected|Whether the request was redirected.|boolean
type|Response type, such as basic or cors.|string
bodyUsed|Whether the body was read.|boolean`,
  Request: `prototype|Members shared by every Request.`,
  'Request.prototype': `method|HTTP method.|string
url|Request URL.|string
headers|Request headers.|Headers
bodyUsed|Whether the body was read.|boolean
credentials|Credentials mode.|string
mode|Request mode.|string
cache|Cache mode.|string
signal|Abort signal.
clone()|Copy of the request.|Request
${BODY}`,
  console: `log(...data)|Log values.
info(...data)|Log at info level.
warn(...data)|Log a warning.
error(...data)|Log an error.
debug(...data)|Log at debug level.
table(tabularData?, properties?)|Log rows as a table.
dir(item?, options?)|Log an object's properties.
group(...data)|Start an indented group.
groupCollapsed(...data)|Start a collapsed group.
groupEnd()|End the current group.
time(label?)|Start a timer.
timeEnd(label?)|Stop a timer and log it.
timeLog(label?, ...data)|Log a timer's current value.
count(label?)|Log how often this was called.
countReset(label?)|Reset a counter.
assert(condition?, ...data)|Log an error when the condition is false.
trace(...data)|Log a stack trace.
clear()|Clear the console.`,
  'Document.prototype': `${QUERY}
getElementById(elementId)|Element with the given id.|Element
getElementsByClassName(classNames)|Live list of elements with the classes.
getElementsByTagName(qualifiedName)|Live list of elements with the tag.
createElement(tagName, options?)|New element.|Element
createTextNode(data)|New text node.
${LISTEN}
elementFromPoint(x, y)|Topmost element at a point.|Element
hasFocus()|Whether the document has focus.|boolean
body|The body element.|HTMLElement
head|The head element.|HTMLElement
documentElement|The root element.|HTMLElement
activeElement|Element with focus.|Element
title|Document title.|string
cookie|Cookies visible to the page.|string
URL|Document URL.|string
referrer|URL of the referring page.|string
readyState|Loading state.|string
location|URL of the document.|Location
forms|Every form.
images|Every image.
links|Every link.
scripts|Every script.`,
  'Element.prototype': `${QUERY}
closest(selectors)|Nearest ancestor matching a selector.|Element
matches(selectors)|Whether the element matches a selector.|boolean
getAttribute(qualifiedName)|Value of an attribute, or null.|string
setAttribute(qualifiedName, value)|Set an attribute.
hasAttribute(qualifiedName)|Whether an attribute is present.|boolean
removeAttribute(qualifiedName)|Remove an attribute.
getAttributeNames()|Names of every attribute.|string[]
getBoundingClientRect()|Size and position in the viewport.
scrollIntoView(arg?)|Scroll the element into view.
${LISTEN}
append(...nodes)|Insert nodes after the last child.
remove()|Remove from the document.
contains(other)|Whether a node is a descendant.|boolean
cloneNode(subtree?)|Copy of the node.
click()|HTML elements: simulate a mouse click.
focus(options?)|HTML elements: move focus to the element.
blur()|HTML elements: remove focus from the element.
id|Element id.|string
className|Class attribute.|string
classList|Classes as a token list.
tagName|Tag name in upper case.|string
innerHTML|Markup of the children.|string
outerHTML|Markup of the element.|string
textContent|Text of the element and its descendants.|string
children|Child elements.
attributes|Attributes.
parentElement|Parent element.|Element
firstElementChild|First child element.|Element
nextElementSibling|Next sibling element.|Element
innerText|HTML elements: rendered text.|string
style|HTML elements: inline style declarations.
dataset|HTML elements: data-* attributes.
hidden|HTML elements: whether the hidden attribute is set.|boolean
title|HTML elements: tooltip text.|string
value|Form controls: current value.|string`,
  performance: `now()|Milliseconds since the time origin.|number
mark(markName, markOptions?)|Record a named timestamp.
measure(measureName, startOrMeasureOptions?, endMark?)|Record the time between two marks.
getEntries()|Every performance entry.
getEntriesByType(type)|Performance entries of a type, such as resource.
getEntriesByName(name, type?)|Performance entries with a name.
clearMarks(markName?)|Remove marks.
clearMeasures(measureName?)|Remove measures.
timeOrigin|Start time of the page, in ms since the epoch.|number`,
  crypto: `randomUUID()|Random version 4 UUID.|string
getRandomValues(array)|Fill a typed array with random values.
subtle|Web Crypto: hashing, signing and encryption.`,
  history: `back()|Go back one page.
forward()|Go forward one page.
go(delta?)|Move through the session history.
pushState(data, unused, url?)|Add a history entry.
replaceState(data, unused, url?)|Replace the current history entry.
state|State of the current entry.
length|Number of entries in the session history.|number
scrollRestoration|Scroll restoration mode: auto or manual.|string`,
  Reflect: `apply(target, thisArgument, argumentsList)|Call a function with a this value and arguments.
construct(target, argumentsList, newTarget?)|Call a constructor with new.
defineProperty(target, propertyKey, attributes)|Define a property; returns success.|boolean
deleteProperty(target, propertyKey)|Delete a property; returns success.|boolean
get(target, propertyKey, receiver?)|Read a property.
getOwnPropertyDescriptor(target, propertyKey)|Descriptor of one own property.
getPrototypeOf(target)|The prototype of an object.
has(target, propertyKey)|Whether a property exists, like in.|boolean
isExtensible(target)|Whether properties can be added.|boolean
ownKeys(target)|Every own key, strings and symbols.
preventExtensions(target)|Prevent adding properties.|boolean
set(target, propertyKey, value, receiver?)|Write a property; returns success.|boolean
setPrototypeOf(target, proto)|Set the prototype; returns success.|boolean`,
  location: `${URL_PARTS}
hash|Fragment with its #.|string
assign(url)|Navigate to a URL.
replace(url)|Navigate without a history entry.
reload()|Reload the page.
toString()|The full URL.|string`,
  navigator: `userAgent|User agent string.|string
language|Preferred language.|string
languages|Preferred languages.|string[]
onLine|Whether the browser is online.|boolean
platform|Platform name.|string
cookieEnabled|Whether cookies are enabled.|boolean
hardwareConcurrency|Number of logical processors.|number
clipboard|Clipboard access.
serviceWorker|Service worker container.
sendBeacon(url, data?)|Queue a small POST request.|boolean`,
  Storage: `getItem(key)|Value for a key, or null.|string
setItem(key, value)|Store a value.
removeItem(key)|Remove a key.
clear()|Remove every key.
key(index)|Key name at an index.|string
length|Number of stored keys.|number`,
  Element: `prototype|Members shared by every element.`,
  Document: `prototype|Members shared by every document.`,
};

// Owners that are another owner's list (the page's objects and their classes).
const ALIASES: Record<string, string> = {
  document: 'Document.prototype',
  localStorage: 'Storage',
  sessionStorage: 'Storage',
};

const KEYWORD_TEXT = `await|Wait for a promise to settle.
async|Declare an asynchronous function.
const|Declare a constant.
let|Declare a block-scoped variable.
var|Declare a function-scoped variable.
function|Declare a function.
class|Declare a class.
return|Return a value from a function.
if|Run code when a condition holds.
else|Alternative branch of an if.
for|Loop.
while|Loop while a condition holds.
do|Loop at least once.
switch|Branch on a value.
case|One branch of a switch.
default|Fallback branch of a switch.
break|Leave a loop or switch.
continue|Skip to the next loop iteration.
try|Run code and catch errors.
catch|Handle an error from try.
finally|Run after try, whatever happens.
throw|Throw an error.
new|Construct an object.
typeof|Type of a value as a string.
instanceof|Whether a value is an instance of a class.
in|Whether an object has a property.
of|Iterate the values of an iterable.
delete|Remove a property.
void|Evaluate and return undefined.
yield|Pause a generator.
debugger|Pause in the debugger.
this|The current receiver.
true|Boolean true.
false|Boolean false.
null|No value.
undefined|Not defined.`;

function parse(text: string, member: boolean): CatalogEntry[] {
  return text.split('\n').map((line) => {
    const [head, doc, returns] = line.split('|');
    const mark = head[0];
    const sig = mark === '@' || mark === '#' ? head.slice(1) : head;
    const paren = sig.indexOf('(');
    const name = paren < 0 ? sig : sig.slice(0, paren);
    const kind: CatalogKind = mark === '@' ? 'class' : mark === '#' ? 'namespace' : paren < 0 ? (member ? 'property' : 'variable') : member ? 'method' : 'function';
    const entry: CatalogEntry = { name, kind, doc };
    if (paren >= 0) entry.signature = sig;
    if (returns) entry.returns = returns;
    return entry;
  });
}

export const CATALOG_GLOBALS: CatalogEntry[] = parse(GLOBALS, false);
export const KEYWORDS: CatalogEntry[] = KEYWORD_TEXT.split('\n').map((line) => {
  const [name, doc] = line.split('|');
  return { name, kind: 'keyword', doc };
});

/** Every owner name `catalogMembers` answers for. */
export const CATALOG_OWNERS: string[] = [...Object.keys(OWNERS), ...Object.keys(ALIASES), 'window'];

const cache = new Map<string, CatalogEntry[]>();

/** Members of a global (`Object`, `document`) or a prototype (`Array.prototype`); `[]` for anything else. */
export function catalogMembers(owner: string): CatalogEntry[] {
  if (owner === 'window') return CATALOG_GLOBALS;
  const key = Object.prototype.hasOwnProperty.call(ALIASES, owner) ? ALIASES[owner] : owner;
  if (!Object.prototype.hasOwnProperty.call(OWNERS, key)) return [];
  let list = cache.get(key);
  if (!list) {
    list = parse(OWNERS[key], true);
    cache.set(key, list);
  }
  return list;
}

/** The owner whose members a value of a `returns` type has (`string[]` → `Array.prototype`). */
export function ownerOfType(type: string | undefined): string | null {
  if (!type) return null;
  if (type.endsWith('[]')) return 'Array.prototype';
  const base = type.replace(/<.*$/, '');
  if (base === 'string') return 'String.prototype';
  if (base === 'number') return 'Number.prototype';
  if (base === 'HTMLElement') return 'Element.prototype';
  if (base === 'Location') return 'location';
  if (base === 'Navigator') return 'navigator';
  if (base === 'Storage') return 'Storage';
  if (base === 'History') return 'history';
  if (base === 'Performance') return 'performance';
  if (base === 'Crypto') return 'crypto';
  const proto = `${base}.prototype`;
  return Object.prototype.hasOwnProperty.call(OWNERS, proto) ? proto : null;
}
