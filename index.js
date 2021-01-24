const db = require('./db');
const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const moment = require('moment');

const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    windowMs: 2 * 1000,
    max: 3
});

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname,'public')));
app.use( bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

(async ()=>{
    //INSERT
    app.post('/createAtividade', limiter, async (req, res) => {
        res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, content-type");
        const isValid = await validacaoDeEntrada(req.body);
        if(isValid != true) return res.send({res: isValid, status: false});
        if(db.incluiAtividade(req.body)) return res.send({res: 'Atividade incluida!', status: true});
        return res.send({res: 'Atividade não pode ser incluida!', status: false}); 
    });

    //Retorna JSON do ID especifico
    app.post('/getAtividadeApi', limiter, async (req, res) => {
        let response = await db.getListAtividadeApi(req.body.id);
        res.send(response);
    });

    //Pega lista completa
    app.post('/getAtividades', limiter, async (req, res) => {
        let itens = await db.getListAtividades();
        let content ='';
        itens.forEach(item => {
            content = `
            ${content}
            <tr>
                <td class="td-id">${item.id}</td>
                <td class="td-nome">${item.nome}</td>
                <td class="td-atividade">${item.atividade}</td>
                <td class="td-prioridade">${item.prioridade}</td>
                <td class="td-descricao">${item.descricao}</td>
                <td class="td-dtrealizacao">${new Date(item.dtrealizacao).toISOString().split('T')[0].slice(0, 10)}</td>
                <td class="td-acoes"><img src="img/edit.png" onclick="btnEditar(${item.id})"/><img src="img/excluir.png" onclick="btnExcluir(${item.id})"/></td>
            </tr>
            `;
        });
        res.send(content);
    });

    //UPDATE
    app.post('/updateAtividade', limiter, async (req, res) => {
        const isValid = await validacaoDeEntrada(req.body);
        if(isValid != true) return res.send({res: isValid, status: false});
        if(db.updateAtividade(req.body)) return res.send({res: 'Atividade atualizada!', status: true});
        return res.send({res: 'Atividade não pode ser atualizada!', status: false});
    });

    //DELETE
    app.post('/deleteAtividade', limiter, async (req, res) => {
        if(db.deleteAtividade(req.body.id)) return res.send({res: 'Atividade deletada!', status: true});
        return res.send({res: 'Atividade não pode ser deletada!', status: false});
    });
})();

async function validacaoDeEntrada(data){
    const prioridades = ['normal', 'urgente'];
    const tiposAtividades = ['manutencao','documentacao','desenvolvimento'];
    if(data.nome.length < 3) return 'Digite o seu nome';

    if(!tiposAtividades.includes(data.atividade)) return 'Atividade não existe';
    if(!prioridades.includes(data.prioridade)) return 'Prioridade não existe';
    if(!moment(data.dtrealizacao, "YYYY-MM-DD", true).isValid()) return 'Data inválida';
    return true;
}


app.listen(8080, () => console.log(`Server iniciado: http://localhost:8080!`));
