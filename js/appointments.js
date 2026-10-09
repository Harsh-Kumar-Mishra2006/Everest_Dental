// DaanthSeva - appointment booking (vanilla JS + localStorage)

const STORAGE_KEY = 'daanthseva_appointments';

const form = document.getElementById('appointmentForm');
const listEl = document.getElementById('appointmentList');
const emptyEl = document.getElementById('emptyState');
const clearBtn = document.getElementById('clearAll');
const statusEl = document.getElementById('formStatus');
const dateInput = document.getElementById('date');

// ---------- Storage ----------
function loadAppointments() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveAppointments(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

// ---------- Helpers ----------
function todayString() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split('T')[0];
}

function formatDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  });
}

function sortKey(a) {
  return a.date + ' ' + to24h(a.time);
}

function to24h(time) {
  const [hm, ap] = time.split(' ');
  let [h, m] = hm.split(':').map(Number);
  if (ap === 'PM' && h !== 12) h += 12;
  if (ap === 'AM' && h === 12) h = 0;
  return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text; // textContent keeps user input safe
  return node;
}

// ---------- Render ----------
function render() {
  const items = loadAppointments().sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
  listEl.innerHTML = '';

  emptyEl.hidden = items.length > 0;
  clearBtn.hidden = items.length === 0;

  items.forEach((a) => {
    const li = el('li', 'appt');

    const top = el('div', 'appt-top');
    const who = el('div');
    who.append(el('h4', '', a.name), el('p', 'appt-service', a.service));
    top.append(who, el('span', 'appt-badge', formatDate(a.date) + ', ' + a.time));

    li.append(top, el('p', 'appt-meta', 'Phone: ' + a.phone));
    if (a.message) li.append(el('p', 'appt-msg', a.message));

    const cancel = el('button', 'link-btn appt-cancel', 'Cancel appointment');
    cancel.type = 'button';
    cancel.dataset.id = a.id;
    li.append(cancel);

    listEl.append(li);
  });
}

// ---------- Validation ----------
function setError(field, message) {
  const input = form.elements[field];
  const errorEl = form.querySelector('[data-for="' + field + '"]');
  if (errorEl) errorEl.textContent = message;
  if (input) input.classList.toggle('invalid', Boolean(message));
}

function validate(data) {
  let ok = true;
  const check = (field, bad, message) => {
    setError(field, bad ? message : '');
    if (bad) ok = false;
  };

  check('name', data.name.length < 2, 'Enter your full name.');
  check('phone', !/^[1-9]\d{9}$/.test(data.phone), 'Enter a valid 10-digit mobile number.');
  check('service', !data.service, 'Choose a service.');
  check('date', !data.date || data.date < todayString(), 'Choose today or a future date.');
  check('time', !data.time, 'Choose a time.');
  return ok;
}

// ---------- Events ----------
dateInput.min = todayString();

form.addEventListener('submit', (e) => {
  e.preventDefault();
  statusEl.textContent = '';

  const data = {
    name: form.elements.name.value.trim(),
    phone: form.elements.phone.value.replace(/\s+/g, ''),
    service: form.elements.service.value,
    date: form.elements.date.value,
    time: form.elements.time.value,
    message: form.elements.message.value.trim()
  };

  if (!validate(data)) return;

  const items = loadAppointments();
  const clash = items.some((a) => a.date === data.date && a.time === data.time);
  if (clash) {
    setError('time', 'That slot is already booked. Choose another time.');
    return;
  }

  items.push({ id: Date.now().toString(), ...data });
  saveAppointments(items);
  render();

  form.reset();
  dateInput.min = todayString();
  statusEl.textContent = 'Appointment booked for ' + formatDate(data.date) + ' at ' + data.time + '.';
});

// Clear the error state as the user fixes a field
form.addEventListener('input', (e) => {
  if (e.target.name) setError(e.target.name, '');
});

// Cancel one appointment
listEl.addEventListener('click', (e) => {
  const btn = e.target.closest('.appt-cancel');
  if (!btn) return;
  saveAppointments(loadAppointments().filter((a) => a.id !== btn.dataset.id));
  render();
});

// Clear all appointments
clearBtn.addEventListener('click', () => {
  if (confirm('Remove all appointments from this browser?')) {
    saveAppointments([]);
    render();
  }
});

render();
