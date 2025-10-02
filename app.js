const views = document.querySelectorAll('.view');
const navButtons = document.querySelectorAll('.nav-btn');

function showView(id) {
  views.forEach(v => v.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

// Navegación
navButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.getAttribute('data-target');
    showView(target);
  });
});

// Datos
let movimientos = JSON.parse(localStorage.getItem('movimientos')) || [];
let presupuesto = JSON.parse(localStorage.getItem('presupuesto')) || 0;

// Guardar movimientos
function guardarMovimientos() {
  localStorage.setItem('movimientos', JSON.stringify(movimientos));
  renderMovimientos();
  renderDashboard();
}

// Renderizar lista de movimientos
function renderMovimientos() {
  const lista = document.getElementById('lista-movimientos');
  lista.innerHTML = '';
  movimientos.forEach((m, i) => {
    const li = document.createElement('li');
    li.className = 'bg-gray-800 p-2 rounded flex justify-between';
    li.innerHTML = `<span>${m.tipo} - ${m.categoria} - $${m.monto}</span>
      <button onclick="eliminarMovimiento(${i})" class="text-red-400">x</button>`;
    lista.appendChild(li);
  });
}

function eliminarMovimiento(i) {
  movimientos.splice(i, 1);
  guardarMovimientos();
}

// Añadir movimiento
document.getElementById('btn-add').addEventListener('click', () => {
  const tipo = prompt("Tipo (Ingreso/Gasto):");
  const categoria = prompt("Categoría:");
  const monto = parseFloat(prompt("Monto:"));
  if (!isNaN(monto)) {
    movimientos.push({tipo, categoria, monto});
    guardarMovimientos();
  }
});

// Presupuesto
document.getElementById('btn-guardar-presupuesto').addEventListener('click', () => {
  const val = parseFloat(document.getElementById('presupuesto-input').value);
  if (!isNaN(val)) {
    presupuesto = val;
    localStorage.setItem('presupuesto', JSON.stringify(presupuesto));
    renderPresupuesto();
  }
});

function renderPresupuesto() {
  const div = document.getElementById('presupuesto-info');
  const gastos = movimientos.filter(m => m.tipo.toLowerCase() === 'gasto').reduce((a, b) => a + b.monto, 0);
  div.textContent = `Gastado: $${gastos} de $${presupuesto}`;
}

// Dashboard
function renderDashboard() {
  const resumen = document.getElementById('resumen');
  resumen.innerHTML = '';
  const ingresos = movimientos.filter(m => m.tipo.toLowerCase() === 'ingreso').reduce((a, b) => a + b.monto, 0);
  const gastos = movimientos.filter(m => m.tipo.toLowerCase() === 'gasto').reduce((a, b) => a + b.monto, 0);
  resumen.innerHTML = `<p>Ingresos: $${ingresos}</p><p>Gastos: $${gastos}</p>`;

  const ctx = document.getElementById('chartCategorias').getContext('2d');
  const porCategoria = {};
  movimientos.filter(m => m.tipo.toLowerCase() === 'gasto').forEach(m => {
    porCategoria[m.categoria] = (porCategoria[m.categoria] || 0) + m.monto;
  });

  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: Object.keys(porCategoria),
      datasets: [{
        data: Object.values(porCategoria),
        backgroundColor: ['#f87171','#60a5fa','#34d399','#fbbf24','#a78bfa','#f472b6']
      }]
    }
  });
}

// Exportar a Excel (CSV simple)
document.getElementById('btn-exportar').addEventListener('click', () => {
  let csv = "Tipo,Categoría,Monto\n";
  movimientos.forEach(m => {
    csv += `${m.tipo},${m.categoria},${m.monto}\n`;
  });
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "finanzas.csv";
  a.click();
});

// Backup
document.getElementById('btn-backup').addEventListener('click', () => {
  const backup = { movimientos, presupuesto };
  const blob = new Blob([JSON.stringify(backup)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "backup.json";
  a.click();
});

// Init
renderMovimientos();
renderPresupuesto();
renderDashboard();
