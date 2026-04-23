const state = {
  selectedPerson: null,
};
// Zod for validation
import { z } from "https://cdn.jsdelivr.net/npm/zod@3.22.2/+esm";

const form = document.getElementById("customer-form-element");
const saveButton = document.getElementById("save-button");
const deleteButton = document.getElementById("delete-button");
const resetButton = document.getElementById("reset-button");
const formMessage = document.getElementById("form-message");
const customerList = document.getElementById("customer-list");

// copied Z-schema from previous project
const customerSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().transform(value => {
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
  }),
  birth_date: z.string().nullable().refine(value => {
    return value === null || /^\d{4}-\d{2}-\d{2}$/.test(value);
  }, "Choose a valid birthdate"),
});

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function setFormMessage(message, type = "info") {
  formMessage.textContent = message;
  formMessage.className = `form-status ${type}`;
}

// when nobody selected, hide related button
function clearSelection() {
  state.selectedPerson = null;
  form.reset();
  saveButton.textContent = "Add customer";
  deleteButton.classList.add("hidden");
  setFormMessage("Ready to add a new customer.", "info");
  highlightSelectedCard();
}

function getFormData() {
  return {
    first_name: document.getElementById("first-name").value.trim(),
    last_name: document.getElementById("last-name").value.trim(),
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim() || null,
    birth_date: document.getElementById("birthdate").value || null,
  };
}

function fillForm(person) {
  state.selectedPerson = person;
  document.getElementById("first-name").value = person.first_name || "";
  document.getElementById("last-name").value = person.last_name || "";
  document.getElementById("email").value = person.email || "";
  document.getElementById("phone").value = person.phone || "";
  
  if (person.birth_date) {
    const dateStr = person.birth_date.split("T")[0];
    document.getElementById("birthdate").value = dateStr;
  } else {
    document.getElementById("birthdate").value = "";
  }

  saveButton.textContent = "Update customer";
  deleteButton.classList.remove("hidden");
  setFormMessage(`Editing ${person.first_name} ${person.last_name}.`, "info");
  highlightSelectedCard();
}

function highlightSelectedCard() {
  document.querySelectorAll(".customer-card").forEach(card => {
    const selectedId = String(state.selectedPerson?.id || "");
    const cardId = card.dataset.personId;
    const isSelected = selectedId !== "" && cardId === selectedId;
    card.classList.toggle("selected", isSelected);
    card.dataset.selected = isSelected ? "true" : "false";
  });
}

async function loadCustomers() {
  customerList.innerHTML = "<p>Loading customer records...</p>";

  try {
    const res = await fetch("/api/persons");
    if (!res.ok) {
      throw new Error("Failed to fetch data");
    }

    const data = await res.json();
    renderCustomerList(data);
  } catch (err) {
    console.error(err);
    customerList.innerHTML = "<p style='color:red;'>Error loading data</p>";
  }
}

function renderCustomerList(customers) {
  customerList.innerHTML = "";

  if (customers.length === 0) {
    customerList.innerHTML = "<p>No customers found.</p>";
    return;
  }

  customers.forEach(person => {
    const card = document.createElement("div");
    card.className = "customer-card";
    card.dataset.personId = person.id;
    card.tabIndex = 0;
    card.role = "button";

    card.innerHTML = `
      <strong>${person.first_name} ${person.last_name}</strong><br>
      <small>Email:</small> ${person.email}<br>
      <small>Phone:</small> ${person.phone || "-"}<br>
      <small>Birthdate:</small> ${formatDate(person.birth_date)}
    `;

    card.addEventListener("click", () => fillForm(person));
    card.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        fillForm(person);
      }
    });

    customerList.appendChild(card);
  });

  highlightSelectedCard();
}

async function submitCustomer(event) {
  event.preventDefault();

  const payload = getFormData();
  const validation = customerSchema.safeParse(payload);
  if (!validation.success) {
    setFormMessage(validation.error.errors[0]?.message || "Please correct the form fields.", "error");
    return;
  }

  const validatedData = validation.data;
  const isUpdate = Boolean(state.selectedPerson?.id);
  const url = isUpdate ? `/api/persons/${state.selectedPerson.id}` : "/api/persons";
  const method = isUpdate ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validatedData),
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.error || "Unable to save customer.");
    }

    if (isUpdate) {
      state.selectedPerson = result.person;
      setFormMessage("Customer updated successfully.", "success");
    } else {
      clearSelection();
      setFormMessage("Customer added successfully.", "success");
    }

    await loadCustomers();
    if (isUpdate && state.selectedPerson) {
      fillForm(state.selectedPerson);
    }
  } catch (error) {
    console.error(error);
    setFormMessage(error.message, "error");
  }
}

async function deleteCustomer() {
  if (!state.selectedPerson?.id) {
    setFormMessage("Select a customer before deleting.", "error");
    return;
  }
// pop up conf
  const confirmed = window.confirm(
    `Delete ${state.selectedPerson.first_name} ${state.selectedPerson.last_name}?`
  );

  if (!confirmed) {
    return;
  }

  try {
    const res = await fetch(`/api/persons/${state.selectedPerson.id}`, {
      method: "DELETE",
    });

    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || "Unable to delete customer.");
    }

    clearSelection();
    setFormMessage("Customer deleted successfully.", "success");
    await loadCustomers();
  } catch (error) {
    console.error(error);
    setFormMessage(error.message, "error");
  }
}

form.addEventListener("submit", submitCustomer);
deleteButton.addEventListener("click", deleteCustomer);
resetButton.addEventListener("click", clearSelection);

clearSelection();
loadCustomers();