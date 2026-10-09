// DaanthSeva - contact form (front-end only demo)

const contactForm = document.getElementById('contactForm');
const contactStatus = document.getElementById('contactStatus');

function setContactError(id, message) {
  const input = document.getElementById(id);
  const errorEl = contactForm.querySelector('[data-for="' + id + '"]');
  errorEl.textContent = message;
  input.classList.toggle('invalid', Boolean(message));
}

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  contactStatus.textContent = '';

  const name = document.getElementById('cname').value.trim();
  const email = document.getElementById('cemail').value.trim();
  const message = document.getElementById('cmessage').value.trim();

  const nameBad = name.length < 2;
  const emailBad = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const msgBad = message.length < 5;

  setContactError('cname', nameBad ? 'Enter your name.' : '');
  setContactError('cemail', emailBad ? 'Enter a valid email address.' : '');
  setContactError('cmessage', msgBad ? 'Write a short message.' : '');

  if (nameBad || emailBad || msgBad) return;

  // No server yet: this just confirms to the visitor.
  contactForm.reset();
  contactStatus.textContent = 'Thanks, ' + name + '. We received your message and will reply soon.';
});
