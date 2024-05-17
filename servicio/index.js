//Agrego las librerias
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json()

const nuevaBaseDeDatos = new sqlite3.Database('./base.sqlite3', 
  (err) => {
    if (err) {
        console.error(err.message);
        return;        
    }

    console.log('Sin errores, concectado correctamente a SQLite.');

    nuevaBaseDeDatos.run(
      `CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        todo TEXT NOT NULL,
        created_at INTEGER
        )`
    ,(err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('La tabla se a creado correctamente o ya existia.');
        }
    });
});



//De acuerdo con su documentacion se tiene que crear un objeto de tipo express
const app = express()

/*
  Para comprobar que todo esta en orden implemento una funcion llamada listen 
  del objeto app
*/
app.listen(3001, () => {
  console.log(`Servidor funcionando correctamente y escuchando en el puerto 3001`);
});

/*
  Para comprobar que los endpoints este funcionando creo uno de tipo get con 
  un mensaje que contiene un saludo
*/
app.get("/api", (req, res) => {
  res.json({ message: "Saludos, el servidor a recibido tu solicitud!" });
});

/*
  Creo un endpoint (insert) de tipo POST donde recibo el contenido del cuerpo de
  la peticion y lo guardo en una constante llamada: "todo", en formato JSON, 
  despues hago una validacion si la variable todo contiene un valor y es 
  difetente de un status 400 continuo de lo contrario envio un mensaje de error
  al cliente y termino la ejecucion, despues creo un constante llamada 
  declaracionPreparada, donde uso una funcion llamada prepare() para preparar 
  un insercion a la base de datos con el contenido del cuerpo de la peticion 
  posteriormente ejecuto la instruccion con ayuda de run() y cacho los errores 
  si existieran para notificarselos al servidor de igual manera si todo funciona
  bien tambien doy aviso al servidor por ultimo finalizo la intruccion y envio 
  la respues al cliente con codigo 201 para informarle que todo ha salido bien 
  y la informacion fue guardada correctamente.
*/

app.post('/insert', jsonParser, function (req, res) {    
    const { todo } = req.body;
    res.setHeader('Content-Type', 'application/json');
    if (!todo) {
        res.status(400).send('La informacion enviada es insuficiente o erronea');
        return;
    }
    const declaracionPreparada  =  nuevaBaseDeDatos.prepare(
      'INSERT INTO todos (todo, created_at) VALUES (?, CURRENT_TIMESTAMP)'
      );
    declaracionPreparada.run(todo,
      (err) => {
        if (err) {
          console.error("Error en la ejecucion:", err);
          res.status(500).send(err);
          return;
        } else {
          console.log("La informacion fue insertada correctamente");
        }
    });
    declaracionPreparada.finalize();
    res.setHeader('Content-Type', 'application/json');
    res.status(201).send(JSON.stringify({ 'status': 'Informacion guardada con exito'}));
})