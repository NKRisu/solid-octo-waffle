// ===============================
// Form handling for resources page (CRUD)
// Buttons: create, update, delete
// ===============================

// -------------- Helpers --------------
function $(id) {
  return document.getElementById(id);
}

function getFormMessageEl() {
  return document.getElementById("formMessage");
}

/**
 * Show a success/error/info message in the UI.
 * type: "success" | "error" | "info"
 */
function showFormMessage(type, message) {
  const el = getFormMessageEl();
  if (!el) return;

  el.className = "mt-6 rounded-2xl border px-4 py-3 text-sm whitespace-pre-line";
  el.classList.remove("hidden");

  if (type === "success") {
    el.classList.add("border-emerald-200", "bg-emerald-50", "text-emerald-900");
  } else if (type === "info") {
    el.classList.add("border-amber-200", "bg-amber-50", "text-amber-900");
  } else {
    el.classList.add("border-rose-200", "bg-rose-50", "text-rose-900");
  }

  el.textContent = message;
  el.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function clearFormMessage() {
  const el = getFormMessageEl();
  if (!el) return;
  el.textContent = "";
  el.classList.add("hidden");
}

/**
 * Try to read JSON from the response.
 * If JSON is not available, return a best-effort object including raw text.
 */
async function readResponseBody(response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return { ok: false, error: "Invalid JSON response" };
    }
  }

  const text = await response.text().catch(() => "");
  try {
    return JSON.parse(text);
  } catch {
    return { ok: false, error: "Non-JSON response", raw: text };
  }
}

/**
 * Expected format: { errors: [ { field, msg }, ... ] }
 */
function buildValidationMessage(errors) {
  if (!Array.isArray(errors) || errors.length === 0) {
    return "Validation failed. Please check your input fields.";
  }

  const lines = errors.map((e) => `• ${e.field || "field"}: ${e.msg || "Invalid value"}`);
  return `Your request was blocked by server-side validation:\n\n${lines.join("\n")}`;
}

function buildGenericErrorMessage(status, body) {
  const details = body?.details ? `\n\nDetails: ${body.details}` : "";
  const error = body?.error ? body.error : "Request failed";
  return `Server returned an error (${status}).\n\nReason: ${error}${details}`;
}

// -------------- Data helpers --------------
function getSelectedUnit() {
  return document.querySelector('input[name="resourcePriceUnit"]:checked')?.value ?? "";
}

function getPayloadFromForm() {
  const priceRaw = $("resourcePrice")?.value ?? "";
  const resourcePrice = priceRaw === "" ? 0 : Number(priceRaw);
  return {
    resourceId: $("resourceId")?.value ?? "",
    resourceName: $("resourceName")?.value ?? "",
    resourceDescription: $("resourceDescription")?.value ?? "",
    resourceAvailable: $("resourceAvailable")?.checked ?? false,
    resourcePrice,
    resourcePriceUnit: getSelectedUnit(),
  };
}

function getUserIdFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload?.sub ?? payload?.id ?? null;
  } catch {
    return null;
  }
}

function formatDateTimeToISOString(dateValue, timeValue) {
  if (!dateValue || !timeValue) return null;

  const date = new Date(`${dateValue}T${timeValue}`);
  if (Number.isNaN(date.getTime())) return null;

  return date.toISOString();
}

function getReservationPayload() {
  return {
    resourceId: Number($("reservationResource")?.value || 0),
    userId: getUserIdFromToken() || 0,
    startTime: formatDateTimeToISOString($("startDate")?.value, $("startTime")?.value),
    endTime: formatDateTimeToISOString($("endDate")?.value, $("endTime")?.value),
    note: $("reservationPurpose")?.value?.trim() || "",
    status: "active",
  };
}

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

async function loadResourcesIntoSelect() {
  const selectEl = $("reservationResource");
  if (!selectEl) return;

  try {
    const res = await fetch("/api/resources", {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      credentials: "include",
    });

    if (!res.ok) {
      showFormMessage("error", "Could not load resources for reservation. Please refresh.");
      return;
    }

    const body = await readResponseBody(res);
    if (!body?.ok || !Array.isArray(body?.data)) {
      showFormMessage("error", "Received invalid resource list from server.");
      return;
    }

    selectEl.innerHTML = `<option value="">Choose a resource</option>`;
    body.data.forEach((resource) => {
      const opt = document.createElement("option");
      opt.value = resource.id;
      opt.textContent = resource.name;
      selectEl.appendChild(opt);
    });
  } catch (err) {
    console.error(err);
    showFormMessage("error", "Unable to load resources at this time.");
  }
}

async function submitReservation(event) {
  event.preventDefault();
  const submitter = event.submitter;
  const actionValue = submitter?.value || "create";

  clearFormMessage();

  if (actionValue === "create") {
    const payload = getReservationPayload();

    if (!payload.resourceId || !payload.userId || !payload.startTime || !payload.endTime) {
      showFormMessage("error", "Please fill all required fields and select a resource.");
      return;
    }

    if (new Date(payload.startTime) >= new Date(payload.endTime)) {
      showFormMessage("error", "End time must be after start time.");
      return;
    }

    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const body = await readResponseBody(response);

      if (!response.ok) {
        const msg = body?.error || "Failed to create reservation";
        showFormMessage("error", msg);
        return;
      }

      showFormMessage("success", "Reservation created successfully.");
      if (typeof window.onReservationActionSuccess === "function") {
        window.onReservationActionSuccess({ action: "create", data: body.data, id: body.data?.id });
      }
    } catch (err) {
      console.error(err);
      showFormMessage("error", "Network error while creating reservation.");
    }
  } else if (actionValue === "update") {
    const id = $("reservationId")?.value;
    if (!id) {
      showFormMessage("error", "No reservation selected for update.");
      return;
    }

    const payload = getReservationPayload();

    if (!payload.resourceId || !payload.startTime || !payload.endTime) {
      showFormMessage("error", "Please fill all required fields.");
      return;
    }

    if (new Date(payload.startTime) >= new Date(payload.endTime)) {
      showFormMessage("error", "End time must be after start time.");
      return;
    }

    try {
      const response = await fetch(`/api/reservations/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const body = await readResponseBody(response);

      if (!response.ok) {
        const msg = body?.error || "Failed to update reservation";
        showFormMessage("error", msg);
        return;
      }

      showFormMessage("success", "Reservation updated successfully.");
      if (typeof window.onReservationActionSuccess === "function") {
        window.onReservationActionSuccess({ action: "update", data: body.data, id });
      }
    } catch (err) {
      console.error(err);
      showFormMessage("error", "Network error while updating reservation.");
    }
  } else if (actionValue === "delete") {
    const id = $("reservationId")?.value;
    if (!id) {
      showFormMessage("error", "No reservation selected for deletion.");
      return;
    }

    if (!confirm("Are you sure you want to delete this reservation?")) {
      return;
    }

    try {
      const response = await fetch(`/api/reservations/${id}`, {
        method: "DELETE",
        headers: {
          ...getAuthHeaders(),
        },
        credentials: "include",
      });

      if (!response.ok) {
        const body = await readResponseBody(response);
        const msg = body?.error || "Failed to delete reservation";
        showFormMessage("error", msg);
        return;
      }

      showFormMessage("success", "Reservation deleted successfully.");
      if (typeof window.onReservationActionSuccess === "function") {
        window.onReservationActionSuccess({ action: "delete", id });
      }
    } catch (err) {
      console.error(err);
      showFormMessage("error", "Network error while deleting reservation.");
    }
  }
}

// -------------- Form wiring --------------
document.addEventListener("DOMContentLoaded", async () => {
  const resourceForm = $("resourceForm");
  const reservationForm = $("reservationForm");

  if (resourceForm) {
    resourceForm.addEventListener("submit", onSubmit);
    return;
  }

  if (reservationForm) {
    reservationForm.addEventListener("submit", submitReservation);
    const clearBtn = $("clearReservationBtn");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        reservationForm.reset();
        clearFormMessage();
      });
    }

    await loadResourcesIntoSelect();
  }
});

async function onSubmit(event) {
  event.preventDefault();
  const submitter = event.submitter;
  const actionValue = submitter?.value || "create"; // "create" | "update" | "delete"

  // DELETE does not need body data
  const payload = getPayloadFromForm();

  try {
    clearFormMessage();

    // ------------------------------
    // Decide method + URL
    // ------------------------------
    let method = "POST";
    let url = "/api/resources";
    let body = null;

    if (actionValue === "create") {
      method = "POST";
      url = "/api/resources";
      body = JSON.stringify(payload);
    } else if (actionValue === "update") {
      if (!payload.resourceId) {
        showFormMessage("error", "Update failed: missing resource ID. Select a resource first.");
        return;
      }
      method = "PUT";
      url = `/api/resources/${payload.resourceId}`;
      body = JSON.stringify(payload);
    } else if (actionValue === "delete") {
      if (!payload.resourceId) {
        showFormMessage("error", "Delete failed: missing resource ID. Select a resource first.");
        return;
      }
      method = "DELETE";
      url = `/api/resources/${payload.resourceId}`;
      body = null;
    } else {
      showFormMessage("error", `Unknown action: ${actionValue}`);
      return;
    }

    const response = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body,
    });

    // 204 has no body
    const responseBody = response.status === 204 ? null : await readResponseBody(response);

    // ------------------------------
    // Error handling
    // ------------------------------
    if (!response.ok) {
      if (response.status === 400) {
        const msg = buildValidationMessage(responseBody?.errors);
        showFormMessage("error", msg);
        return;
      }

      if (response.status === 409) {
        showFormMessage("error", "❌ A resource with the same name already exists. 😕");
        return;
      }

      if (response.status === 404) {
        showFormMessage("error", "Not found (404):\n\nThe resource no longer exists. Refresh the list and try again.");
        return;
      }

      showFormMessage("error", buildGenericErrorMessage(response.status, responseBody));
      return;
    }

    // ------------------------------
    // Success handling
    // ------------------------------
    if (actionValue === "delete") {
      showFormMessage("success", `👍 ${payload.resourceName} successfully deleted! 🥳`);
    } else if (actionValue === "create") {
      showFormMessage("success", `👍 ${payload.resourceName} successfully created! 🥳`);
    } else if (actionValue === "update") {
      showFormMessage("success", `👍 ${payload.resourceName} successfully updated! 🥳`);
    }

    // Notify UI layer (resources.js) if present
    if (typeof window.onResourceActionSuccess === "function") {
      window.onResourceActionSuccess({
        action: actionValue,
        data: responseBody?.data ?? null,
        id: responseBody?.data?.id ?? null,
      });
    }
  } catch (err) {
    console.error("Fetch error:", err);
    showFormMessage(
      "error",
      "Network error: Could not reach the server. Check your environment and try again."
    );
  }
}
