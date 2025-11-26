const { restoreTextDirection } = require('chart.js/helpers');
const mysql = require('mysql2');

const db = mysql.createConnection({
    host:'mysql36-farm1.kinghost.net',
    user:'aedrehc10',
    password:'bioeng1',
    database:'aedrehc10',
});

db.connect((err) => {
    if (err){
        console.error('Erro ao conectar:', err);
        return;
    }
    console.log('MySql conectado com sucesso!')
});

module.exports = db;