const express = require('express');
const path = require('path');
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let categories = {
  "Backhoes": {},
  "Dozers": {}
};
let tools = {}; // tools stored as { id: { model, category, status } }

app.get('/data', (req, res) => res.json({ categories, tools }));

app.post('/add-category', (req, res) => {
  const { name } = req.body;
  if (name && !categories[name]) categories[name] = {};
  res.json({ categories, tools });
});

app.post('/remove-category', (req, res) => {
  const { name } = req.body;
  delete categories[name];
  for (let id in tools) if (tools[id].category === name) delete tools[id];
  res.json({ categories, tools });
});

app.post('/add-tool', (req, res) => {
  const { id, model, category } = req.body;
  if (id && model && category && categories[category] && !tools[id]) {
    tools[id] = { model, category };
    categories[category][id] = true;
  }
  res.json({ categories, tools });
});

app.post('/remove-tool', (req, res) => {
  const { id } = req.body;
  const tool = tools[id];
  if (tool) {
    delete categories[tool.category][id];
    delete tools[id];
  }
  res.json({ categories, tools });
});

app.post('/sign-up', (req, res) => {
  const { id, student } = req.body;
  if (tools[id] && !tools[id].status) {
    tools[id].status = { student, time: new Date().toISOString() };
  }
  res.json({ categories, tools });
});

app.post('/red-tag', (req, res) => {
  const { id } = req.body;
  if (tools[id]) tools[id].status = 'redtagged';
  res.json({ categories, tools });
});

app.post('/clear-signups', (req, res) => {
  for (let id in tools) {
    if (tools[id].status && tools[id].status !== 'redtagged') delete tools[id].status;
  }
  res.json({ categories, tools });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
