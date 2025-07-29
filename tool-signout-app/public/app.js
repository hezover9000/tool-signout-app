let isAdmin = false;

async function loadAll() {
  const res = await fetch('/data');
  const { categories, tools } = await res.json();

  const catSelect = document.getElementById('toolCategory');
  catSelect.innerHTML = '';
  Object.keys(categories).forEach(name => {
    const opt = document.createElement('option');
    opt.value = name; opt.textContent = name;
    catSelect.appendChild(opt);
  });

  const container = document.getElementById('categoryArea');
  container.innerHTML = '';
  const signList = document.getElementById('signoutLog');
  signList.innerHTML = '';
  const log = [];

  Object.entries(categories).forEach(([catName, toolIDs]) => {
    const div = document.createElement('div');
    div.className = 'category';
    div.innerHTML = `<h4>${catName}</h4>`;
    Object.keys(toolIDs).forEach(id => {
      const tool = tools[id];
      const btn = document.createElement('button');
      btn.className = 'tool-btn';
      btn.textContent = `${id} – ${tool.model}`;
      if (tool.status === 'redtagged') {
        btn.classList.add('redtag');
        btn.disabled = true;
      } else if (tool.status) {
        btn.classList.add('signed');
        btn.disabled = true;
      } else {
        btn.addEventListener('click', () => signUp(id));
      }
      div.appendChild(btn);
      if (tool.status && tool.status !== 'redtagged') {
        log.push({ id, model: tool.model, ...tool.status });
      }
    });
    container.appendChild(div);
  });

  log.sort((a,b)=>new Date(a.time) - new Date(b.time))
     .forEach(entry =>{
       const li = document.createElement('li');
       const t = new Date(entry.time);
       li.textContent = `${entry.id} – ${entry.model} | ${entry.student} @ ${t.toLocaleTimeString([], {hour:'numeric', minute:'2-digit', hour12:true})}`;
       signList.appendChild(li);
     });
}

async function signUp(id) {
  const student = document.getElementById('studentName').value.trim();
  if (!student) return alert('Enter your name first.');
  await fetch('/sign-up',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id, student})});
  loadAll();
}

function adminCheck() {
  if (document.getElementById('adminPass').value === 'admin123') {
    isAdmin = true;
    document.getElementById('adminControls').style.display = 'block';
  } else {
    isAdmin = false;
    document.getElementById('adminControls').style.display = 'none';
  }
}

async function addCategory() {
  const name = document.getElementById('newCat').value.trim();
  await fetch('/add-category',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name})});
  loadAll();
}

async function removeCategory() {
  const name = document.getElementById('rmCat').value.trim();
  await fetch('/remove-category',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name})});
  loadAll();
}

async function addTool() {
  const id = document.getElementById('newToolId').value.trim();
  const model = document.getElementById('newToolModel').value.trim();
  const category = document.getElementById('toolCategory').value;
  if (!id || !model || !/^[A-Za-z0-9]{1,7}$/.test(id)) return alert('Invalid ID or model.');
  await fetch('/add-tool',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id, model, category})});
  loadAll();
}

async function removeTool() {
  const id = document.getElementById('removeToolId').value.trim();
  await fetch('/remove-tool',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})});
  loadAll();
}

async function clearAll() {
  await fetch('/clear-signups',{method:'POST'});
  loadAll();
}

document.getElementById('adminPass').addEventListener('input', adminCheck);

window.onload = loadAll;
