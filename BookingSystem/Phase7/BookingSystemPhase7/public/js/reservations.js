// ===============================
// 0) Authorization
// ===============================

import { initAuthUI, getUserRole, requireAuthOrBlockPage, logout } from "./auth-ui.js";
initAuthUI();
if (!requireAuthOrBlockPage()) {
  throw new Error("Authentication required");
}

window.logout = logout;

// ===============================
// 1) DOM references
// ===============================
const actions = document.getElementById("reservationActions");
const reservationIdInput = document.getElementById("reservationId");
const reservationListEl = document.getElementById("reservationList");

const role = getUserRole();
let createButton = null;
let updateButton = null;
let deleteButton = null;
let clearButton = null;
let primaryActionButton = null;
let formMode = "create";
let reservationsCache = [];
let selectedReservationId = null;

// ===============================
// 2) Button creation helpers
// ===============================

const BUTTON_BASE_CLASSES =
  "w-full rounded-2xl px-6 py-3 text-sm font-semibold transition-all duration-200 ease-out";

const BUTTON_ENABLED_CLASSES =
  "bg-brand-primary text-white hover:bg-brand-dark/80 shadow-soft";

const BUTTON_DISABLED_CLASSES =
  "cursor-not-allowed opacity-50";

function addButton({ label, type = "button", value, classes = "" }) {
  const btn = document.createElement("button");
  btn.type = type;
  btn.textContent = label;
  btn.name = "action";
  if (value) btn.value = value;

  btn.className = `${BUTTON_BASE_CLASSES} ${classes}`.trim();

  actions.appendChild(btn);
  return btn;
}

function setButtonEnabled(btn, enabled) {
  if (!btn) return;

  btn.disabled = !enabled;
  btn.classList.toggle("cursor-not-allowed", !enabled);
  btn.classList.toggle("opacity-50", !enabled);

  if (!enabled) {
    btn.classList.remove("hover:bg-brand-dark/80");
  } else {
    if (btn.value === "create" || btn.value === "update") {
      btn.classList.add("hover:bg-brand-dark/80");
    }
  }
}

function renderActionButtons() {
  actions.innerHTML = "";
  if (formMode === "create") {
    createButton = addButton({
      label: "Create reservation",
      type: "submit",
      value: "create",
      classes: BUTTON_ENABLED_CLASSES,
    });

    clearButton = addButton({
      label: "Clear",
      type: "button",
      classes: BUTTON_ENABLED_CLASSES,
    });

    setButtonEnabled(createButton, true);
    primaryActionButton = createButton;
    setButtonEnabled(clearButton, true);
    clearButton.addEventListener("click", () => {
      clearReservationForm();
      clearFormMessage();
    });
  }

  if (formMode === "edit") {
    updateButton = addButton({
      label: "Update reservation",
      type: "submit",
      value: "update",
      classes: BUTTON_ENABLED_CLASSES,
    });

    deleteButton = addButton({
      label: "Delete reservation",
      type: "submit",
      value: "delete",
      classes: BUTTON_ENABLED_CLASSES,
    });
    setButtonEnabled(updateButton, true);
    primaryActionButton = updateButton;
    setButtonEnabled(deleteButton, true);
  }
}

function setCurrentReservationId(id) {
  if (!reservationIdInput) return;
  reservationIdInput.value = id ? String(id) : "";
}

// ==========================================
// 3) Form population and clearing
// ==========================================
function populateReservationForm(reservation) {
  const resourceSelect = document.getElementById("reservationResource");
  const startDate = document.getElementById("startDate");
  const startTime = document.getElementById("startTime");
  const endDate = document.getElementById("endDate");
  const endTime = document.getElementById("endTime");
  const purpose = document.getElementById("reservationPurpose");

  if (resourceSelect) resourceSelect.value = reservation.resource_id;
  if (purpose) purpose.value = reservation.note || "";

  const start = new Date(reservation.start_time);
  if (startDate) startDate.value = start.toISOString().split('T')[0];
  if (startTime) startTime.value = start.toTimeString().slice(0, 5);

  const end = new Date(reservation.end_time);
  if (endDate) endDate.value = end.toISOString().split('T')[0];
  if (endTime) endTime.value = end.toTimeString().slice(0, 5);
}

function clearReservationForm() {
  const form = document.getElementById("reservationForm");
  if (form) form.reset();
  formMode = "create";
  selectedReservationId = null;
  setCurrentReservationId(null);
  renderActionButtons();
}

// ==========================================
// 4) Reservation list rendering
// ==========================================
function renderReservationList(reservations) {
  if (!reservationListEl) return;
  reservationListEl.innerHTML = reservations
    .map((r) => {
      const start = new Date(r.start_time).toLocaleString();
      const end = new Date(r.end_time).toLocaleString();
      return `
        <button
          type="button"
          data-reservation-id="${r.id}"
          class="w-full text-left rounded-2xl border border-black/10 bg-white px-4 py-3 transition hover:bg-black/5"
          title="Select reservation"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="font-semibold truncate">${r.resource_name || "Resource"}</div>
              <div class="text-xs text-black/50">${start} - ${end}</div>
              ${r.note ? `<div class="text-xs text-black/70 mt-1">${r.note}</div>` : ""}
            </div>
          </div>
        </button>
      `;
    })
    .join("");

  // Wire selection clicks
  reservationListEl.querySelectorAll("[data-reservation-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      clearFormMessage();
      const id = Number(btn.dataset.reservationId);
      const reservation = reservationsCache.find((x) => Number(x.id) === id);
      if (!reservation) return;

      selectedReservationId = id;
      setCurrentReservationId(id);
      formMode = "edit";
      renderActionButtons();
      populateReservationForm(reservation);
    });
  });
}

// ==========================================
// 5) API calls
// ==========================================
function getAuthHeaders() {
  const token = localStorage.getItem("token");
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

async function loadReservations() {
  try {
    const res = await fetch("/api/reservations", {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      credentials: "include",
    });

    if (!res.ok) {
      console.error("Failed to load reservations");
      return;
    }

    const body = await res.json();
    if (body.ok && Array.isArray(body.data)) {
      reservationsCache = body.data;
      renderReservationList(reservationsCache);
    }
  } catch (err) {
    console.error("Error loading reservations:", err);
  }
}

// ==========================================
// 6) Success callback for form.js
// ==========================================
window.onReservationActionSuccess = function({ action, data, id }) {
  if (action === "create" || action === "update" || action === "delete") {
    loadReservations();
    if (action === "create") {
      clearReservationForm();
    }
  }
};

// ==========================================
// 7) Initialization
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  renderActionButtons();
  loadReservations();
})
