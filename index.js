// Importer les modules nécessaires
const express = require('express');
const bodyParser = require('body-parser');

// Créer une instance de l'application Express
const app = express();
const PORT = 3000;

// Middleware pour analyser le corps des requêtes en JSON
app.use(bodyParser.json());


// Variable pour stocker les éléments
let items = [];

// Endpoint pour ajouter un nouvel élément (POST)
app.post('/items', (req, res) => {
  const newItem = req.body;

  // Vérification de la présence d'un id et d'un name
  if (!newItem || !newItem.id || !newItem.name) {
    return res.status(400).json({ message: 'Bad Request: Missing id or name' }); // 400: Bad Request
  }

  items.push(newItem);
  res.status(201).json(newItem); // 201: Created
});

// Endpoint pour récupérer tous les éléments (GET)
app.get('/items', (req, res) => {
  res.json(items); // Retourner tous les éléments
});

// Endpoint pour récupérer un élément par ID (GET)
app.get('/items/:id', (req, res) => {
  const itemId = parseInt(req.params.id, 10); // Convertir l'ID en entier
  const item = items.find(i => i.id === itemId);
  
  if (!item) {
    return res.status(404).json({ message: 'Item not found' }); // 404: Not Found
  }
  
  res.json(item); // Retourner l'élément trouvé
});

// Endpoint pour mettre à jour un élément existant (PUT)
app.put('/items/:id', (req, res) => {
  const itemId = parseInt(req.params.id, 10);
  const itemIndex = items.findIndex(i => i.id === itemId);
  
  if (itemIndex === -1) {
    return res.status(404).json({ message: 'Item not found' }); // 404: Not Found
  }
  
  const updatedItem = { ...items[itemIndex], ...req.body }; // Fusionner les données existantes avec les nouvelles
  items[itemIndex] = updatedItem; // Mettre à jour l'élément
  res.json(updatedItem); // Retourner l'élément mis à jour
});

// Endpoint pour supprimer un élément (DELETE)
app.delete('/items/:id', (req, res) => {
  const itemId = parseInt(req.params.id, 10);
  const itemIndex = items.findIndex(i => i.id === itemId);
  
  if (itemIndex === -1) {
    return res.status(404).json({ message: 'Item not found' }); // 404: Not Found
  }
  
  items.splice(itemIndex, 1); // Supprimer l'élément du tableau
  res.status(204).send(); // 204: No Content
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
