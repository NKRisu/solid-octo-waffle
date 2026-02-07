# List of fixes

## Fix 1:

- Adding the wanted functionality of locking "Create" button if fields are not used, this was missing for available and price in version 3 (I got docked points for it in version 2.)

---

## Fix 2:

- Adding "let [button] = null" for all buttons

---

## Fix 3:

- Adding resourceAvailable and resourcePrice getElementById calls.

---

## Fix 4:

- Adding resource description to docker logs, this was missing in the input normalization code block.

---

## Fix 5:

- Added status code and availability to the docker log file print.

---

## Fix 6:

- Fixed the fallback 404 issue which just showed error message when trying to open the webpage.

---

## Fix 7:

- Fixed the log shown on webpage to include price.

---

## Fix 8:

- Added "http://localhost:5000" to the /api/resources fetch call, as it had eronious behaviour.

---

## Fix 9:

- Fixed typos in the payload.

---

## Fix 10:

- Added price unit to be also shown in the log.

---

## Fix 11:

- Combining all the wild attachment functions to use a single updater function. This is set so I could then later clean up these copy paste attachment functions which make my eyes twitch.

---

## Fix 12:

- Fixing and adding on to creation and validation of input, stil very messy.

---
