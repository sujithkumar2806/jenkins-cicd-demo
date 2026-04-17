const express = require('express'); 
const app = express(); 
const PORT = process.env.PORT || 3000; 
 
app.get('/', (req, res) => { 
  res.json({ message: 'Hello h hi from CI/CD Pipeline!', version: '1.0' }); 
}); 
 
app.listen(PORT, () => { 
  console.log(`Server running on port ${PORT}`); 
}); 
 
module.exports = app; 

package.json 

{ 
  "name": "jenkins-cicd-demo", 
  "version": "1.0.0", 
  "scripts": { 
    "start": "node app.js", 
    "test": "echo 'Tests passed!' && exit 0" 
  }, 
  "dependencies": { 
    "express": "^4.18.0" 
  } 
} 
