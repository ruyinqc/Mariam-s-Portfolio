/* ==========================================================================
   contact.js — validation, then delivery.

   If a Web3Forms key is set in config.js the message is posted straight to
   Mariam's inbox. If it isn't, the form degrades to a pre-filled mailto:
   rather than pretending to have sent something. A form that silently drops
   a recruiter's message is worse than no form.
   ========================================================================== */

(function () {
  'use strict';

  var form   = document.getElementById('contactForm');
  var status = document.getElementById('formStatus');
  var submit = document.getElementById('formSubmit');
  if (!form) return;

  var cfg = window.SITE || {};
  var ENDPOINT = 'https://api.web3forms.com/submit';

  var RULES = {
    name:    { min: 2,  msg: 'Please tell me your name.' },
    email:   { email: true, msg: 'That email address does not look right.' },
    message: { min: 12, msg: 'A sentence or two about the role or problem, please.' }
  };

  // Deliberately loose: the job of this check is to catch typos, not to
  // adjudicate RFC 5322. The real validation is whether the reply bounces.
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function fieldOf(input) { return input.closest('.field'); }

  function setError(input, msg) {
    var wrap = fieldOf(input);
    var err = wrap.querySelector('.field__err');
    if (msg) {
      wrap.setAttribute('data-invalid', '');
      input.setAttribute('aria-invalid', 'true');
      if (err) { err.textContent = msg; err.hidden = false; }
    } else {
      wrap.removeAttribute('data-invalid');
      input.removeAttribute('aria-invalid');
      if (err) { err.textContent = ''; err.hidden = true; }
    }
  }

  function validateField(input) {
    var rule = RULES[input.name];
    if (!rule) return true;
    var v = input.value.trim();

    if (!v) { setError(input, rule.msg); return false; }
    if (rule.min && v.length < rule.min) { setError(input, rule.msg); return false; }
    if (rule.email && !EMAIL_RE.test(v)) { setError(input, rule.msg); return false; }

    setError(input, '');
    return true;
  }

  function fields() {
    return Object.keys(RULES)
      .map(function (n) { return form.elements[n]; })
      .filter(Boolean);
  }

  // Validate on blur, but once a field has been marked bad, re-check as the
  // visitor types so the error clears the moment it is fixed.
  fields().forEach(function (input) {
    input.addEventListener('blur', function () { validateField(input); });
    input.addEventListener('input', function () {
      if (fieldOf(input).hasAttribute('data-invalid')) validateField(input);
    });
  });

  function say(msg, tone) {
    status.textContent = msg;
    if (tone) status.setAttribute('data-tone', tone);
    else status.removeAttribute('data-tone');
  }

  function mailtoFallback(data) {
    var subject = '[Portfolio] ' + (data.subject || 'Hello') + ' — ' + data.name;
    var lines = [
      data.message, '', '—', data.name, data.email
    ].join('\n');
    var href = 'mailto:' + encodeURIComponent(cfg.email || 'marmaremad31@gmail.com') +
               '?subject=' + encodeURIComponent(subject) +
               '&body=' + encodeURIComponent(lines);
    window.location.href = href;
    say('Opening your email app — press send there and it reaches me.', 'ok');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Honeypot: a real person never fills this in.
    if (form.elements.botcheck && form.elements.botcheck.value) return;

    var all = fields();
    var ok = true;
    // Validate every field, not just up to the first failure, so the visitor
    // sees all the problems at once.
    all.forEach(function (input) { if (!validateField(input)) ok = false; });

    if (!ok) {
      say('Almost — check the highlighted fields.', 'bad');
      var bad = form.querySelector('[data-invalid] input, [data-invalid] textarea');
      if (bad) bad.focus();
      return;
    }

    var data = {
      name:    form.elements.name.value.trim(),
      email:   form.elements.email.value.trim(),
      subject: form.elements.subject ? form.elements.subject.value : '',
      message: form.elements.message.value.trim()
    };

    if (!cfg.web3formsKey) { mailtoFallback(data); return; }

    submit.disabled = true;
    form.classList.add('is-sending');
    say('Sending…');

    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: cfg.web3formsKey,
        subject: '[Portfolio] ' + data.subject + ' — ' + data.name,
        from_name: data.name,
        replyto: data.email,
        name: data.name,
        email: data.email,
        message: data.message
      })
    })
      .then(function (r) { return r.json().catch(function () { return {}; }); })
      .then(function (res) {
        if (res && res.success) {
          form.reset();
          say('Got it — thank you. I reply to everything, usually within a day or two.', 'ok');
        } else {
          throw new Error((res && res.message) || 'Web3Forms rejected the request');
        }
      })
      .catch(function (err) {
        // Never strand the message: hand it to the visitor's mail client.
        console.error('[contact]', err);
        say('That did not go through. Opening your email app instead…', 'bad');
        setTimeout(function () { mailtoFallback(data); }, 900);
      })
      .finally(function () {
        submit.disabled = false;
        form.classList.remove('is-sending');
      });
  });
})();
