async function connect(){
    if(global.connection && global.connection.state !== 'disconnected')
        return global.connection;

    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection({
        host:'localhost',
        user: 'root',
        password: '',
        database: 'teleworldtestedb'
    });
    global.connection = connection;
    return connection;
}
connect();

async function incluiAtividade(data){
    const con = await connect();
    const queryStr = `INSERT INTO atividades(nome, atividade, prioridade, descricao, dtrealizacao) VALUES (?,?,?,?,?)`;
    const values = [data.nome, data.atividade, data.prioridade, data.descricao, data.dtrealizacao]; 
    await con.query(queryStr, values)

    return true;
}

async function updateAtividade(data){
    const con = await connect();
    const queryStr = 'UPDATE atividades SET nome=?, atividade=?, prioridade=?, descricao=?, dtrealizacao=? WHERE id=?';
    const values = [data.nome, data.atividade, data.prioridade, data.descricao, data.dtrealizacao, data.id];
    await con.query(queryStr, values);

    return true;
}

async function getListAtividadeApi(id){
    const con = await connect();
    const queryStr = 'SELECT * FROM atividades WHERE id=?';
    const [row] = await con.query(queryStr, [id]);
    return row;
}

async function getListAtividades(){
    const con = await connect();
    const [rows] = await con.query('SELECT * FROM atividades');
    return rows;
}

async function deleteAtividade(id){
    const con = await connect();
    const queryStr = 'DELETE FROM atividades WHERE id=?';
    await con.query(queryStr, [id]);
}

process.on('beforeExit', async ()=>{
    const con = await connect();
    con.end();
});

module.exports = {
    getListAtividadeApi,
    getListAtividades,
    incluiAtividade,
    updateAtividade,
    deleteAtividade
};