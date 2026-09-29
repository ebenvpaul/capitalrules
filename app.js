const state = { frequency: 'monthly', salary: 50000, hasHomeLoan: true };
const $ = (id) => document.getElementById(id);
const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const format = (value) => inr.format(Math.round(value));
const calc = () => {
  const monthly = state.frequency === 'annual' ? state.salary / 12 : state.salary;
  const annual = state.frequency === 'annual' ? state.salary : state.salary * 12;
  const emiRate = state.hasHomeLoan ? .36 : .20;
  return { monthly, annual, corpus: annual * 33, emergency: annual * .33, car: annual * .75, house: annual * 5, phoneIdeal: monthly, phoneMax: monthly * 2, health: monthly * .10, investment: monthly * .20, rent: monthly * .25, lifestyleMin: monthly * .10, lifestyleMax: monthly * .15, emi: monthly * emiRate, emiRate, livingRate: 1 - .20 - .10 - .15 - emiRate, living: monthly * (1 - .20 - .10 - .15 - emiRate) };
};
function render(syncControls = true) {
  const r = calc();
  if (syncControls) {
    $('salary-input').value = Math.round(state.salary);
    $('salary-slider').value = Math.min(Math.max(state.salary, 20000), 2000000);
  }
  $('frequency-label').textContent = state.frequency === 'annual' ? '/ year' : '/ month';
  $('house-budget').textContent = format(r.house); $('car-budget').textContent = format(r.car);
  $('corpus-value').textContent = format(r.corpus); $('emergency-value').textContent = format(r.emergency); $('rent-value').textContent = format(r.rent);
  $('phone-ideal').textContent = format(r.phoneIdeal); $('phone-max').textContent = format(r.phoneMax);
  $('monthly-total').textContent = Math.round(r.monthly).toLocaleString('en-IN'); $('investment-value').textContent = format(r.investment); $('health-value').textContent = format(r.health); $('lifestyle-value').textContent = `${format(r.lifestyleMin)}–${format(r.lifestyleMax)}`; $('emi-value').textContent = format(r.emi); $('emi-percent').textContent = `${r.emiRate * 100}%`; $('living-percent').textContent = `${Math.round(r.livingRate * 100)}%`; $('living-value').textContent = format(r.living); $('emi-label').textContent = state.hasHomeLoan ? 'With home loan' : 'Without home loan';
  $('bar-investment').style.width = '20%'; $('bar-health').style.width = '10%'; $('bar-lifestyle').style.width = '15%'; $('bar-emi').style.width = `${r.emiRate * 100}%`; $('bar-living').style.width = `${r.livingRate * 100}%`;
  renderVerdict(); renderCashflow();
}
function renderCashflow() {
  const r = calc(); const rent = Number($('rent-input').value) || 0; const emi = Number($('emi-input').value) || 0;
  const rentSafe = rent <= r.rent; const emiSafe = emi <= r.emi;
  $('rent-check').dataset.status = rentSafe ? 'safe' : 'over'; $('emi-check').dataset.status = emiSafe ? 'safe' : 'over';
  $('rent-check-copy').textContent = rentSafe ? `Within the 25% ceiling · ${format(r.rent)} max` : `Above the 25% ceiling · ${format(r.rent)} max`;
  $('emi-check-copy').textContent = emiSafe ? `Within the ${r.emiRate * 100}% cap · ${format(r.emi)} max` : `Above the ${r.emiRate * 100}% cap · ${format(r.emi)} max`;
  $('rent-check-value').textContent = format(rent); $('emi-check-value').textContent = format(emi);
}
function getPurchaseRule(metrics, category) {
  const rules = {
    phone: { ideal: metrics.phoneIdeal, hard: metrics.phoneMax, label: '1× monthly' },
    car: { ideal: metrics.car, hard: metrics.car * 1.2, label: '0.75× annual' },
    house: { ideal: metrics.house, hard: metrics.house * 1.15, label: '5× annual' },
    custom: { ideal: metrics.monthly, hard: metrics.monthly * 2, label: '1× monthly' }
  };
  return rules[category] || rules.phone;
}
function renderVerdict() {
  const r = calc(); const purchase = $('purchase-category'); const category = purchase.selectedOptions?.[0]?.value || purchase.value || 'phone'; const price = Number($('purchase-input').value) || 0;
  const rule = getPurchaseRule(r, category); const verdict = $('verdict'); let status = price <= rule.ideal ? 'safe' : price <= rule.hard ? 'stretch' : 'over';
  verdict.dataset.status = status;
  const content = { safe: ['Optimal zone', 'A comfortable yes.', 'This purchase stays inside your ideal wealth parameter.', '✓'], stretch: ['Stretch zone', 'A considered maybe.', 'This purchase is possible, but it will pull against another financial priority.', '△'], over: ['Overleveraged', 'Not yet.', 'This purchase exceeds the salary ratio designed to protect your future flexibility.', '×'] }[status];
  $('verdict-kicker').textContent = content[0]; $('verdict-title').textContent = content[1]; $('verdict-copy').textContent = content[2]; $('verdict-symbol').textContent = content[3]; const thresholdLabel = $('verdict-threshold-label'); if (thresholdLabel) thresholdLabel.textContent = `Ideal · ${rule.label}`; const threshold = $('verdict-threshold') || document.querySelector('#verdict .verdict-metric strong'); if (threshold) threshold.textContent = format(rule.ideal);
}
document.querySelectorAll('[data-frequency]').forEach((button) => button.addEventListener('click', () => { state.frequency = button.dataset.frequency; document.querySelectorAll('[data-frequency]').forEach((item) => item.classList.toggle('active', item === button)); render(); }));
$('salary-input').addEventListener('input', (event) => { const value = Number(event.target.value); if (value > 0) { state.salary = value; render(false); } });
$('salary-slider').addEventListener('input', (event) => { state.salary = Number(event.target.value); render(); });
$('home-loan').addEventListener('change', (event) => { state.hasHomeLoan = event.target.checked; render(); });
$('purchase-category').addEventListener('change', renderVerdict); $('purchase-category').addEventListener('input', renderVerdict); $('purchase-input').addEventListener('input', renderVerdict);
$('rent-input').addEventListener('input', renderCashflow); $('emi-input').addEventListener('input', renderCashflow);
render();
